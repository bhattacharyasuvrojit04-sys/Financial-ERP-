from sqlalchemy.orm import Session
from .models import Account, JournalEntry, JournalLine, Invoice,Rule, Driver, AccountingFixedAsset, DepreciationSchedule, Product, Customer, Supplier, StockMovement, ReorderRequest
from .ai import classify
from datetime import datetime, timedelta, timezone, time, date
from sqlalchemy import text, case, func
import random

# ============================================================
# ACCOUNTING MASTER / CHART OF ACCOUNTS
# ============================================================

ACCOUNT_GROUPS = {

    # ================= ASSETS =================

    "Cash-in-Hand": {
        "type": "current_assets",
        "normal_balance": "debit"
    },

    "Bank Accounts": {
        "type": "current_assets",
        "normal_balance": "debit"
    },

    "Current Assets": {
        "type": "current_assets",
        "normal_balance": "debit"
    },

    "Fixed Assets": {
        "type": "non_current_assets",
        "normal_balance": "debit"
    },

    "Investments": {
        "type": "non_current_assets",
        "normal_balance": "debit"
    },

    "Accumulated Depreciation": {
        "type": "contra_asset",
        "normal_balance": "credit"
    },

    # ================= LIABILITIES =================

    "Current Liabilities": {
        "type": "current_liabilities",
        "normal_balance": "credit"
    },

    "Other Liabilities": {
        "type": "non_current_liabilities",
        "normal_balance": "credit"
    },

    "Secured Loans": {
        "type": "non_current_liabilities",
        "normal_balance": "credit"
    },

    "Unsecured Loans": {
        "type": "non_current_liabilities",
        "normal_balance": "credit"
    },

    # ================= EQUITY =================

    "Capital Account": {
        "type": "equity",
        "normal_balance": "credit"
    },

    "Reserves & Surplus": {
        "type": "equity",
        "normal_balance": "credit"
    },

    # ================= INCOME =================

    "Sales Accounts": {
        "type": "operating_income",
        "normal_balance": "credit"
    },

    "Indirect Income": {
        "type": "non_operating_income",
        "normal_balance": "credit"
    },

    # ================= EXPENSE =================

    "Direct Expenses": {
        "type": "operating_expense",
        "normal_balance": "debit"
    },

    "Indirect Expenses": {
        "type": "operating_expense",
        "normal_balance": "debit"
    },

    "Finance Costs": {
        "type": "non_operating_expense",
        "normal_balance": "debit"
    }
}

#2nd page for results monthly, quarterly and yearly:
def get_period_range(period: str, date: str = None):
    today = datetime.today() if not date else datetime.strptime(date, "%d-%m-%Y")

    if period == "monthly":
        start = today.replace(day=1)
        end = (start.replace(month = start.month % 12 +1,day = 1) - timedelta(days= 1))

    elif period == "quarterly":
        quarter = (today.month - 1) // 3 + 1 #suppose april is 4, then 4-1 = 3, then 3/3 is 1 then 1+1 is 2 so Q2
        start = datetime(today.year, 3 * quarter - 2, 1)
        end = datetime(today.year, 3 * quarter, 1) + timedelta(days= 31)
        end = end.replace(day=1) - timedelta(days=1)

    elif period == "half_yearly":
        if today.month <= 6:
            start = datetime(today.year,1,1)
            end = datetime(today.year,6,30)
        else:
            start = datetime(today.year, 7, 1)
            end = datetime(today.year, 12,31)
    elif period == "yearly":
        start = datetime(today.year, 1, 1)
        end = datetime(today.year, 12, 31)

    else:
        raise ValueError("Invalid period")

    return start, end


# 1st page of the software
def apply_date_filter(query, model, start_date=None, end_date=None):

    if not start_date and not end_date:
        return query

    if start_date and isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date)

    if end_date and isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date)

    if start_date:
        query = query.filter(
            model.created_at >= start_date
        )

    if end_date:
        # Include the complete end date
        end_exclusive = end_date + timedelta(days=1)

        query = query.filter(
            model.created_at < end_exclusive
        )

    return query

