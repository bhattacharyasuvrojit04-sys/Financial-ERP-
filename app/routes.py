import shutil

from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.AI.analyzer import analyze_financial_document
from app.AI.assumption import generate_assumptions
from app.AI.chunker import chunk_text
from app.AI.embeddings import create_embeddings
from app.AI.parser import extract_pdf_text
from app.AI.vector_store import store_embeddings
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
    pay_invoice,get_pnl_periodic, get_pnl_hierarchy, forecast_growth, save_driver, forecast_driver_model, fix_cash_account_type, calculate_dcf, dcf_sensitivity,monte_carlo_dcf, generate_financial_report
)



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
def depreciation(asset_name: str, amount: float, db: Session = Depends(get_db)):
    return apply_depreciation(db, asset_name, amount)


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
        return apply_periodic_report(db, period, get_balance_sheet)
    return get_balance_sheet(db, start_date, end_date)

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
    analysis = analyze_financial_document(text)

    # STEP 6 — ASSUMPTIONS
    assumptions = generate_assumptions(analysis)

    return {
        "status": "success",
        "assumptions": assumptions
    }