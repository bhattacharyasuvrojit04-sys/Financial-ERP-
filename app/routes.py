import json
import os
import shutil
import copy
from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.AI.analyzer import analyze_financial_document
from app.AI.assumption import generate_assumptions
from app.AI.chunker import chunk_text
from app.AI.embeddings import create_embeddings
from app.AI.parser import extract_pdf_text
from app.AI.vector_store import store_embeddings
from app.service.financial_commentary import generate_commentary
from app.service.financial_extractor import extract_financial_metrics
from app.service.peer_benchmark import generate_peer_analysis
from app.service.pitchdeck_generator import generate_pitch_deck
from app.service.ppt_generator import built_pitch_deck
from app.service.ratio_engine import calculate_document_ratios
from app.Project_Finance.project_finance import ProjectInput
from app.Project_Finance.project_statement import build_project_statement
from app.Project_Finance.asset_schedule import build_asset_schedule
from app.Project_Finance.returns import calculate_project_returns
from app.Project_Finance.project_finance_excel import build_project_finance_excel
from app.Project_Finance.dcf import calculate_project_dcf
from app.Project_Finance.Project import *
from .db import SessionLocal
from .schemas import *
from .models import *
from .services import (
    apply_periodic_report,
    calculate_ratios,
    forecast_linear,
    forecast_moving_average,
    get_period_range,
    create_transaction,
    get_pnl,
    apply_depreciation,
    get_ebitda,
    get_cash_flow,
    get_balance_sheet,
    create_invoice,
    get_time_series,
    pay_invoice,get_pnl_periodic, get_pnl_hierarchy, forecast_growth, save_driver, forecast_driver_model, fix_cash_account_type, calculate_dcf, dcf_sensitivity,monte_carlo_dcf, generate_financial_report, ACCOUNT_GROUPS, get_on_create_account,post_journal_entry
)

from fastapi.responses import StreamingResponse



router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/transaction/Period")
def get_transaction_period(period: str = Query(...), db:Session = Depends(get_db)):
    start , end = get_period_range(period)
    entries = db.query(JournalEntry).filter(JournalEntry.created_at >= start, JournalEntry.created_at <= end).all()

    result = []
    for e in entries:
        lines = db.query(JournalLine).filter(JournalLine.entry_id == e.id).all()

        result.append({
            "entry_id": e.id,
            "description": e.description,
            "date": e.created_at,
            "lines": [
                {
                    "account_id": l.account_id,
                    "debit": l.debit,
                    "credit": l.credit
                } for l in lines
            ]
        
        })
    return result

@router.post("/transaction")
def add_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction(db, data.description, data.amount, data.date)