def get_on_create_account(
    db: Session,
    name: str,
    group_name: str
):
    name = name.strip().lower()
    group_name = group_name.strip()

    # -----------------------------------------
    # 1. Validate group
    # -----------------------------------------

    group = ACCOUNT_GROUPS.get(group_name)

    if not group:
        raise ValueError(
            f"Invalid account group: {group_name}"
        )

    account_type = group["type"]
    normal_balance = group["normal_balance"]

    # -----------------------------------------
    # 2. Check whether account already exists
    # -----------------------------------------

    account = (
        db.query(Account)
        .filter(Account.name == name)
        .first()
    )

    # -----------------------------------------
    # 3. Existing account
    # -----------------------------------------

    if account:

        # Update missing/outdated accounting metadata
        account.group_name = group_name
        account.type = account_type
        account.normal_balance = normal_balance

        db.commit()
        db.refresh(account)

        return account

    # -----------------------------------------
    # 4. Create new account
    # -----------------------------------------

    account = Account(
        name=name,
        type=account_type,
        group_name=group_name,
        normal_balance=normal_balance
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account

# ============================================================
# DOUBLE ENTRY JOURNAL ENGINE
# ============================================================

def post_journal_entry(
    db: Session,
    description: str,
    lines: list,
    entry_date=None
):

    if not lines:
        raise ValueError(
            "Journal entry must contain at least one line"
        )

    total_debit = sum(
        float(line.get("debit", 0))
        for line in lines
    )

    total_credit = sum(
        float(line.get("credit", 0))
        for line in lines
    )

    if round(total_debit, 2) != round(total_credit, 2):
        raise ValueError(
            f"Unbalanced journal entry. "
            f"Debit={total_debit}, "
            f"Credit={total_credit}"
        )

    try:

        entry = JournalEntry(
            description=description,
            created_at=(
                entry_date
                or datetime.now(timezone.utc)
            )
        )

        db.add(entry)

        db.flush()

        for line in lines:

            debit = float(line.get("debit", 0))
            credit = float(line.get("credit", 0))

            if debit < 0 or credit < 0:
                raise ValueError(
                    "Debit and credit cannot be negative"
                )

            if debit > 0 and credit > 0:
                raise ValueError(
                    "One journal line cannot contain "
                    "both debit and credit"
                )

            if debit == 0 and credit == 0:
                raise ValueError(
                    "Journal line must contain "
                    "either debit or credit"
                )

            # Verify account exists
            account = db.query(Account).filter(
                Account.id == line["account_id"]
            ).first()

            if not account:
                raise ValueError(
                    f"Account {line['account_id']} does not exist"
                )

            journal_line = JournalLine(
                entry_id=entry.id,
                account_id=line["account_id"],
                debit=debit,
                credit=credit
            )

            db.add(journal_line)

        db.commit()
        db.refresh(entry)

        return entry

    except Exception:
        db.rollback()
        raise

def create_transaction(
    db: Session,
    description: str,
    amount: float,
    date: str = None
):
    """
    Creates a transaction using the Tally-style
    double-entry accounting engine.

    Current behaviour:
        Income / Expense / Asset / Liability
        transactions are automatically posted
        against Cash.

    Later this can be extended to:
        Credit Sales
        Credit Purchases
        Loans
        GST
        Payroll
        Fixed Assets
        Receivables
        Payables
        etc.
    """

    if amount <= 0:
        raise ValueError("Amount must be greater than zero")

    entry_date = (
        datetime.fromisoformat(date)
        if date
        else datetime.now(timezone.utc)
    )

    # ========================================================
    # 1. GET ACCOUNTING RULES
    # ========================================================

    rules = db.query(Rule).all()

    category = classify(description, rules)

    if not category:
        raise ValueError(
            "Unable to classify this transaction"
        )

    category = category.strip().lower()

    print("RAW CATEGORY:", category)

    # ========================================================
    # 2. MAP OLD AI CATEGORIES TO TALLY GROUPS
    # ========================================================

    category_to_group = {

        # ---------------- INCOME ----------------

        "operating_income":
            "Sales Accounts",

        "non_operating_income":
            "Indirect Income",

        "income":
            "Sales Accounts",

        "revenue":
            "Sales Accounts",

        # ---------------- EXPENSE ----------------

        "operating_expense":
            "Direct Expenses",

        "non_operating_expense":
            "Indirect Expenses",

        "expense":
            "Indirect Expenses",

        # ---------------- ASSETS ----------------

        "current_assets":
            "Current Assets",

        "non_current_assets":
            "Fixed Assets",

        "asset":
            "Current Assets",

        # ---------------- LIABILITIES ----------------

        "current_liabilities":
            "Current Liabilities",

        "non_current_liabilities":
            "Other Liabilities",

        "liability":
            "Other Liabilities",

        # ---------------- EQUITY ----------------

        "equity":
            "Capital Account"
    }

    group_name = category_to_group.get(category)

    if not group_name:
        raise ValueError(
            f"Unsupported accounting category: {category}"
        )

    # ========================================================
    # 3. CASH ACCOUNT
    # ========================================================

    cash = get_on_create_account(
        db,
        "cash",
        "Cash-in-Hand"
    )

    # ========================================================
    # 4. CREATE TARGET ACCOUNT
    # ========================================================

    account = get_on_create_account(
        db,
        description,
        group_name
    )

    # ========================================================
    # 5. CREATE DOUBLE-ENTRY
    # ========================================================

    lines = []

    # --------------------------------------------------------
    # INCOME
    # --------------------------------------------------------

    if category in [
        "operating_income",
        "non_operating_income",
        "income",
        "revenue"
    ]:

        # Cash Dr
        #     Revenue Cr

        lines = [
            {
                "account_id": cash.id,
                "debit": amount,
                "credit": 0
            },
            {
                "account_id": account.id,
                "debit": 0,
                "credit": amount
            }
        ]

    # --------------------------------------------------------
    # EXPENSE
    # --------------------------------------------------------

    elif category in [
        "operating_expense",
        "non_operating_expense",
        "expense"
    ]:

        # Expense Dr
        #     Cash Cr

        lines = [
            {
                "account_id": account.id,
                "debit": amount,
                "credit": 0
            },
            {
                "account_id": cash.id,
                "debit": 0,
                "credit": amount
            }
        ]

    # --------------------------------------------------------
    # ASSET
    # --------------------------------------------------------

    elif category in [
        "current_assets",
        "non_current_assets",
        "asset"
    ]:

        # Asset Dr
        #     Cash Cr

        lines = [
            {
                "account_id": account.id,
                "debit": amount,
                "credit": 0
            },
            {
                "account_id": cash.id,
                "debit": 0,
                "credit": amount
            }
        ]

    # --------------------------------------------------------
    # LIABILITY
    # --------------------------------------------------------

    elif category in [
        "current_liabilities",
        "non_current_liabilities",
        "liability"
    ]:

        # Cash Dr
        #     Liability Cr

        lines = [
            {
                "account_id": cash.id,
                "debit": amount,
                "credit": 0
            },
            {
                "account_id": account.id,
                "debit": 0,
                "credit": amount
            }
        ]

    # --------------------------------------------------------
    # EQUITY
    # --------------------------------------------------------

    elif category == "equity":

        # Cash Dr
        #     Capital Cr

        lines = [
            {
                "account_id": cash.id,
                "debit": amount,
                "credit": 0
            },
            {
                "account_id": account.id,
                "debit": 0,
                "credit": amount
            }
        ]

    else:

        raise ValueError(
            f"Cannot create journal entry for category: {category}"
        )

    # ========================================================
    # 6. POST THROUGH CENTRAL JOURNAL ENGINE
    # ========================================================

    entry = post_journal_entry(
        db=db,
        description=description,
        lines=lines,
        entry_date=entry_date
    )

    return {
        "msg": "Transaction recorded successfully",

        "entry_id": entry.id,

        "description": description,

        "amount": amount,

        "category": category,

        "account": account.name,

        "group": group_name,

        "journal": {
            "debit": amount,
            "credit": amount
        }
    }
    

'''def create_transaction(db: Session, description: str, amount: float, date: str = None):
    entry_date = datetime.fromisoformat(date) if date else datetime.now()
    rule = db.query(Rule).all()
    category = classify(description, rule)
    print("RAW CATEGORY:", category)
    print(category == "non_current_assets")

    entry = JournalEntry(description = description, created_at = entry_date)
    db.add(entry)
    db.commit()
    db.refresh(entry)   

    cash = get_on_create_account(db, "cash", "current_assets")

    if category == "operating_income":
        acc_name = description.lower()
        acc = get_on_create_account(db, acc_name,"operating_income")

        db.add_all(
            [
                JournalLine(entry_id = entry.id, account_id = cash.id, debit = amount),
                JournalLine(entry_id = entry.id, account_id = acc.id, credit = amount),
            ]
        )
    elif category == "non_operating_income":
        acc_name = description.lower()
        acc = get_on_create_account(db, acc_name, "non_operating_income")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = cash.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = acc.id, credit = amount )
        ])

    elif category == "operating_expense":
        acc_name = description.lower()
        acc = get_on_create_account(db, acc_name, "operating_expense")

        db.add_all(
            [
                JournalLine(entry_id = entry.id, account_id = acc.id, debit = amount),
                JournalLine(entry_id = entry.id, account_id = cash.id, credit = amount),
            ]
        )
    elif category == "non_operating_expense":
        acc_name = description.lower()
        acc = get_on_create_account(db, acc_name, "non_operating_expense")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = acc.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = cash.id, credit = amount),
        ])

    elif category == "current_assets":
        acc_name = description.lower()
        acc = get_on_create_account(db,acc_name,"current_assets")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = acc.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = cash.id, credit = amount),
        ])
    
    elif category == "non_current_assets":
        acc_name = description.lower()
        acc = get_on_create_account(db, acc_name, "non_current_assets")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = acc.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = cash.id, credit = amount),
        ])

    elif category == "current_liabilities":
        acc_name = description.lower()
        acc = get_on_create_account(db,acc_name,"current_liabilities")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = cash.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = acc.id, credit = amount),
        ])

    elif category == "non_current_liabilities":
        acc_name = description.lower()
        acc = get_on_create_account(db,acc_name, "non_current_liabilities")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = cash.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = acc.id, credit = amount),
        ])
    db.commit()
    return {"msg": "Transaction recorded", "category": category}'''

#For PnL:
def get_pnl(db: Session, start_date = None, end_date = None, use_driver = False):
    op_income = 0
    non_op_income = 0
    op_expense = 0
    non_op_expense = 0

    line_items = {
        "operating_income": {},
        "non_operating_income": {},
        "operating_expense": {},
        "non_operating_expense": {}    
    }

    query = db.query(JournalLine).join(JournalEntry)
    query = apply_date_filter(query,JournalEntry, start_date, end_date)
    line = query.all()

    for l in line:
        acc = db.query(Account).filter(Account.id == l.account_id).first()
        if not acc:
            continue
        acc_type = acc.type.lower()
        acc.name = acc.name
        if acc_type == "operating_income":
            amount = l.credit - l.debit
            op_income += amount
            line_items["operating_income"][acc.name] = \
                line_items["operating_income"].get(acc.name, 0) + amount

        elif acc_type == "non_operating_income":
            amount = l.credit - l.debit
            non_op_income += amount
            line_items["non_operating_income"][acc.name] = \
                line_items["non_operating_income"].get(acc.name,0) + amount
        
        elif acc_type == "operating_expense":
            amount = l.debit - l.credit
            op_expense += amount
            line_items["operating_expense"][acc.name] = \
                line_items["operating_expense"].get(acc.name,0) + amount

        elif acc_type == "non_operating_expense":
            amount = l.debit - l.credit
            non_op_expense += amount
            line_items["non_operating_expense"][acc.name] = \
                line_items["non_operating_expense"].get(acc.name,0) + amount
            
    if use_driver:
        driver = db.query(Driver).order_by(Driver.id.desc()).first()

        if driver:
            driver_revenue = driver.users * driver.arpu
            variable_cost = driver_revenue * driver.variable_cost_pct
            total_cost = driver.fixed_cost + variable_cost

            #Override operating_income:

            op_income = driver_revenue
            line_items["operating_income"] = {
                "Driver Revenue": driver_revenue,
            }
            op_expense = total_cost
            line_items["operating_expense"] = {
                "Variable Costs": variable_cost,
                "Fixed Costs": total_cost - variable_cost
            }

            
    total_income = op_income + non_op_income
    total_expense = op_expense + non_op_expense
    profit = total_income - total_expense

    return {
        "summary": {
            "operating_income": op_income,
            "non_operating_income": non_op_income,
            "operating_expense": op_expense,
            "non_operating_expense": non_op_expense,
            "total_income": total_income,
            "total_expense": total_expense,
            "profit": profit
        },
        "line_items": line_items
    }

#pnl period wise:
def get_pnl_periodic(db: Session, period: str = "yearly"):
    start, end = get_period_range(period)
    print("PERIOD:", period)
    print("START:", start)
    print("END:", end)

    return get_pnl(db, start, end)

def get_pnl_hierarchy(db:Session):
    today = datetime.today()
    year = today.year

    result = []
    #year level:
    year_start = datetime(year,1,1)
    year_end = datetime(year,12,31)

    year_pnl = get_pnl(db, year_start, year_end)

    year_node = {
        "label": str(year),
        "summary": year_pnl["summary"],
        "children": []
    }
    #for quarter level:
    for q in range(1,5):
        quarter_start = datetime(year, 3*q - 2, 1)
        quarter_end = datetime(year, 3*q, 1) + timedelta(days=31)
        quarter_end = quarter_end.replace(day=1) - timedelta(days=1)

        quarter_pnl = get_pnl(db, quarter_start, quarter_end)

        quarter_node = {
            "label": f"Q{q}",
            "summary": quarter_pnl["summary"],
            "children": []
        }

    #for month level:
        for m in range(3 * q - 2, 3 * q + 1):
            m_start = datetime(year, m, 1)

            if m == 12:
                m_end = datetime(year, 12, 31)
            else:
                m_end = datetime(year, m + 1, 1) - timedelta(days=1)

            m_pnl = get_pnl(db, m_start, m_end)

            month_node = {
                "label": m_start.strftime("%b"),
                "summary": m_pnl["summary"]
            }

            quarter_node["children"].append(month_node)

        year_node["children"].append(quarter_node)

    result.append(year_node)

    return result

def apply_periodic_report(db: Session, period: str, report_func):
    today = datetime.today()
    results = []

    if period == "monthly":
        for i in range(1,13):
            start = datetime(today.year, i ,1)
            if i == 12:
                end = datetime(today.year, 12, 31)
            else:
                end = datetime(today.year, i +1, 1) - timedelta(days=1)
            result = report_func(db, start, end)
            results.append({
                "label": start.strftime("%b %Y"),
                "data": result
            })
    elif period == "quarterly":
        for q in range (1,5):
            start = datetime(today.year, 3*q -2, 1)
            end = datetime(today.year, 3*q, 1) + timedelta(days=31)
            end = end.replace(day=1) - timedelta(days=1)

            result = report_func(db, start, end)
            results.append({
                "label": f"Q{q} {today.year}",
                "data": result
            })

    elif period == "half_yearly":

        # First Half
        start = datetime(today.year, 1, 1)
        end = datetime(today.year, 6, 30)

        result = report_func(db, start, end)

        results.append({
            "label": f"H1 {today.year}",
            "data": result
        })

        # Second Half
        start = datetime(today.year, 7, 1)
        end = datetime(today.year, 12, 31)

        result = report_func(db, start, end)

        results.append({
            "label": f"H2 {today.year}",
            "data": result
        })

    elif period == "yearly":
        start = datetime(today.year, 1, 1)
        end = datetime(today.year, 12, 31)

        result = report_func(db, start, end)
        results.append({
            "label": str(today.year),
            "data": result
        })
    return results


# ============================================================
# FIXED ASSETS & DEPRECIATION ENGINE
# ============================================================

def calculate_monthly_depreciation(
    opening_wdv: float,
    purchase_cost: float,
    depreciation_method: str,
    depreciation_rate: float,
    salvage_value: float = 0
):
    """
    Calculate one month's depreciation.

    SLM:
        Annual depreciation = Cost × Rate
        Monthly depreciation = Annual depreciation / 12

    WDV:
        Monthly rate = Annual rate / 12
        Depreciation = Opening WDV × Monthly rate
    """

    method = depreciation_method.strip().upper()

    if method == "SLM":

        monthly_dep = (
            purchase_cost
            * (depreciation_rate / 100)
            / 12
        )

    elif method == "WDV":

        monthly_rate = (
            depreciation_rate / 100
        ) / 12

        monthly_dep = (
            opening_wdv * monthly_rate
        )

    else:
        raise ValueError(
            "Depreciation method must be SLM or WDV"
        )

    # Never depreciate below salvage value
    maximum_depreciation = max(
        opening_wdv - salvage_value,
        0
    )

    monthly_dep = min(
        monthly_dep,
        maximum_depreciation
    )

    return round(max(monthly_dep, 0), 2)


def generate_depreciation_schedule(
    db: Session,
    asset: AccountingFixedAsset
):
    """
    Generate monthly depreciation schedule
    from the month after purchase until useful life
    or until the asset reaches salvage value.
    """

    # Remove existing unposted schedule
    db.query(DepreciationSchedule).filter(
        DepreciationSchedule.asset_id == asset.id
    ).delete()

    purchase_date = asset.purchase_date

    # Start from the month after purchase
    year = purchase_date.year
    month = purchase_date.month + 1

    if month == 13:
        month = 1
        year += 1

    opening_wdv = float(asset.purchase_cost)

    # If useful life isn't supplied, derive it
    if asset.useful_life_months:
        total_months = asset.useful_life_months
    else:
        if asset.depreciation_rate > 0:
            total_months = int(
                1200 / asset.depreciation_rate
            )
        else:
            total_months = 0

    for i in range(total_months):

        if opening_wdv <= asset.salvage_value:
            break

        period = datetime(
            year,
            month,
            1
        )

        depreciation = calculate_monthly_depreciation(
            opening_wdv=opening_wdv,
            purchase_cost=asset.purchase_cost,
            depreciation_method=asset.depreciation_method,
            depreciation_rate=asset.depreciation_rate,
            salvage_value=asset.salvage_value
        )

        closing_wdv = round(
            opening_wdv - depreciation,
            2
        )

        schedule = DepreciationSchedule(
            asset_id=asset.id,
            period=period,
            opening_wdv=round(opening_wdv, 2),
            depreciation_amount=depreciation,
            closing_wdv=closing_wdv,
            status="due"
        )

        db.add(schedule)

        opening_wdv = closing_wdv

        month += 1

        if month == 13:
            month = 1
            year += 1

    db.commit()

    return (
        db.query(DepreciationSchedule)
        .filter(
            DepreciationSchedule.asset_id == asset.id
        )
        .order_by(
            DepreciationSchedule.period
        )
        .all()
    )


def create_fixed_asset(
    db: Session,
    data
):
    """
    Create fixed asset and automatically generate
    its depreciation schedule.
    """

    existing = (
        db.query(AccountingFixedAsset)
        .filter(
            AccountingFixedAsset.asset_code == data.asset_code
        )
        .first()
    )

    if existing:
        raise ValueError(
            f"Asset code {data.asset_code} already exists"
        )

    if data.purchase_cost <= 0:
        raise ValueError(
            "Purchase cost must be greater than zero"
        )

    if data.depreciation_rate <= 0:
        raise ValueError(
            "Depreciation rate must be greater than zero"
        )

    method = data.depreciation_method.strip().upper()

    if method not in ["SLM", "WDV"]:
        raise ValueError(
            "Depreciation method must be SLM or WDV"
        )

    purchase_date = datetime.fromisoformat(
        data.purchase_date
    )

    asset = AccountingFixedAsset(
        asset_code=data.asset_code.strip(),
        asset_name=data.asset_name.strip(),
        purchase_cost=data.purchase_cost,
        purchase_date=purchase_date,
        depreciation_method=method,
        depreciation_rate=data.depreciation_rate,
        useful_life_months=data.useful_life_months,
        salvage_value=data.salvage_value or 0,
        status="active"
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)

    # Create corresponding fixed asset account
    get_on_create_account(
        db,
        asset.asset_name,
        "Fixed Assets"
    )

    # Automatically generate schedule
    generate_depreciation_schedule(
        db,
        asset
    )

    return asset


def get_fixed_assets(db: Session):

    assets = (
        db.query(AccountingFixedAsset)
        .order_by(AccountingFixedAsset.purchase_date.desc())
        .all()
    )

    result = []

    for asset in assets:

        schedule = (
            db.query(DepreciationSchedule)
            .filter(
                DepreciationSchedule.asset_id == asset.id
            )
            .order_by(
                DepreciationSchedule.period.desc()
            )
            .first()
        )

        book_value = (
            schedule.closing_wdv
            if schedule
            else asset.purchase_cost
        )

        result.append({
            "id": asset.id,
            "asset_code": asset.asset_code,
            "asset_name": asset.asset_name,
            "purchase_cost": asset.purchase_cost,
            "purchase_date": asset.purchase_date.isoformat(),
            "depreciation_method": asset.depreciation_method,
            "depreciation_rate": asset.depreciation_rate,
            "useful_life_months": asset.useful_life_months,
            "salvage_value": asset.salvage_value,
            "status": asset.status,
            "book_value_today": book_value
        })

    return result


def get_asset_schedule(
    db: Session,
    asset_id: int
):

    asset = (
        db.query(AccountingFixedAsset)
        .filter(AccountingFixedAsset.id == asset_id)
        .first()
    )

    if not asset:
        raise ValueError(
            "Fixed asset not found"
        )

    schedule = (
        db.query(DepreciationSchedule)
        .filter(
            DepreciationSchedule.asset_id == asset_id
        )
        .order_by(
            DepreciationSchedule.period
        )
        .all()
    )

    return {
        "asset": {
            "id": asset.id,
            "asset_code": asset.asset_code,
            "asset_name": asset.asset_name,
            "purchase_cost": asset.purchase_cost,
            "purchase_date": asset.purchase_date.isoformat(),
            "depreciation_method": asset.depreciation_method,
            "depreciation_rate": asset.depreciation_rate,
            "useful_life_months": asset.useful_life_months,
            "salvage_value": asset.salvage_value,
        },
        "schedule": [
            {
                "id": row.id,
                "period": row.period.strftime("%b %y"),
                "opening_wdv": row.opening_wdv,
                "depreciation_amount": row.depreciation_amount,
                "closing_wdv": row.closing_wdv,
                "status": row.status,
                "journal_entry_id": row.journal_entry_id,
                "posted_at": (
                    row.posted_at.isoformat()
                    if row.posted_at
                    else None
                )
            }
            for row in schedule
        ]
    }


def post_depreciation_journal(
    db: Session,
    schedule_id: int
):
    """
    Post one depreciation schedule row
    into the central journal engine.
    """

    schedule = (
        db.query(DepreciationSchedule)
        .filter(
            DepreciationSchedule.id == schedule_id
        )
        .first()
    )

    if not schedule:
        raise ValueError(
            "Depreciation schedule not found"
        )

    if schedule.status == "posted":
        raise ValueError(
            "This depreciation entry is already posted"
        )

    asset = (
        db.query(AccountingFixedAsset)
        .filter(
            AccountingFixedAsset.id == schedule.asset_id
        )
        .first()
    )

    if not asset:
        raise ValueError(
            "Fixed asset not found"
        )

    # --------------------------------------------------------
    # Create depreciation expense account
    # --------------------------------------------------------

    depreciation_expense = get_on_create_account(
        db,
        "Depreciation Expense",
        "Indirect Expenses"
    )

    # --------------------------------------------------------
    # Create accumulated depreciation account
    # --------------------------------------------------------

    accumulated_dep = get_on_create_account(
        db,
        f"Accumulated Depreciation - {asset.asset_name}",
        "Accumulated Depreciation"
    )

    # --------------------------------------------------------
    # Journal
    #
    # Dr Depreciation Expense
    #     Cr Accumulated Depreciation
    # --------------------------------------------------------

    lines = [
        {
            "account_id": depreciation_expense.id,
            "debit": schedule.depreciation_amount,
            "credit": 0
        },
        {
            "account_id": accumulated_dep.id,
            "debit": 0,
            "credit": schedule.depreciation_amount
        }
    ]

    entry = post_journal_entry(
        db=db,
        description=(
            f"Depreciation - "
            f"{asset.asset_name} - "
            f"{schedule.period.strftime('%b %Y')}"
        ),
        lines=lines,
        entry_date=schedule.period
    )

    # --------------------------------------------------------
    # Mark schedule as posted
    # --------------------------------------------------------

    schedule.status = "posted"
    schedule.journal_entry_id = entry.id
    schedule.posted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(schedule)

    return {
        "message": "Depreciation journal posted successfully",
        "schedule_id": schedule.id,
        "journal_entry_id": entry.id,
        "asset": asset.asset_name,
        "period": schedule.period.strftime("%b %Y"),
        "depreciation": schedule.depreciation_amount
    }

"""def apply_depreciation(db: Session, asset_name: str, amount: float):
    entry = JournalEntry(description = f"Depreciation for {asset_name}")
    db.add(entry)
    db.commit()
    db.refresh(entry)

    depreciation_expense = get_on_create_account(db, "depreciation expense", "operating_expense")
    accumulated_dep = get_on_create_account(db,f"accumulated depreciation - {asset_name.lower()}",
        "contra_asset")

    db.add_all([
        JournalLine(entry_id = entry.id, account_id = depreciation_expense.id, debit = amount),
        JournalLine(entry_id = entry.id, account_id = accumulated_dep.id, credit = amount),
    ])
    db.commit()
    return {"msg": f"Depreciation applied for {asset_name}"} """


def create_product(db: Session, data):
    """
    Create a new product / stock item.

    This function only creates the product master.
    It does NOT create inventory movement
    and does NOT create a journal entry.
    """

    sku = data.sku.strip()
    name = data.name.strip()

    if not sku:
        raise ValueError("SKU is required")

    if not name:
        raise ValueError("Product name is required")

    existing = (
        db.query(Product)
        .filter(Product.sku == sku)
        .first()
    )

    if existing:
        raise ValueError(
            f"Product SKU {sku} already exists"
        )

    costing_method = (
        data.costing_method
        .strip()
        .upper()
    )

    allowed_costing_methods = {
        "WEIGHTED_AVERAGE",
        "FIFO"
    }

    if costing_method not in allowed_costing_methods:
        raise ValueError(
            "Costing method must be "
            "WEIGHTED_AVERAGE or FIFO"
        )

    if data.tax_rate < 0 or data.tax_rate > 100:
        raise ValueError(
            "Tax rate must be between 0 and 100"
        )

    # -----------------------------------------
    # Validate accounting accounts
    # -----------------------------------------

    account_ids = [
        data.inventory_account_id,
        data.purchase_account_id,
        data.sales_account_id
    ]

    for account_id in account_ids:

        if account_id is None:
            continue

        account = (
            db.query(Account)
            .filter(Account.id == account_id)
            .first()
        )

        if not account:
            raise ValueError(
                f"Account {account_id} does not exist"
            )

    # -----------------------------------------
    # Create Product
    # -----------------------------------------

    product = Product(
        sku=sku,
        name=name,
        description=(
            data.description.strip()
            if data.description
            else None
        ),
        category=(
            data.category.strip()
            if data.category
            else None
        ),
        unit=data.unit.strip(),
        purchase_price=data.purchase_price,
        selling_price=data.selling_price,
        tax_rate=data.tax_rate,

        inventory_account_id=(
            data.inventory_account_id
        ),

        purchase_account_id=(
            data.purchase_account_id
        ),

        sales_account_id=(
            data.sales_account_id
        ),

        costing_method=costing_method,

        reorder_level=data.reorder_level,

        is_active=True
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

def get_products(
    db: Session,
    search: str = None,
    category: str = None,
    active_only: bool = True
):
    """
    Return products from the Product Master.
    """

    query = (
        db.query(Product)
        .order_by(Product.name.asc())
    )

    if active_only:
        query = query.filter(
            Product.is_active == True
        )

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            (Product.name.ilike(search_term))
            |
            (Product.sku.ilike(search_term))
        )

    if category:
        query = query.filter(
            Product.category == category
        )

    products = query.all()

    result = []

    for product in products:

        result.append({
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "description": product.description,
            "category": product.category,
            "unit": product.unit,
            "purchase_price": product.purchase_price,
            "selling_price": product.selling_price,
            "tax_rate": product.tax_rate,

            "inventory_account_id":
                product.inventory_account_id,

            "purchase_account_id":
                product.purchase_account_id,

            "sales_account_id":
                product.sales_account_id,

            "inventory_account":
                product.inventory_account.name
                if product.inventory_account
                else None,

            "purchase_account":
                product.purchase_account.name
                if product.purchase_account
                else None,

            "sales_account":
                product.sales_account.name
                if product.sales_account
                else None,

            "costing_method":
                product.costing_method,

            "reorder_level":
                product.reorder_level,

            "is_active":
                product.is_active,

            "created_at":
                product.created_at.isoformat()
                if product.created_at
                else None
        })

    return result

def get_product(
    db: Session,
    product_id: int
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError(
            "Product not found"
        )

    return {
        "id": product.id,
        "sku": product.sku,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "unit": product.unit,

        "purchase_price":
            product.purchase_price,

        "selling_price":
            product.selling_price,

        "tax_rate":
            product.tax_rate,

        "inventory_account_id":
            product.inventory_account_id,

        "purchase_account_id":
            product.purchase_account_id,

        "sales_account_id":
            product.sales_account_id,

        "inventory_account":
            product.inventory_account.name
            if product.inventory_account
            else None,

        "purchase_account":
            product.purchase_account.name
            if product.purchase_account
            else None,

        "sales_account":
            product.sales_account.name
            if product.sales_account
            else None,

        "costing_method":
            product.costing_method,

        "reorder_level":
            product.reorder_level,

        "is_active":
            product.is_active,

        "created_at":
            product.created_at.isoformat()
            if product.created_at
            else None
    }

def update_product(
    db: Session,
    product_id: int,
    data
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError(
            "Product not found"
        )

    # -----------------------------------------
    # Validate accounts if supplied
    # -----------------------------------------

    account_ids = [
        data.inventory_account_id,
        data.purchase_account_id,
        data.sales_account_id
    ]

    for account_id in account_ids:

        if account_id is None:
            continue

        account = (
            db.query(Account)
            .filter(Account.id == account_id)
            .first()
        )

        if not account:
            raise ValueError(
                f"Account {account_id} does not exist"
            )

    # -----------------------------------------
    # Validate costing method
    # -----------------------------------------

    if data.costing_method:

        costing_method = (
            data.costing_method
            .strip()
            .upper()
        )

        if costing_method not in {
            "WEIGHTED_AVERAGE",
            "FIFO"
        }:
            raise ValueError(
                "Costing method must be "
                "WEIGHTED_AVERAGE or FIFO"
            )

        product.costing_method = costing_method

    # -----------------------------------------
    # Update fields
    # -----------------------------------------

    if data.name is not None:
        product.name = data.name.strip()

    if data.description is not None:
        product.description = (
            data.description.strip()
        )

    if data.category is not None:
        product.category = (
            data.category.strip()
        )

    if data.unit is not None:
        product.unit = data.unit.strip()

    if data.purchase_price is not None:
        product.purchase_price = (
            data.purchase_price
        )

    if data.selling_price is not None:
        product.selling_price = (
            data.selling_price
        )

    if data.tax_rate is not None:
        product.tax_rate = (
            data.tax_rate
        )

    if data.inventory_account_id is not None:
        product.inventory_account_id = (
            data.inventory_account_id
        )

    if data.purchase_account_id is not None:
        product.purchase_account_id = (
            data.purchase_account_id
        )

    if data.sales_account_id is not None:
        product.sales_account_id = (
            data.sales_account_id
        )

    if data.reorder_level is not None:
        product.reorder_level = (
            data.reorder_level
        )

    if data.is_active is not None:
        product.is_active = (
            data.is_active
        )

    product.updated_at = (
        datetime.now(timezone.utc)
    )

    db.commit()
    db.refresh(product)

    return product

def deactivate_product(
    db: Session,
    product_id: int
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError(
            "Product not found"
        )

    product.is_active = False

    db.commit()
    db.refresh(product)

    return {
        "message":
            "Product deactivated successfully",
        "product_id":
            product.id
    }

def create_customer(db: Session, data):
    customer_code = data.customer_code.strip()
    name = data.name.strip()

    if not customer_code:
        raise ValueError("Customer code is required")

    if not name:
        raise ValueError("Customer name is required")

    existing = (
        db.query(Customer)
        .filter(Customer.customer_code == customer_code)
        .first()
    )

    if existing:
        raise ValueError(
            f"Customer code {customer_code} already exists"
        )

    balance_type = data.opening_balance_type.strip().upper()

    if balance_type not in {"DEBIT", "CREDIT"}:
        raise ValueError(
            "Opening balance type must be DEBIT or CREDIT"
        )

    customer = Customer(
        customer_code=customer_code,
        name=name,
        contact_person=(
            data.contact_person.strip()
            if data.contact_person
            else None
        ),
        phone=data.phone.strip() if data.phone else None,
        email=data.email.strip() if data.email else None,
        billing_address=(
            data.billing_address.strip()
            if data.billing_address
            else None
        ),
        shipping_address=(
            data.shipping_address.strip()
            if data.shipping_address
            else None
        ),
        gstin=data.gstin.strip() if data.gstin else None,
        state=data.state.strip() if data.state else None,
        state_code=(
            data.state_code.strip()
            if data.state_code
            else None
        ),
        pan=data.pan.strip() if data.pan else None,
        payment_terms=data.payment_terms,
        credit_limit=data.credit_limit,
        opening_balance=data.opening_balance,
        opening_balance_type=balance_type,
        is_active=True
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer

def get_customers(
    db: Session,
    search: str = None,
    active_only: bool = True
):
    query = (
        db.query(Customer)
        .order_by(Customer.name.asc())
    )

    if active_only:
        query = query.filter(
            Customer.is_active == True
        )

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            (Customer.name.ilike(search_term))
            |
            (Customer.customer_code.ilike(search_term))
            |
            (Customer.phone.ilike(search_term))
            |
            (Customer.gstin.ilike(search_term))
        )

    customers = query.all()

    return [
        {
            "id": customer.id,
            "customer_code": customer.customer_code,
            "name": customer.name,
            "contact_person": customer.contact_person,
            "phone": customer.phone,
            "email": customer.email,
            "billing_address": customer.billing_address,
            "shipping_address": customer.shipping_address,
            "gstin": customer.gstin,
            "state": customer.state,
            "state_code": customer.state_code,
            "pan": customer.pan,
            "payment_terms": customer.payment_terms,
            "credit_limit": customer.credit_limit,
            "opening_balance": customer.opening_balance,
            "opening_balance_type": customer.opening_balance_type,
            "is_active": customer.is_active,
            "created_at": (
                customer.created_at.isoformat()
                if customer.created_at
                else None
            )
        }
        for customer in customers
    ]

def get_customer(db: Session, customer_id: int):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise ValueError("Customer not found")

    return {
        "id": customer.id,
        "customer_code": customer.customer_code,
        "name": customer.name,
        "contact_person": customer.contact_person,
        "phone": customer.phone,
        "email": customer.email,
        "billing_address": customer.billing_address,
        "shipping_address": customer.shipping_address,
        "gstin": customer.gstin,
        "state": customer.state,
        "state_code": customer.state_code,
        "pan": customer.pan,
        "payment_terms": customer.payment_terms,
        "credit_limit": customer.credit_limit,
        "opening_balance": customer.opening_balance,
        "opening_balance_type": customer.opening_balance_type,
        "is_active": customer.is_active,
        "created_at": (
            customer.created_at.isoformat()
            if customer.created_at
            else None
        )
    }

def update_customer(
    db: Session,
    customer_id: int,
    data
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise ValueError("Customer not found")

    if data.name is not None:
        name = data.name.strip()

        if not name:
            raise ValueError(
                "Customer name cannot be empty"
            )

        customer.name = name

    if data.contact_person is not None:
        customer.contact_person = (
            data.contact_person.strip()
        )

    if data.phone is not None:
        customer.phone = data.phone.strip()

    if data.email is not None:
        customer.email = data.email.strip()

    if data.billing_address is not None:
        customer.billing_address = (
            data.billing_address.strip()
        )

    if data.shipping_address is not None:
        customer.shipping_address = (
            data.shipping_address.strip()
        )

    if data.gstin is not None:
        customer.gstin = data.gstin.strip()

    if data.state is not None:
        customer.state = data.state.strip()

    if data.state_code is not None:
        customer.state_code = data.state_code.strip()

    if data.pan is not None:
        customer.pan = data.pan.strip()

    if data.payment_terms is not None:
        customer.payment_terms = data.payment_terms

    if data.credit_limit is not None:
        customer.credit_limit = data.credit_limit

    if data.opening_balance is not None:
        customer.opening_balance = data.opening_balance

    if data.opening_balance_type is not None:
        balance_type = (
            data.opening_balance_type.strip().upper()
        )

        if balance_type not in {"DEBIT", "CREDIT"}:
            raise ValueError(
                "Opening balance type must be DEBIT or CREDIT"
            )

        customer.opening_balance_type = balance_type

    if data.is_active is not None:
        customer.is_active = data.is_active

    customer.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(customer)

    return customer

def deactivate_customer(
    db: Session,
    customer_id: int
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise ValueError("Customer not found")

    customer.is_active = False

    db.commit()
    db.refresh(customer)

    return {
        "message": "Customer deactivated successfully",
        "customer_id": customer.id
    }

def create_supplier(db: Session, data):
    supplier_code = data.supplier_code.strip()
    name = data.name.strip()

    if not supplier_code:
        raise ValueError("Supplier code is required")

    if not name:
        raise ValueError("Supplier name is required")

    existing = (
        db.query(Supplier)
        .filter(
            Supplier.supplier_code == supplier_code
        )
        .first()
    )

    if existing:
        raise ValueError(
            f"Supplier code {supplier_code} already exists"
        )

    balance_type = data.opening_balance_type.strip().upper()

    if balance_type not in {"DEBIT", "CREDIT"}:
        raise ValueError(
            "Opening balance type must be DEBIT or CREDIT"
        )

    supplier = Supplier(
        supplier_code=supplier_code,
        name=name,
        contact_person=(
            data.contact_person.strip()
            if data.contact_person
            else None
        ),
        phone=data.phone.strip() if data.phone else None,
        email=data.email.strip() if data.email else None,
        address=(
            data.address.strip()
            if data.address
            else None
        ),
        gstin=data.gstin.strip() if data.gstin else None,
        state=data.state.strip() if data.state else None,
        state_code=(
            data.state_code.strip()
            if data.state_code
            else None
        ),
        pan=data.pan.strip() if data.pan else None,
        payment_terms=data.payment_terms,
        credit_limit=data.credit_limit,
        opening_balance=data.opening_balance,
        opening_balance_type=balance_type,
        is_active=True
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier

def get_suppliers(
    db: Session,
    search: str = None,
    active_only: bool = True
):
    query = (
        db.query(Supplier)
        .order_by(Supplier.name.asc())
    )

    if active_only:
        query = query.filter(
            Supplier.is_active == True
        )

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            (Supplier.name.ilike(search_term))
            |
            (Supplier.supplier_code.ilike(search_term))
            |
            (Supplier.phone.ilike(search_term))
            |
            (Supplier.gstin.ilike(search_term))
        )

    suppliers = query.all()

    return [
        {
            "id": supplier.id,
            "supplier_code": supplier.supplier_code,
            "name": supplier.name,
            "contact_person": supplier.contact_person,
            "phone": supplier.phone,
            "email": supplier.email,
            "address": supplier.address,
            "gstin": supplier.gstin,
            "state": supplier.state,
            "state_code": supplier.state_code,
            "pan": supplier.pan,
            "payment_terms": supplier.payment_terms,
            "credit_limit": supplier.credit_limit,
            "opening_balance": supplier.opening_balance,
            "opening_balance_type": supplier.opening_balance_type,
            "is_active": supplier.is_active,
            "created_at": (
                supplier.created_at.isoformat()
                if supplier.created_at
                else None
            )
        }
        for supplier in suppliers
    ]

def get_supplier(db: Session, supplier_id: int):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise ValueError("Supplier not found")

    return {
        "id": supplier.id,
        "supplier_code": supplier.supplier_code,
        "name": supplier.name,
        "contact_person": supplier.contact_person,
        "phone": supplier.phone,
        "email": supplier.email,
        "address": supplier.address,
        "gstin": supplier.gstin,
        "state": supplier.state,
        "state_code": supplier.state_code,
        "pan": supplier.pan,
        "payment_terms": supplier.payment_terms,
        "credit_limit": supplier.credit_limit,
        "opening_balance": supplier.opening_balance,
        "opening_balance_type": supplier.opening_balance_type,
        "is_active": supplier.is_active,
        "created_at": (
            supplier.created_at.isoformat()
            if supplier.created_at
            else None
        )
    }

def update_supplier(
    db: Session,
    supplier_id: int,
    data
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise ValueError("Supplier not found")

    if data.name is not None:
        name = data.name.strip()

        if not name:
            raise ValueError(
                "Supplier name cannot be empty"
            )

        supplier.name = name

    if data.contact_person is not None:
        supplier.contact_person = (
            data.contact_person.strip()
        )

    if data.phone is not None:
        supplier.phone = data.phone.strip()

    if data.email is not None:
        supplier.email = data.email.strip()

    if data.address is not None:
        supplier.address = data.address.strip()

    if data.gstin is not None:
        supplier.gstin = data.gstin.strip()

    if data.state is not None:
        supplier.state = data.state.strip()

    if data.state_code is not None:
        supplier.state_code = data.state_code.strip()

    if data.pan is not None:
        supplier.pan = data.pan.strip()

    if data.payment_terms is not None:
        supplier.payment_terms = data.payment_terms

    if data.credit_limit is not None:
        supplier.credit_limit = data.credit_limit

    if data.opening_balance is not None:
        supplier.opening_balance = data.opening_balance

    if data.opening_balance_type is not None:
        balance_type = (
            data.opening_balance_type.strip().upper()
        )

        if balance_type not in {"DEBIT", "CREDIT"}:
            raise ValueError(
                "Opening balance type must be DEBIT or CREDIT"
            )

        supplier.opening_balance_type = balance_type

    if data.is_active is not None:
        supplier.is_active = data.is_active

    supplier.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(supplier)

    return supplier

def deactivate_supplier(
    db: Session,
    supplier_id: int
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise ValueError("Supplier not found")

    supplier.is_active = False

    db.commit()
    db.refresh(supplier)

    return {
        "message": "Supplier deactivated successfully",
        "supplier_id": supplier.id
    }

# ============================================================
# INVENTORY / STOCK SERVICES
# ============================================================

ALLOWED_STOCK_MOVEMENT_TYPES = {
    "OPENING",
    "PURCHASE",
    "SALE",
    "PURCHASE_RETURN",
    "SALES_RETURN",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT"
}

def create_stock_movement(
    db: Session,
    data
):
    """
    Create a stock movement.

    Positive stock movement:
        OPENING
        PURCHASE
        SALES_RETURN
        ADJUSTMENT_IN

    Negative stock movement:
        SALE
        PURCHASE_RETURN
        ADJUSTMENT_OUT
    """

    product = (
        db.query(Product)
        .filter(Product.id == data.product_id)
        .first()
    )

    if not product:
        raise ValueError(
            f"Product {data.product_id} does not exist"
        )

    movement_type = (
        data.movement_type
        .strip()
        .upper()
    )

    if movement_type not in ALLOWED_STOCK_MOVEMENT_TYPES:
        raise ValueError(
            "Invalid stock movement type. "
            "Allowed types: "
            + ", ".join(
                sorted(ALLOWED_STOCK_MOVEMENT_TYPES)
            )
        )

    if data.quantity <= 0:
        raise ValueError(
            "Quantity must be greater than zero"
        )

    if data.unit_cost < 0:
        raise ValueError(
            "Unit cost cannot be negative"
        )

    movement = StockMovement(
        product_id=data.product_id,

        movement_type=movement_type,

        quantity=data.quantity,

        unit_cost=data.unit_cost,

        reference_type=(
            data.reference_type.strip()
            if data.reference_type
            else None
        ),

        reference_id=data.reference_id,

        movement_date=(
            data.movement_date
            if data.movement_date
            else datetime.now(timezone.utc)
        ),

        notes=(
            data.notes.strip()
            if data.notes
            else None
        )
    )

    db.add(movement)

    db.commit()

    db.refresh(movement)

    return movement

def get_product_stock(
    db: Session,
    product_id: int
):
    """
    Calculate current stock quantity
    from all stock movements.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError(
            f"Product {product_id} does not exist"
        )

    movements = (
        db.query(StockMovement)
        .filter(
            StockMovement.product_id == product_id
        )
        .order_by(
            StockMovement.movement_date,
            StockMovement.id
        )
        .all()
    )

    stock_quantity = 0

    for movement in movements:

        if movement.movement_type in {
            "OPENING",
            "PURCHASE",
            "SALES_RETURN",
            "ADJUSTMENT_IN"
        }:

            stock_quantity += movement.quantity

        elif movement.movement_type in {
            "SALE",
            "PURCHASE_RETURN",
            "ADJUSTMENT_OUT"
        }:

            stock_quantity -= movement.quantity

    return {
        "product_id": product.id,
        "sku": product.sku,
        "product_name": product.name,
        "unit": product.unit,
        "stock_quantity": round(
            stock_quantity,
            4
        ),
        "reorder_level": product.reorder_level,
        "is_low_stock": (
            stock_quantity <= product.reorder_level
        )
    }

def get_stock_ledger(
    db: Session,
    product_id: int
):
    """
    Return complete stock movement history
    with running quantity.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError(
            f"Product {product_id} does not exist"
        )

    movements = (
        db.query(StockMovement)
        .filter(
            StockMovement.product_id == product_id
        )
        .order_by(
            StockMovement.movement_date,
            StockMovement.id
        )
        .all()
    )

    running_quantity = 0

    result = []

    for movement in movements:

        quantity_in = 0
        quantity_out = 0

        if movement.movement_type in {
            "OPENING",
            "PURCHASE",
            "SALES_RETURN",
            "ADJUSTMENT_IN"
        }:

            quantity_in = movement.quantity

            running_quantity += movement.quantity

        else:

            quantity_out = movement.quantity

            running_quantity -= movement.quantity

        result.append({

            "id": movement.id,

            "product_id": product.id,

            "sku": product.sku,

            "product_name": product.name,

            "movement_type":
                movement.movement_type,

            "quantity_in":
                quantity_in,

            "quantity_out":
                quantity_out,

            "unit_cost":
                movement.unit_cost,

            "movement_value":
                round(
                    movement.quantity
                    * movement.unit_cost,
                    2
                ),

            "running_quantity":
                round(
                    running_quantity,
                    4
                ),

            "reference_type":
                movement.reference_type,

            "reference_id":
                movement.reference_id,

            "movement_date":
                movement.movement_date,

            "notes":
                movement.notes

        })

    return result

def get_inventory_summary(db: Session):
    """
    Return the current stock position of all active products.

    Stock status:
        OUT_OF_STOCK  -> stock <= 0
        LOW_STOCK     -> stock > 0 and stock <= reorder level
        IN_STOCK      -> stock > reorder level
    """

    products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.name)
        .all()
    )

    result = []

    for product in products:

        stock = get_product_stock(
            db,
            product.id
        )

        stock_quantity = float(
            stock["stock_quantity"] or 0
        )

        reorder_level = float(
            product.reorder_level or 0
        )


        # ------------------------------------------
        # STOCK STATUS
        # ------------------------------------------

        if stock_quantity <= 0:

            stock_status = "OUT_OF_STOCK"

        elif stock_quantity <= reorder_level:

            stock_status = "LOW_STOCK"

        else:

            stock_status = "IN_STOCK"


        result.append({

            "product_id": product.id,

            "sku": product.sku,

            "product_name": product.name,

            "category": product.category,

            "unit": product.unit,

            "stock_quantity": round(
                stock_quantity,
                4
            ),

            "reorder_level": round(
                reorder_level,
                4
            ),

            "stock_status": stock_status,

            "is_low_stock":
                stock_status in {
                    "LOW_STOCK",
                    "OUT_OF_STOCK"
                },

        })


    return result

def get_inventory_alerts(db: Session):
    """
    Return inventory items that require attention.

    Alert status:
        OUT_OF_STOCK -> stock <= 0
        LOW_STOCK    -> stock > 0 and stock <= reorder level

    Products with stock above their reorder level
    are not included.
    """

    products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.name)
        .all()
    )

    alerts = []

    for product in products:

        stock = get_product_stock(
            db,
            product.id
        )

        stock_quantity = float(
            stock["stock_quantity"] or 0
        )

        reorder_level = float(
            product.reorder_level or 0
        )


        # ------------------------------------------
        # OUT OF STOCK
        # ------------------------------------------

        if stock_quantity <= 0:

            stock_status = "OUT_OF_STOCK"


        # ------------------------------------------
        # LOW STOCK
        # ------------------------------------------

        elif stock_quantity <= reorder_level:

            stock_status = "LOW_STOCK"


        # ------------------------------------------
        # NORMAL STOCK
        # ------------------------------------------

        else:

            continue


        alerts.append({

            "product_id": product.id,

            "sku": product.sku,

            "product_name": product.name,

            "category": product.category,

            "unit": product.unit,

            "stock_quantity": round(
                stock_quantity,
                4
            ),

            "reorder_level": round(
                reorder_level,
                4
            ),

            "stock_status": stock_status,

            "shortage_quantity": round(
                max(
                    reorder_level - stock_quantity,
                    0
                ),
                4
            ),

        })


    return {

        "total_alerts": len(alerts),

        "out_of_stock_count": sum(
            1
            for item in alerts
            if item["stock_status"] == "OUT_OF_STOCK"
        ),

        "low_stock_count": sum(
            1
            for item in alerts
            if item["stock_status"] == "LOW_STOCK"
        ),

        "alerts": alerts,

    }

def get_stock_movements(db: Session):

    movements = (
        db.query(StockMovement)
        .order_by(
            StockMovement.movement_date.desc()
        )
        .all()
    )

    return [
        {
            "id": movement.id,
            "product_id": movement.product_id,
            "movement_type": movement.movement_type,
            "quantity": movement.quantity,
            "unit_cost": movement.unit_cost,
            "reference_type": movement.reference_type,
            "reference_id": movement.reference_id,
            "movement_date": (
                movement.movement_date.isoformat()
                if movement.movement_date
                else None
            ),
            "notes": movement.notes,
        }
        for movement in movements
    ]

# ==========================================================
# REORDER REQUESTS
# ==========================================================

ALLOWED_REORDER_PRIORITIES = {
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
}


ALLOWED_REORDER_STATUSES = {
    "DRAFT",
    "REQUESTED",
    "APPROVED",
    "CONVERTED",
    "CANCELLED",
}


def _generate_reorder_request_number(db: Session):
    """
    Generate sequential reorder request numbers.

    Example:
        RR-00001
        RR-00002
        RR-00003
    """

    last_request = (
        db.query(ReorderRequest)
        .order_by(ReorderRequest.id.desc())
        .first()
    )

    if not last_request:
        next_number = 1
    else:
        next_number = last_request.id + 1

    return f"RR-{next_number:05d}"


def create_reorder_request(
    db: Session,
    data
):
    """
    Create a reorder request for a product.

    The current stock position is recalculated from
    stock movements before creating the request.
    """

    product = (
        db.query(Product)
        .filter(Product.id == data.product_id)
        .first()
    )

    if not product:
        raise ValueError(
            f"Product {data.product_id} does not exist"
        )

    # ------------------------------------------------------
    # VALIDATE QUANTITY
    # ------------------------------------------------------

    if data.requested_quantity <= 0:
        raise ValueError(
            "Requested quantity must be greater than zero"
        )

    # ------------------------------------------------------
    # VALIDATE PRIORITY
    # ------------------------------------------------------

    priority = (
        data.priority.strip().upper()
        if data.priority
        else "NORMAL"
    )

    if priority not in ALLOWED_REORDER_PRIORITIES:
        raise ValueError(
            "Invalid priority. Allowed values: "
            + ", ".join(
                sorted(ALLOWED_REORDER_PRIORITIES)
            )
        )

    # ------------------------------------------------------
    # CHECK EXISTING OPEN REQUEST
    # ------------------------------------------------------

    existing_request = (
        db.query(ReorderRequest)
        .filter(
            ReorderRequest.product_id == product.id,
            ReorderRequest.status.in_([
                "DRAFT",
                "REQUESTED",
                "APPROVED",
            ])
        )
        .first()
    )

    if existing_request:
        raise ValueError(
            f"An active reorder request already exists "
            f"for this product: "
            f"{existing_request.request_number}"
        )

    # ------------------------------------------------------
    # CURRENT STOCK
    # ------------------------------------------------------

    stock = get_product_stock(
        db,
        product.id
    )

    stock_quantity = float(
        stock["stock_quantity"] or 0
    )

    reorder_level = float(
        product.reorder_level or 0
    )

    # ------------------------------------------------------
    # CREATE REQUEST
    # ------------------------------------------------------

    request_number = (
        _generate_reorder_request_number(db)
    )

    request = ReorderRequest(

        request_number=request_number,

        product_id=product.id,

        stock_quantity=stock_quantity,

        reorder_level=reorder_level,

        requested_quantity=float(
            data.requested_quantity
        ),

        unit=product.unit or "Nos",

        priority=priority,

        status="DRAFT",

        notes=(
            data.notes.strip()
            if data.notes
            else None
        ),

        created_at=datetime.now(timezone.utc),

        updated_at=datetime.now(timezone.utc),

    )

    db.add(request)

    db.commit()

    db.refresh(request)

    return request


def get_reorder_requests(db: Session):
    """
    Return all reorder requests.
    """

    requests = (
        db.query(ReorderRequest)
        .order_by(
            ReorderRequest.created_at.desc()
        )
        .all()
    )

    result = []

    for request in requests:

        product = request.product

        result.append({

            "id": request.id,

            "request_number":
                request.request_number,

            "product_id":
                request.product_id,

            "sku":
                product.sku if product else None,

            "product_name":
                product.name if product else None,

            "category":
                product.category if product else None,

            "stock_quantity":
                round(
                    request.stock_quantity,
                    4
                ),

            "reorder_level":
                round(
                    request.reorder_level,
                    4
                ),

            "requested_quantity":
                round(
                    request.requested_quantity,
                    4
                ),

            "unit":
                request.unit,

            "priority":
                request.priority,

            "status":
                request.status,

            "notes":
                request.notes,

            "created_at":
                request.created_at,

            "updated_at":
                request.updated_at,

        })

    return result


def get_reorder_request(
    db: Session,
    request_id: int
):
    """
    Get a single reorder request.
    """

    request = (
        db.query(ReorderRequest)
        .filter(
            ReorderRequest.id == request_id
        )
        .first()
    )

    if not request:
        raise ValueError(
            f"Reorder request {request_id} does not exist"
        )

    product = request.product

    return {

        "id": request.id,

        "request_number":
            request.request_number,

        "product_id":
            request.product_id,

        "sku":
            product.sku if product else None,

        "product_name":
            product.name if product else None,

        "category":
            product.category if product else None,

        "stock_quantity":
            round(
                request.stock_quantity,
                4
            ),

        "reorder_level":
            round(
                request.reorder_level,
                4
            ),

        "requested_quantity":
            round(
                request.requested_quantity,
                4
            ),

        "unit":
            request.unit,

        "priority":
            request.priority,

        "status":
            request.status,

        "notes":
            request.notes,

        "created_at":
            request.created_at,

        "updated_at":
            request.updated_at,

    }


def update_reorder_request_status(
    db: Session,
    request_id: int,
    status: str
):
    """
    Update reorder request status.
    """

    request = (
        db.query(ReorderRequest)
        .filter(
            ReorderRequest.id == request_id
        )
        .first()
    )

    if not request:
        raise ValueError(
            f"Reorder request {request_id} does not exist"
        )

    new_status = (
        status.strip().upper()
        if status
        else ""
    )

    if new_status not in ALLOWED_REORDER_STATUSES:
        raise ValueError(
            "Invalid status. Allowed values: "
            + ", ".join(
                sorted(ALLOWED_REORDER_STATUSES)
            )
        )

    # ------------------------------------------------------
    # BASIC STATUS RULES
    # ------------------------------------------------------

    if request.status == "CONVERTED":
        raise ValueError(
            "A converted reorder request cannot be changed"
        )

    if request.status == "CANCELLED":
        raise ValueError(
            "A cancelled reorder request cannot be changed"
        )

    request.status = new_status

    request.updated_at = datetime.now(
        timezone.utc
    )

    db.commit()

    db.refresh(request)

    return request


# ============================================================
# INVENTORY REPORTS — STOCK MOVEMENT REPORT
# ============================================================

INWARD_MOVEMENT_TYPES = {
    "OPENING",
    "PURCHASE",
    "SALES_RETURN",
    "ADJUSTMENT_IN",
}

OUTWARD_MOVEMENT_TYPES = {
    "SALE",
    "PURCHASE_RETURN",
    "ADJUSTMENT_OUT",
}


def get_stock_movement_report(
    db: Session,
    start_date: date = None,
    end_date: date = None,
    product_id: int = None,
    movement_type: str = None,
    limit: int = 50,
    offset: int = 0,
):
    """
    Return a filterable stock movement report.

    Filters:
        start_date
        end_date
        product_id
        movement_type

    Includes:
        Paginated movement records
        Product details
        Inward and outward quantities
        Inward and outward movement values
    """

    # --------------------------------------------------------
    # VALIDATE FILTERS
    # --------------------------------------------------------

    if start_date and end_date and start_date > end_date:
        raise ValueError(
            "Start date cannot be after end date"
        )

    if limit < 1 or limit > 500:
        raise ValueError(
            "Limit must be between 1 and 500"
        )

    if offset < 0:
        raise ValueError(
            "Offset cannot be negative"
        )

    if movement_type:
        movement_type = movement_type.strip().upper()

        if movement_type not in ALLOWED_STOCK_MOVEMENT_TYPES:
            raise ValueError(
                "Invalid movement type. Allowed values: "
                + ", ".join(sorted(ALLOWED_STOCK_MOVEMENT_TYPES))
            )

    # --------------------------------------------------------
    # BUILD FILTERS
    # --------------------------------------------------------

    filters = []

    if start_date:
        start_datetime = datetime.combine(
            start_date,
            time.min
        )

        filters.append(
            StockMovement.movement_date >= start_datetime
        )

    if end_date:
        # Exclusive upper boundary includes the entire end date.
        end_datetime = datetime.combine(
            end_date + timedelta(days=1),
            time.min
        )

        filters.append(
            StockMovement.movement_date < end_datetime
        )

    if product_id is not None:
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

        if not product:
            raise ValueError(
                f"Product {product_id} does not exist"
            )

        filters.append(
            StockMovement.product_id == product_id
        )

    if movement_type:
        filters.append(
            StockMovement.movement_type == movement_type
        )

    # --------------------------------------------------------
    # SUMMARY FOR ALL MATCHING RECORDS
    # --------------------------------------------------------

    total_records = (
        db.query(func.count(StockMovement.id))
        .filter(*filters)
        .scalar()
        or 0
    )

    inward_quantity_expr = case(
        (
            StockMovement.movement_type.in_(
                INWARD_MOVEMENT_TYPES
            ),
            StockMovement.quantity,
        ),
        else_=0,
    )

    outward_quantity_expr = case(
        (
            StockMovement.movement_type.in_(
                OUTWARD_MOVEMENT_TYPES
            ),
            StockMovement.quantity,
        ),
        else_=0,
    )

    inward_value_expr = case(
        (
            StockMovement.movement_type.in_(
                INWARD_MOVEMENT_TYPES
            ),
            StockMovement.quantity * StockMovement.unit_cost,
        ),
        else_=0,
    )

    outward_value_expr = case(
        (
            StockMovement.movement_type.in_(
                OUTWARD_MOVEMENT_TYPES
            ),
            StockMovement.quantity * StockMovement.unit_cost,
        ),
        else_=0,
    )

    totals = (
        db.query(
            func.coalesce(
                func.sum(inward_quantity_expr), 0
            ).label("inward_quantity"),

            func.coalesce(
                func.sum(outward_quantity_expr), 0
            ).label("outward_quantity"),

            func.coalesce(
                func.sum(inward_value_expr), 0
            ).label("inward_value"),

            func.coalesce(
                func.sum(outward_value_expr), 0
            ).label("outward_value"),
        )
        .filter(*filters)
        .one()
    )

    # --------------------------------------------------------
    # FETCH PAGINATED MOVEMENTS
    # --------------------------------------------------------

    rows = (
        db.query(StockMovement, Product)
        .join(
            Product,
            Product.id == StockMovement.product_id
        )
        .filter(*filters)
        .order_by(
            StockMovement.movement_date.desc(),
            StockMovement.id.desc()
        )
        .offset(offset)
        .limit(limit)
        .all()
    )

    movements = []

    for movement, product in rows:
        movements.append({
            "id": movement.id,
            "product_id": movement.product_id,
            "sku": product.sku,
            "product_name": product.name,
            "category": product.category,
            "movement_type": movement.movement_type,
            "quantity": round(float(movement.quantity or 0), 4),
            "unit_cost": round(float(movement.unit_cost or 0), 2),
            "movement_value": round(
                float(movement.quantity or 0)
                * float(movement.unit_cost or 0),
                2,
            ),
            "reference_type": movement.reference_type,
            "reference_id": movement.reference_id,
            "movement_date": (
                movement.movement_date.isoformat()
                if movement.movement_date
                else None
            ),
            "notes": movement.notes,
        })

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "filters": {
            "start_date": (
                start_date.isoformat() if start_date else None
            ),
            "end_date": (
                end_date.isoformat() if end_date else None
            ),
            "product_id": product_id,
            "movement_type": movement_type,
        },
        "pagination": {
            "total_records": total_records,
            "limit": limit,
            "offset": offset,
            "returned_records": len(movements),
        },
        "summary": {
            "total_movements": total_records,
            "total_inward_quantity": round(
                float(totals.inward_quantity or 0), 4
            ),
            "total_outward_quantity": round(
                float(totals.outward_quantity or 0), 4
            ),
            "total_inward_value": round(
                float(totals.inward_value or 0), 2
            ),
            "total_outward_value": round(
                float(totals.outward_value or 0), 2
            ),
        },
        "movements": movements,
    }

#for EBITDA
def get_ebitda(db: Session):
    pnl = get_pnl(db, start_date = None, end_date = None)

    depreciation = 0
    interest = 0

    query = db.query(JournalLine).join(JournalEntry)
    query = apply_date_filter(query, JournalEntry, None, None)
    lines = query.all()
    for l in lines:
        acc = db.query(Account).filter(Account.id == l.account_id).first()
        if not acc:
            continue

        name = acc.name.lower()
        acc_type = acc.type.lower()

        if "depreciation" in name and acc_type == "operating_expense":
            depreciation += (l.debit - l.credit)
        elif acc_type == "non_operating_expense" and "interest" in name:
            interest += (l.debit - l.credit)
    ebitda = pnl["summary"]["profit"] + depreciation + interest

    return {
        "profit": pnl["summary"]["profit"],
        "depreciation": depreciation,
        "interest": interest,
        "ebitda": ebitda
    }

#For Cash_flow:
def get_cash_flow(db:Session, start_date = None, end_date = None):
    operating = 0
    investing = 0
    financing = 0

    line_items = {
        "operating":{
            "net_profit": 0,
            "depreciation": 0,
            "change_in_current_assets": {},
            "change_in_current_liabilities": {}
        },
        "investing": {},
        "financing": {}
    }

    pnl = get_pnl(db, start_date, end_date)
    net_profit = pnl["summary"]["profit"]

    operating += net_profit
    line_items["operating"]["net_profit"] = net_profit

    query = db.query(JournalLine).join(JournalEntry)
    query = apply_date_filter(query, JournalEntry, start_date, end_date)
    lines = query.all()

    for l in lines:
        acc = db.query(Account).filter(Account.id == l.account_id).first()
        if not acc:
            continue

        name = acc.name.lower()
        acc_type = acc.type.lower()
        value = l.debit - l.credit

        if "depreciation" in name and acc_type == "operating_expense":
            dep = (l.debit - l.credit)
            operating += dep
            line_items["operating"]["depreciation"] += dep

        elif acc_type == "current_assets" and name != "cash":
            change = value
            operating -= change
            line_items["operating"]["change_in_current_assets"][name] = \
                line_items["operating"]["change_in_current_assets"].get(name,0) - change
            
        elif acc_type == "current_liabilities":
            change = -value
            operating += change
            line_items["operating"]["change_in_current_liabilities"][name] = \
                line_items["operating"]["change_in_current_liabilities"].get(name,0) + change
            
        elif acc_type == "non_current_assets":
            change = value
            investing -= change
            line_items["investing"][name] = \
                line_items["investing"].get(name,0) - change
            
        elif acc_type == "non_current_liabilities":
            change = -value
            financing += change
            line_items["financing"][name] = \
                line_items["financing"].get(name,0) + change
        
        elif acc_type == "equity":
            change = -value
            financing += change
            line_items["financing"][name] = \
                line_items["financing"].get(name, 0) + change

    # ================= TOTAL =================
    net_cash_flow = operating + investing + financing

    return {
        "summary": {
            "operating_cash_flow": operating,
            "investing_cash_flow": investing,
            "financing_cash_flow": financing,
            "net_cash_flow": net_cash_flow
        },
        "line_items": line_items
    }

#For Balance sheet:
def get_balance_sheet(db: Session, start_date=None, end_date=None):

    current_assets = 0
    non_current_assets = 0
    current_liabilities = 0
    non_current_liabilities = 0
    equity = 0

    line_items = {
        "current_assets": {},
        "non_current_assets": {},
        "current_liabilities": {},
        "non_current_liabilities": {},
        "equity": {}
    }

    query = db.query(JournalLine).join(JournalEntry)
    query = apply_date_filter(query, JournalEntry, start_date, end_date)
    lines = query.all()

    for l in lines:
        acc = db.query(Account).filter(Account.id == l.account_id).first()
        if not acc:
            continue

        name = acc.name.lower()
        acc_type = acc.type.lower()
        value = l.debit - l.credit
        print("BS CHECK:", acc.name, acc.type, l.debit, l.credit)
        # ================= ASSETS =================
        if acc_type == "current_assets":
            current_assets += value
            line_items["current_assets"][name] = \
                line_items["current_assets"].get(name, 0) + value

        elif acc_type == "non_current_assets":
            non_current_assets += value
            line_items["non_current_assets"][name] = \
                line_items["non_current_assets"].get(name, 0) + value
        
        elif acc_type == "contra_asset":
            contra_value = -(value)
            non_current_assets -= contra_value

            line_items["non_current_assets"][name] = \
                line_items["non_current_assets"].get(name,0) - contra_value

        # ================= LIABILITIES =================
        elif acc_type == "current_liabilities":
            current_liabilities += (-value)
            line_items["current_liabilities"][name] = \
                line_items["current_liabilities"].get(name, 0) + (-value)

        elif acc_type == "non_current_liabilities":
            non_current_liabilities += (-value)
            line_items["non_current_liabilities"][name] = \
                line_items["non_current_liabilities"].get(name, 0) + (-value)
            
        elif acc_type == "equity":
            value = l.credit - l.debit
            equity += value

            line_items["equity"][name] = \
                line_items["equity"].get(name, 0) + value
        

    # ================= EQUITY =================
   
    total_assets = current_assets + non_current_assets
    total_liabilities = current_liabilities + non_current_liabilities
    equity = total_assets - total_liabilities
    balance_check = total_assets - (total_liabilities + equity)

    return {
        "summary": {
            "current_assets": current_assets,
            "non_current_assets": non_current_assets,
            "current_liabilities": current_liabilities,
            "non_current_liabilities": non_current_liabilities,
            "equity": equity,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "balance_check": balance_check
        },
        "line_items": line_items
    }
#Invoice system:
def create_invoice(db: Session, customer_id: int, amount: float):
    invoice = Invoice(customer_id = customer_id, amount = amount)

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    #accounting entry:
    receivable = get_on_create_account(db,"Accounts Receivable", "current_assets")
    revenue = get_on_create_account(db,"Revenue","revenue", "Sales Accounts")

    entry = JournalEntry(description = "Invoice created")
    db.add(entry)
    db.commit()
    db.refresh(entry)

    db.add_all([
        JournalLine(entry_id = entry.id, account_id = receivable.id, debit = amount),
        JournalLine(entry_id = entry.id, account_id = revenue.id, credit = amount),
    ])
    db.commit()

    return {"msg": "Invoice created"}

def pay_invoice(db: Session, invoice_id: int):
    invoice = db.query(Invoice).get(invoice_id)
    invoice.status = "paid"

    cash = get_on_create_account(db,"Cash", "asset")
    receivable = get_on_create_account(db, "Accounts Receivable", "asset")
    entry = JournalEntry(description = "Invoice Paid")

    db.add(entry)
    db.commit()
    db.refresh(entry)

    db.add_all([
        JournalLine(entry_id=entry.id, account_id=cash.id, debit=invoice.amount),
        JournalLine(entry_id=entry.id, account_id=receivable.id, credit=invoice.amount),
    ])

    db.commit()
    return {"msg": "Invoice paid"}


#TIME SERIES FORECASTING:
def get_time_series(db: Session, metric: str = "revenue", period:str = "monthly"):
    data = apply_periodic_report(db,period, get_pnl)
    
    series = []

    for item in data:
        summary = item["data"]["summary"]

        if metric == "revenue":
            value = summary["operating_income"]
        elif metric == "expense":
            value = summary["operating_expense"]
        elif metric == "non_operating_income":
            value = summary["non_operating_income"]
        elif metric == "non_operating_expense":
            value = summary["non_operating_expense"]
        elif metric == "profit":
            value = summary["profit"]
        else:
            value = 0

        series.append({
            "label": item["label"],
            "value": value
        })
    return series


#FORECASTING:
def forecast_growth(series):
    values = [x["value"] for x in series if x["value"] != 0]
    if len(values) < 2:
        return 0
    
    growth_rates = []

    for i in range(1, len(values)):
        if values[i-1] != 0:
            growth_rates.append((values[i] - values[i-1]) / values[i-1])
        
    average_growth = sum(growth_rates) / len(growth_rates)
    return values[-1] * (1+ average_growth)

def forecast_moving_average(series, window = 3):
    values = [x["value"] for x in series if x["value"] != 0]

    if len(values) == 0:
        return 0


    if len(values) < window:
        return sum(values) / len(values)
    
    return sum(values[-window:]) / window

def forecast_linear(series):
    values = [x["value"] for x in series]
    
    n = len(values)

    if len(values) <2 :
        return values[-1] if values else 0
    
    x = list(range(n))

    mean_x = sum(x) / n
    mean_y = sum(values) / n

    num = sum((x[i] - mean_x) * (values[i] - mean_y) for i in range(n))
    den = sum((x[i] - mean_x) ** 2 for i in range(n))

    slope = num / den if den != 0 else 0
    intercept = mean_y - slope * mean_x

    return slope * n + intercept


def save_driver(db:Session, data):
    driver = Driver(
        users=data.users,
        user_growth=data.user_growth,
        arpu=data.arpu,
        arpu_growth=data.arpu_growth,
        fixed_cost=data.fixed_cost,
        variable_cost_pct=data.variable_cost_pct
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

def forecast_driver_model(db:Session, periods: int = 12):
    driver = db.query(Driver).order_by(Driver.id.desc()).first()

    users = driver.users
    arpu = driver.arpu

    results = []

    for i in range(periods):
        revenue = users * arpu
        variable_cost = revenue * driver.variable_cost_pct
        total_cost = driver.fixed_cost + variable_cost

        profit = revenue - total_cost

        results.append({
            "period": i +1,
            "users": users,
            "revenue": revenue,
            "cost": total_cost,
            "Gross_Profit": profit
        })

        users *= (1 + driver.user_growth)
        arpu *= (1 + driver.arpu_growth)

    return results

def fix_cash_account_type(db: Session):
    from sqlalchemy import text

    db.execute(text("""
        UPDATE accounts
        SET type = 'current_assets'
        WHERE name = 'cash'
    """))

    db.commit()

    return {"msg": "Cash account fixed"}

#===========================DCF====================================================

def calculate_dcf(data):
    revenue = data.revenue
    growth = data.revenue_growth / 100
    ebitda_margin = data.ebitda_margin / 100
    tax_rate = data.tax_rate / 100
    capex_pct = data.capex_pct / 100
    nwc_pct = data.nwc_pct / 100
    wacc = data.wacc/100
    terminal_growth = data.terminal_growth / 100

    years = data.years

    fcf_lists = []
    pv_fcf = 0

    for t in range (1, years + 1):
        revenue = revenue * (1+growth)
        ebitda = revenue * ebitda_margin

        capex = revenue * capex_pct
        nwc = revenue * nwc_pct

        fcf = ebitda - tax_rate - capex - nwc
        fcf_lists.append(fcf)

        discounted = fcf / ((1+wacc) ** t)
        pv_fcf += discounted

    terminal_fcf = fcf_lists[-1] * (1 + terminal_growth)
    terminal_value = terminal_fcf / (wacc - terminal_growth)

    pv_terminal = terminal_value / ((1+wacc) ** years)

    enterprise_value = pv_fcf + pv_terminal
    equity_value = enterprise_value - data.net_debt
    price_per_share = equity_value / data.shares if data.shares != 0 else 0

    return {
        "enterprise_value": enterprise_value,
        "equity_value": equity_value,
        "price_per_share": price_per_share,
        "pv_fcf": pv_fcf,
        "yearly_fcf": fcf_lists
    }

def dcf_sensitivity(data):
    base_wacc = data.wacc
    base_tg = data.terminal_growth

    wacc_range = [base_wacc -2, base_wacc -1, base_wacc, base_wacc +1, base_wacc +2]
    tg_range = [base_tg -1, base_tg -0.5, base_tg, base_tg +0.5, base_tg +1]

    matrix = []

    for tg in tg_range:
        row = []
        for wacc in wacc_range:
            data.wacc = wacc
            data.terminal_growth = tg

            result = calculate_dcf(data)
            row.append(round(result["price_per_share"],2))

        matrix.append(row)

    return {
        "wacc": wacc_range,
        "terminal_growth": tg_range,
        "matrix": matrix
    }

def monte_carlo_dcf (data, simulations = 500):
    results = []

    for _ in range(simulations):
        growth = random.uniform(data.revenue_growth - 3, data.revenue_growth + 3)
        margin = random.uniform(data.ebitda_margin - 5, data.ebitda_margin + 5)
        wacc = random.uniform(data.wacc - 2, data.wacc + 2)

        #clone data:

        temp = data.copy()
        temp.revenue_growth = growth
        temp.ebitda_margin = margin
        temp.wacc = wacc

        res = calculate_dcf(temp)
        results.append(res["price_per_share"])

    results.sort()

    n = len(results)

    return {
        "values": results,
        "mean": sum(results) / n,
        "min": results[0],
        "max": results[-1],
        "p10": results[int(n * 0.1)],
        "p50": results[int(n * 0.5)],
        "p90": results[int(n * 0.9)]
    }

def calculate_ratios(db: Session):

    pnl = get_pnl(db)
    bs= get_balance_sheet(db)

    summary = pnl["summary"]

    revenue = summary.get("operating_income", 0)
    operating_expense = summary.get("operating_expense", 0)
    net_profit = summary.get("profit", 0)

    total_assets = bs["summary"].get("total_assets", 0)
    equity = bs["summary"].get("equity", 0)
    total_liabilities = bs["summary"].get("total_liabilities", 0)

    current_assets = sum(bs["line_items"]["current_assets"].values())
    current_liabilities = sum(bs["line_items"]["current_liabilities"].values())

    inventory = (bs["line_items"]["current_assets"].get("inventory", 0))

    current_ratio = current_assets / current_liabilities if current_liabilities else None 
    quick_ratio = (current_assets - inventory) / current_liabilities if current_liabilities else None
    debt_to_equity = total_liabilities / equity if equity else None
    net_margin = net_profit / revenue * 100 if revenue else None
    roa = net_profit / total_assets * 100 if total_assets else None
    roe = net_profit / equity * 100 if equity else None
    
    return {
        "liquidity": {
            "current_ratio": round(current_ratio, 2),
            "quick_ratio": round(quick_ratio, 2),
        },

        "leverage": {
            "debt_to_equity": round(debt_to_equity, 2),
        },

        "profitability": {
            "net_margin": round(net_margin, 2),
            "roa": round(roa, 2),
            "roe": round(roe, 2),
        }
    }


def generate_financial_report (db:Session):
    pnl = get_pnl(db)
    bs = get_balance_sheet(db)
    ratios = calculate_ratios(db)

    insights = []

    revenue = pnl["summary"]["operating_income"]
    profit = pnl["summary"]["profit"]
    expenses = pnl["summary"]["operating_expense"]

    current_ratio = ratios["liquidity"]["current_ratio"]
    debt_to_equity = ratios["leverage"]["debt_to_equity"]
    roe = ratios["profitability"]["roe"]

    if revenue > 100000:
        insights.append({
            "type": "positive",
            "title": "Strong Revenue Performance",
            "message": f"Revenue is strong at ${revenue:,.2f}"
        })

    if profit < 0:
        insights.append({
            "type": "negative",
            "title": "Net Loss Alert",
            "message": f"The company is operating at a net loss of ${profit:,.2f}"
        })

    if expenses > revenue * 0.8:
        insights.append({
            "type": "negative",
            "title": "High Expense Ratio",
            "message": f"Operating expenses are high at ${expenses:,.2f}, which is {expenses/revenue:.2%} of revenue."
        })

    if current_ratio > 2:
        insights.append({
            "type": "positive",
            "title": "Healthy Liquidity",
            "message": f"Current ratio is healthy at {current_ratio:.2f}"
        })

    if debt_to_equity > 2:
        insights.append({
            "type": "negative",
            "title": "High Leverage",
            "message": f"Debt to equity ratio is high at {debt_to_equity:.2f}"
        })

    if roe > 15:
        insights.append({
            "type": "positive",
            "title": "Strong Return on Equity",
            "message": f"Return on equity is strong at {roe:.2f}%"
        })

    if not insights:
        insights.append({
            "type": "neutral",
            "title": "Stable Performance",
            "message": "The company's financial performance appears stable with no major red flags."
        })

    return insights