@router.delete("/transaction/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == transaction_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.query(JournalLine).filter(JournalLine.entry_id == transaction_id).delete()

    db.delete(entry)
    db.commit()

    return {"message": "Transaction deleted successfully"}

@router.get("/transactions")
def get_transactions (db:Session = Depends(get_db)):
    entries = db.query(JournalEntry).all()
    result = []

    for e in entries:
        lines = db.query(JournalLine).filter(JournalLine.entry_id == e.id).all()
        amount = sum(l.debit for l in lines)

        result.append({
            "id": e.id,
            "date": e.created_at,
            "description": e.description,
            "amount": amount
        })
    return result

@router.post("/learn")
def learn_rule(data: RuleCreate, db: Session = Depends(get_db)):
    rule = Rule(
        keyword = data.keyword.strip().lower(),
        category = data.category.strip().lower()
    )
    db.add(rule)
    db.commit()
    return{"msg": "Learned"}

# ============================================================
# ACCOUNT MASTER
# ============================================================

@router.post("/accounts")
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db)
):

    try:

        account = get_on_create_account(
            db,
            data.name,
            data.group_name
        )

        return {
            "id": account.id,
            "name": account.name,
            "type": account.type,
            "group_name": account.group_name,
            "normal_balance": account.normal_balance
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# ============================================================
# JOURNAL ENTRY
# ============================================================

@router.post("/journal")
def create_journal(
    data: JournalEntryCreate,
    db: Session = Depends(get_db)
):

    try:

        lines = [
            {
                "account_id": line.account_id,
                "debit": line.debit,
                "credit": line.credit
            }
            for line in data.lines
        ]

        entry_date = (
            datetime.fromisoformat(data.date)
            if data.date
            else None
        )

        entry = post_journal_entry(
            db,
            data.description,
            lines,
            entry_date
        )

        return {
            "message": "Journal entry posted",
            "entry_id": entry.id
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# ============================================================
# LIST ACCOUNTS
# ============================================================

@router.get("/accounts")
def get_accounts(
    db: Session = Depends(get_db)
):

    accounts = (
        db.query(Account)
        .order_by(Account.group_name, Account.name)
        .all()
    )

    return [
        {
            "id": account.id,
            "name": account.name,
            "type": account.type,
            "group_name": account.group_name,
            "normal_balance": account.normal_balance
        }
        for account in accounts
    ]

@router.get("/forecast")
def forecast(mode: str = "revenue", method: str = "linear", period:str = "monthly", db:Session = Depends(get_db)):
    series = get_time_series(db, mode, period)

    if method == "linear":
        next_val =  forecast_linear(series)
    elif method == "average":
        next_val = forecast_moving_average(series)
    elif method == "growth":
        next_val = forecast_growth(series)
    else:
        next_val = 0
    return {
        "history": series,
        "forecast": next_val
    }

@router.get("/pnl")
def pnl(use_driver:bool = False, mode: str = None, period: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    if mode == "hierarchy":
        return get_pnl_hierarchy(db)
    if period:
        return apply_periodic_report(db, period, get_pnl)
    elif start_date and end_date:
        start_date = datetime.fromisoformat(start_date)
        end_date = datetime.fromisoformat(end_date)
    else:
        start_date = None
        end_date = None
    return get_pnl(db, start_date, end_date, use_driver)

@router.post("/drivers")
def create_driver(data: DriverCreate, db:Session = Depends(get_db)):
    return save_driver(db, data)

@router.get("/forecast/driver")
def driver_forecast(periods: int = 12, db: Session = Depends(get_db)):
    return forecast_driver_model(db, periods)

@router.post("/depreciation")
def depreciation(
    request: DepreciationRequest,
    db: Session = Depends(get_db)
):
    return apply_depreciation(
        db,
        request.asset_name,
        request.amount
    )


@router.get("/ebitda")
def ebitda(db:Session = Depends(get_db)):
    return get_ebitda(db)

@router.get("/cashflow")
def cashflow(period: str = None, start_date: str = None, end_date: str = None, db:Session = Depends(get_db)):
    if period:
        return apply_periodic_report(db, period, get_cash_flow)
    return get_cash_flow(db, start_date, end_date)

@router.get("/balance-sheet")
def balance_Sheet(period: str = None, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    if period:
        result = apply_periodic_report(db, period, get_balance_sheet)
        print("\nPERIODIC RESULT:")
        print(result)
        print("\n")
        return result
    result =  get_balance_sheet(db, start_date, end_date)
    print("\nNORMAL RESULT:")
    print(result)
    print("\n")
    return result

@router.post("/customer")
def create_customer(data: CustomerCreate, db:Session = Depends(get_db)):
    customer = Customer(name = data.name)
    db.add(customer)
    db.commit()
    return {"msg": "Customer created"}

@router.post("/invoice")
def invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    return create_invoice(db, data.customer_id, data.amount)


@router.post("/invoice/pay/{invoice_id}")
def pay(invoice_id: int, db: Session = Depends(get_db)):
    return pay_invoice(db, invoice_id)
    

@router.get("/reports")
def get_reports(
    period: str,
    db: Session = Depends(get_db)
):
    start, end = get_period_range(period)

    return {
        "pnl": get_pnl(db, start, end),
        "balance_sheet": get_balance_sheet(db, start, end),
        "cash_flow": get_cash_flow(db, start, end)
    }


@router.get("/debug")
def debug(db: Session = Depends(get_db)):
    from .models import Account, JournalLine

    accounts = db.query(Account).all()
    lines = db.query(JournalLine).all()

    return {
        "accounts": [
            {"name": a.name, "type": a.type} for a in accounts
        ],
        "lines": [
            {"account_id": l.account_id, "debit": l.debit, "credit": l.credit}
            for l in lines
        ]
    }   

@router.get("/fix-cash")
def fix_cash(db: Session = Depends(get_db)):
    return fix_cash_account_type(db)

@router.get("/kpi")
def kpi(db: Session = Depends(get_db)):
    pnl = get_pnl(db)
    ebitda_data = get_ebitda(db)   # ✅ CALL the function

    revenue = pnl["summary"]["operating_income"]
    profit = pnl["summary"]["profit"]
    expense = pnl["summary"]["operating_expense"]
    ebitda = ebitda_data["ebitda"]  # ✅ extract value

    ebitda_margin = (ebitda / revenue * 100) if revenue != 0 else 0

    return {
        "revenue": revenue,
        "net_profit": profit,
        "expense": expense,
        "ebitda": ebitda,
        "ebitda_margin": ebitda_margin
    }

@router.post("/dcf")
def run_dcf(data: DCFIput):
    result = calculate_dcf(data)
    return result

@router.post("/dcf/sensitivity")
def dcf_sensitivity_api(data: DCFIput):
    return dcf_sensitivity(data)

@router.post("/dcf/monte-carlo")
def monte_carlo_api(data: DCFIput):
    return monte_carlo_dcf(data)

@router.get("/ratios")
def ratios(db: Session = Depends(get_db)):
    return calculate_ratios(db)

@router.get("/ai-insights")
def ai_insights(db: Session = Depends(get_db)):
    return generate_financial_report(db)

### =============AI ENDPOINTS =============
@router.post("/ai/upload-financial-doc")
async def upload_financial_doc(file: UploadFile = File(...)):

    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # STEP 1 — EXTRACT TEXT
    text = extract_pdf_text(file_path)
   

    # STEP 2 — CHUNK
    chunks = chunk_text(text)

    # STEP 3 — EMBEDDINGS
    embeddings = create_embeddings(chunks)

    # STEP 4 — STORE
    store_embeddings(chunks, embeddings)

    # STEP 5 — GPT ANALYSIS
    metrics = extract_financial_metrics(text)
    ratio = calculate_document_ratios(metrics)

    # STEP 6 — ASSUMPTIONS
    commentary = generate_commentary(ratio)

    return {
         "status": "success",
        "metrics": metrics,
        "ratios": ratio,
        "commentary": commentary
    }

@router.post("/ai/peer-benchmark")
def peer_benchmark(data: BenchmarkInput):

    print("\n===== BENCHMARK INPUT =====")
    print(data.model_dump())
    print("===========================\n")

    result = generate_peer_analysis(
        data.assumptions
    )

    print("\n===== BENCHMARK OUTPUT =====")
    print(result)
    print("============================\n")

    return result

@router.post("/ai/pitch-deck")
async def pitch_deck(file: UploadFile = File(...)):

    content = await file.read()

    with open(
        f"temp_{file.filename}", "wb"
    ) as f:
        f.write(content)

    text = extract_pdf_text(f"temp_{file.filename}")

    ai_result = generate_pitch_deck(text)

    deck_data = json.loads(ai_result)

    ppt_file = built_pitch_deck(
        deck_data,
        "pitch_deck.pptx"
    )

    return {
        "status": "success",
        "ppt_file": ppt_file
    }

@router.post("/project-finance/statements")
def project_statements(project: ProjectInput):

    result = build_project_statement(project)

    asset_schedule = build_asset_schedule(project)

    result["asset_schedule"] = asset_schedule

    returns = calculate_project_returns(project, result)
    result["returns"] = returns

    dcf = calculate_project_dcf(project, result)
    result["dcf_valuation"] = dcf

    return result

@router.post("/project-finance/project")
def save_project(
    project: ProjectInput,
    db: Session = Depends(get_db)
):

    db_project = Project(


    name=project.name,
    project_type=project.project_type,

    project_life=project.project_life,

    tax_rate=project.tax_rate,
    discount_rate=project.discount_rate,

    debt_amount=project.debt_amount,
    interest_rate=project.interest_rate,
    loan_tenor=project.loan_tenor,

    moratorium_months=project.moratorium_months,
    repayment_frequency=project.repayment_frequency,
    repayment_type=project.repayment_type,
    interest_type=project.interest_type,
    interest_capitalized=project.interest_capitalized,

    depreciation_years=project.depreciation_years

    )

    db.add(db_project)

    db.commit()

    db.refresh(db_project)
#============Revenue====================
    for item in project.revenue_items:

        db.add(
            RevenueItem(
                project_id=db_project.id,

                name=item.name,
                revenue_type=item.revenue_type,

                growth_rate=item.growth_rate,
                amount=item.amount,

                capacity_mw=item.capacity_mw,
                operating_hours=item.operating_hours,
                cuf=item.cuf,

                tariff=item.tariff,
                tariff_escalation=item.tariff_escalation,

                degradation_rate=item.degradation_rate,

                rooms=item.rooms,
                occupancy_pct=item.occupancy_pct,
                adr=item.adr
            )
        )

    # ============= COGS ====================

    for item in project.cogs_items:

        db.add(
            COGSItem(
                project_id=db_project.id,

                name=item.name,
                cogs_type=item.cogs_type,

                amount=item.amount,
                growth_rate=item.growth_rate,

                cost_per_kwh=item.cost_per_kwh,
                cost_per_room=item.cost_per_room
            )
        )
#=============Opex==============================
    for item in project.opex_items:

        db.add(
            OpexItem(
                project_id=db_project.id,

                name=item.name,
                amount=item.amount,

                escalation_rate=item.escalation_rate
            )
        )

    # ==========================
    # Fixed Asset Register
    # ==========================

    for asset in project.fixed_assets:

        db.add(

            FixedAsset(

                project_id=db_project.id,

                asset_name=asset.asset_name,

                asset_category=asset.asset_category,

                purchase_year=asset.purchase_year,

                depreciation_start_year=asset.depreciation_start_year,

                purchase_cost=asset.purchase_cost,

                useful_life=asset.useful_life,

                depreciation_method=asset.depreciation_method,

                salvage_value=asset.salvage_value,

                opening_cost=asset.opening_cost,

                purchase_amount=asset.purchase_amount,

                sale_amount=asset.sale_amount,

                opening_acc_dep=asset.opening_acc_dep,

                sale_year=asset.sale_year,

                asset_status=asset.asset_status,

                is_land=asset.is_land,

                notes=asset.notes

            )

        )

    for item in project.asset_items:

        db.add(
            AssetItem(
                project_id=db_project.id,

                name=item.name,
                amount=item.amount,

                growth_rate=item.growth_rate,
                asset_type=item.asset_type
            )
        )

    for item in project.liability_items:

        db.add(
            LiabilityItem(
                project_id=db_project.id,

                name=item.name,
                amount=item.amount,

                growth_rate=item.growth_rate
            )
        )

    for item in project.equity_items:

        db.add(
            EquityItem(
                project_id=db_project.id,

                name=item.name,
                amount=item.amount,

                growth_rate=item.growth_rate
            )
        )

    db.add(
        WorkingCapital(
            project_id=db_project.id,

            receivable_days=
                project.working_capital.receivable_days,

            payable_days=
                project.working_capital.payable_days,

            inventory_days=
                project.working_capital.inventory_days
        )
    )

    for item in project.debt_drawdowns:

        db.add(

            DebtDrawdown(

                project_id=
                    db_project.id,

                year=item.year,

                drawdown_amount=
                    item.drawdown_amount,
                
                drawdown_months=
                    item.drawdown_months
                    

            )

        )
    

    db.commit()

    return {
        "project_id": db_project.id,
        "message": "Project Saved"
    }
    
@router.get("/project-finance/project/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {

        # ==========================
        # BASIC PROJECT
        # ==========================

        "id": project.id,

        "name": project.name,

        "project_type": project.project_type,

        "project_life": project.project_life,

        "tax_rate": project.tax_rate,

        "discount_rate": project.discount_rate,

        "debt_amount": project.debt_amount,

        "interest_rate": project.interest_rate,

        "loan_tenor": project.loan_tenor,

        "construction_period_months":
            project.construction_period_months,

        "moratorium_months":
            project.moratorium_months,

        "repayment_frequency":
            project.repayment_frequency,

        "repayment_type":
            project.repayment_type,

        "interest_type":
            project.interest_type,

        "interest_capitalized":
            project.interest_capitalized,

        "depreciation_years":
            project.depreciation_years,


        # ==========================
        # REVENUE
        # ==========================

        "revenue_items": [

            {
                "id": item.id,

                "name": item.name,

                "revenue_type":
                    item.revenue_type,

                "growth_rate":
                    item.growth_rate,

                "amount":
                    item.amount,

                "capacity_mw":
                    item.capacity_mw,

                "operating_hours":
                    item.operating_hours,

                "cuf":
                    item.cuf,

                "tariff":
                    item.tariff,

                "tariff_escalation":
                    item.tariff_escalation,

                "degradation_rate":
                    item.degradation_rate,

                "rooms":
                    item.rooms,

                "occupancy_pct":
                    item.occupancy_pct,

                "adr":
                    item.adr,

            }

            for item in project.revenue_items

        ],


        # ==========================
        # COGS
        # ==========================

        "cogs_items": [

            {
                "id": item.id,

                "name": item.name,

                "cogs_type":
                    item.cogs_type,

                "amount":
                    item.amount,

                "growth_rate":
                    item.growth_rate,

                "cost_per_kwh":
                    item.cost_per_kwh,

                "cost_per_room":
                    item.cost_per_room,

            }

            for item in project.cogs_items

        ],


        # ==========================
        # OPEX
        # ==========================

        "opex_items": [

            {
                "id": item.id,

                "name": item.name,

                "amount":
                    item.amount,

                "escalation_rate":
                    item.escalation_rate,

            }

            for item in project.opex_items

        ],


        # ==========================
        # FIXED ASSETS
        # ==========================

        "fixed_assets": [

            {
                "id": asset.id,

                "asset_name":
                    asset.asset_name,

                "asset_category":
                    asset.asset_category,

                "purchase_year":
                    asset.purchase_year,

                "depreciation_start_year":
                    asset.depreciation_start_year,

                "purchase_cost":
                    asset.purchase_cost,

                "useful_life":
                    asset.useful_life,

                "depreciation_method":
                    asset.depreciation_method,

                "salvage_value":
                    asset.salvage_value,

                "opening_cost":
                    asset.opening_cost,

                "purchase_amount":
                    asset.purchase_amount,

                "sale_amount":
                    asset.sale_amount,

                "opening_acc_dep":
                    asset.opening_acc_dep,

                "sale_year":
                    asset.sale_year,

                "asset_status":
                    asset.asset_status,

                "is_land":
                    asset.is_land,

                "notes":
                    asset.notes,

            }

            for asset in project.fixed_assets

        ],


        # ==========================
        # ASSET ITEMS
        # ==========================

        "asset_items": [

            {
                "id": item.id,

                "name": item.name,

                "amount": item.amount,

                "growth_rate":
                    item.growth_rate,

                "asset_type":
                    item.asset_type,

            }

            for item in project.asset_items

        ],


        # ==========================
        # LIABILITIES
        # ==========================

        "liability_items": [

            {
                "id": item.id,

                "name": item.name,

                "amount": item.amount,

                "growth_rate":
                    item.growth_rate,

            }

            for item in project.liability_items

        ],


        # ==========================
        # EQUITY
        # ==========================

        "equity_items": [

            {
                "id": item.id,

                "name": item.name,

                "amount": item.amount,

                "growth_rate":
                    item.growth_rate,

            }

            for item in project.equity_items

        ],


        # ==========================
        # DEBT DRAWDOWNS
        # ==========================

        "debt_drawdowns": [

            {
                "id": item.id,

                "year":
                    item.year,

                "drawdown_amount":
                    item.drawdown_amount,

                "drawdown_months":
                    item.drawdown_months,

            }

            for item in project.debt_drawdowns

        ],


        # ==========================
        # WORKING CAPITAL
        # ==========================

        "working_capital": (

            {

                "id":
                    project.working_capital.id,

                "receivable_days":
                    project.working_capital.receivable_days,

                "payable_days":
                    project.working_capital.payable_days,

                "inventory_days":
                    project.working_capital.inventory_days,

                "prepaid_expenses":
                    project.working_capital.prepaid_expenses,

                "prepaid_growth_rate":
                    project.working_capital.prepaid_growth_rate,

                "other_current_assets":
                    project.working_capital.other_current_assets,

                "other_current_assets_growth_rate":
                    project.working_capital.other_current_assets_growth_rate,

                "other_current_liabilities":
                    project.working_capital.other_current_liabilities,

                "other_current_liabilities_growth_rate":
                    project.working_capital.other_current_liabilities_growth_rate,

            }

            if project.working_capital

            else {

                "receivable_days": 30,
                "payable_days": 30,
                "inventory_days": 0,
                "prepaid_expenses": 0,
                "prepaid_growth_rate": 0,
                "other_current_assets": 0,
                "other_current_assets_growth_rate": 0,
                "other_current_liabilities": 0,
                "other_current_liabilities_growth_rate": 0,

            }

        )

    }

@router.post("/project-finance/project/{project_id}/analyze")

def analyse_saved_project(project_id: int, db: Session = Depends(get_db)):
    project = (db.query(Project).filter(Project.id == project_id).first())

    if not project:
        return {
            "error": "Project not found"
        } 
    
    result = build_project_statement(project)

    asset_schedule = build_asset_schedule(project)

    result["asset_schedule"] = asset_schedule

    returns = calculate_project_returns(project, result)

    result["returns"] = returns

    dcf = calculate_project_dcf(project, result)

    result["dcf_valution"] = dcf

    return result 

@router.get("/project-finance/projects")
def get_projects(db:Session = Depends(get_db)):
    projects = db.query(Project).all()

    return projects


@router.put("/project-finance/project/{project_id}")
def update_project(
    project_id: int,
    data: ProjectInput,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # ------------------
    # Basic Fields
    # ------------------

    project.name = data.name
    project.project_type = data.project_type

    project.project_life = data.project_life

    project.tax_rate = data.tax_rate
    project.discount_rate = data.discount_rate

    project.debt_amount = data.debt_amount
    project.interest_rate = data.interest_rate
    project.loan_tenor = data.loan_tenor

    project.moratorium_months = data.moratorium_months
    project.repayment_frequency = data.repayment_frequency
    project.repayment_type = data.repayment_type
    project.interest_type = data.interest_type
    project.interest_capitalized = data.interest_capitalized
    project.depreciation_years = data.depreciation_years

    # ------------------
    # Delete old children
    # ------------------

    project.revenue_items.clear()
    project.cogs_items.clear()
    project.opex_items.clear()
    project.fixed_assets.clear()

    project.asset_items.clear()
    project.liability_items.clear()
    project.equity_items.clear()
    project.debt_drawdowns.clear()

    # ------------------
    # Revenue
    # ------------------

    for item in data.revenue_items:

        project.revenue_items.append(

            RevenueItem(

                name=item.name,
                revenue_type=item.revenue_type,

                growth_rate=item.growth_rate,
                amount=item.amount,

                capacity_mw=item.capacity_mw,
                operating_hours=item.operating_hours,
                cuf=item.cuf,

                tariff=item.tariff,
                tariff_escalation=item.tariff_escalation,

                degradation_rate=item.degradation_rate,

                rooms=item.rooms,
                occupancy_pct=item.occupancy_pct,
                adr=item.adr
            )
        )

    # ------------------
    # COGS
    # ------------------

    for item in data.cogs_items:

        project.cogs_items.append(

            COGSItem(

                name=item.name,
                cogs_type=item.cogs_type,

                amount=item.amount,
                growth_rate=item.growth_rate,

                cost_per_kwh=item.cost_per_kwh,
                cost_per_room=item.cost_per_room

            )

        )

    # ------------------
    # Opex
    # ------------------

    for item in data.opex_items:

        project.opex_items.append(

            OpexItem(

                name=item.name,
                amount=item.amount,
                escalation_rate=item.escalation_rate
            )
        )
   
# ------------------
# Fixed Assets
# ------------------

    for asset in data.fixed_assets:

        project.fixed_assets.append(

            FixedAsset(

                asset_name=asset.asset_name,

                asset_category=asset.asset_category,

                purchase_year=asset.purchase_year,

                depreciation_start_year=asset.depreciation_start_year,

                purchase_cost=asset.purchase_cost,

                useful_life=asset.useful_life,

                depreciation_method=asset.depreciation_method,

                salvage_value=asset.salvage_value,

                opening_cost=asset.opening_cost,

                purchase_amount=asset.purchase_amount,

                sale_amount=asset.sale_amount,

                opening_acc_dep=asset.opening_acc_dep,

                sale_year=asset.sale_year,

                asset_status=asset.asset_status,

                is_land=asset.is_land,

                notes=asset.notes

            )

        )

    # ------------------
    # Assets
    # ------------------

    for item in data.asset_items:

        project.asset_items.append(

            AssetItem(

                name=item.name,
                amount=item.amount,

                growth_rate=item.growth_rate,
                asset_type=item.asset_type
            )
        )

    # ------------------
    # Liabilities
    # ------------------

    for item in data.liability_items:

        project.liability_items.append(

            LiabilityItem(

                name=item.name,
                amount=item.amount,

                growth_rate=item.growth_rate
            )
        )

    # ------------------
    # Equity
    # ------------------

    for item in data.equity_items:

        project.equity_items.append(

            EquityItem(

                name=item.name,
                amount=item.amount,

                growth_rate=item.growth_rate
            )
        )
    # ------------------
    # Debt Drawdowns
    # ------------------

    for item in data.debt_drawdowns:

        project.debt_drawdowns.append(

            DebtDrawdown(

                year=item.year,

                drawdown_amount=item.drawdown_amount,

                drawdown_months=item.drawdown_months

            )

        )

   # ------------------
    # Working Capital
    # ------------------

    if not project.working_capital:

        project.working_capital = WorkingCapital()


    project.working_capital.receivable_days = (
        data.working_capital.receivable_days
    )

    project.working_capital.payable_days = (
        data.working_capital.payable_days
    )

    project.working_capital.inventory_days = (
        data.working_capital.inventory_days
    )

    project.working_capital.prepaid_expenses = (
        data.working_capital.prepaid_expenses
    )

    project.working_capital.prepaid_growth_rate = (
        data.working_capital.prepaid_growth_rate
    )

    project.working_capital.other_current_assets = (
        data.working_capital.other_current_assets
    )

    project.working_capital.other_current_assets_growth_rate = (
        data.working_capital.other_current_assets_growth_rate
    )

    project.working_capital.other_current_liabilities = (
        data.working_capital.other_current_liabilities
    )

    project.working_capital.other_current_liabilities_growth_rate = (
        data.working_capital.other_current_liabilities_growth_rate
    )
    db.commit()

    db.refresh(project)

    return project

@router.post("/project-finance/analyze")
def analyze_project(project: ProjectInput):

    result = build_project_statement(project)

    asset_schedule = build_asset_schedule(project)

    result["asset_schedule"] = asset_schedule

    returns = calculate_project_returns(
        project,
        result
    )

    # ==========================================
    # ANALYSIS SCHEDULE
    # ==========================================

    result["analysis_schedule"] = (
        returns["analysis_schedule"]
    )

    # ==========================================
    # KPI VALUES
    # ==========================================

    result["project_irr"] = (
        returns["project_irr"]
    )

    result["equity_irr"] = (
        returns["equity_irr"]
    )

    result["npv"] = (
        returns["npv"]
    )

    result["minimum_dscr"] = (
        returns["minimum_dscr"]
    )

    dcf = calculate_project_dcf(project, result)

    result["dcf_valuation"] = dcf
    

    return result

@router.post("/project-finance/assets")
def build_assets(project: ProjectInput):

    print("========== RETURNING ==========")
    
    asset_schedule = build_asset_schedule(project)
    print(asset_schedule)
    return {
        "asset_schedule": asset_schedule
    }

@router.post("/project-finance/project/{project_id}/export/excel")
def export_project_excel(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Build the same analysis used by ERP
    analysis = build_project_statement(
        project
    )

    asset_schedule = build_asset_schedule(
        project
    )

    analysis["asset_schedule"] = asset_schedule

    excel_file = build_project_finance_excel(
        project,
        analysis
    )

    filename = (
        f"{project.name or 'Project'}"
        "_Financial_Model.xlsx"
    )

    return StreamingResponse(

        excel_file,

        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.spreadsheetml.sheet"
        ),

        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }

    )