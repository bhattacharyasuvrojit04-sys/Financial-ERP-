from sqlalchemy.orm import Session
from .models import Account, JournalEntry, JournalLine, Invoice,Rule, Driver
from .ai import classify
from datetime import datetime, timedelta

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
def apply_date_filter(query, model, start_date, end_date):
    if not start_date and not end_date: 
        return query


    if start_date and isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date)

    if end_date and isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date)

    if start_date:
        query = query.filter(model.created_at >= start_date)

    if end_date:
        query = query.filter(model.created_at <= end_date)

    return query

def get_on_create_account(db,name, type_):
    name = name.lower()
    type_ = type_.lower()

    acc = db.query(Account).filter(Account.name == name).first()
    if not acc:
        acc = Account(name = name, type = type_)
        db.add(acc)
        db.commit()
        db.refresh(acc)
    return acc

def create_transaction(db: Session, description: str, amount: float, date: str = None):
    entry_date = datetime.fromisoformat(date) if date else datetime.now()
    rule = db.query(Rule).all()
    category = classify(description, rule)

    entry = JournalEntry(description = description, created_at = entry_date)
    db.add(entry)
    db.commit()
    db.refresh(entry)

    cash = get_on_create_account(db, "cash", "asset")

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

    elif category == "asset":
        asset = get_on_create_account(db,description.lower(),"asset")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = asset.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = cash.id, credit = amount),
        ])

    elif category == "liability":
        liability = get_on_create_account(db,description.lower(),"liability")

        db.add_all([
            JournalLine(entry_id = entry.id, account_id = cash.id, debit = amount),
            JournalLine(entry_id = entry.id, account_id = liability.id, credit = amount),
        ])

    db.commit()
    return {"msg": "Transaction recorded", "category": category}
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
    elif period == "yearly":
        start = datetime(today.year, 1, 1)
        end = datetime(today.year, 12, 31)

        result = report_func(db, start, end)
        results.append({
            "label": str(today.year),
            "data": result
        })
    return results


#Depreciation:
def apply_depreciation(db: Session, asset_name: str, amount: float):
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
    return {"msg": f"Depreciation applied for {asset_name}"} 

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

        #operating activities:
        if acc_type in ["operating_income", "operating_expense"]:
            operating += -value
        
        if "depreciation" in name:
            operating += (l.debit - l.credit)

        elif acc_type == "asset" and name != "cash":
            investing += -value

        elif acc_type == "liability":
            financing += (-value)

    net_cash_flow = operating + investing + financing

    return {
        "operating_cash_flow": operating,
        "investing_cash_flow": investing,
        "financing_cash_flow": financing,
        "net_cash_flow": net_cash_flow
    }


#For Balance sheet:
def get_balance_sheet(db: Session, start_date = None, end_date = None):
    asset = 0
    liability = 0
    equity = 0
    
    asset_detail = {}
    liability_detail = {}

    query = db.query(JournalLine).join(JournalEntry)
    query = apply_date_filter(query, JournalEntry, start_date, end_date)
    lines = query.all()

    for l in lines:
        acc = db.query(Account).filter(Account.id == l.account_id).first()
        value = l.debit - l.credit

        if acc.type == 'asset':
            asset += value
            asset_detail[acc.name] = asset_detail.get(acc.name,0) + value
        elif acc.type == "liability":
            liability += -value
            liability_detail[acc.name] = liability_detail.get(acc.name,0) + (-value)
        elif acc.type == "contra_asset":
            asset -= (l.credit - l.debit)
    pnl = get_pnl(db)
    equity = pnl["summary"]["profit"]

    balance_check = asset - (liability + equity)

    return {
        "total_assets": asset,
        "total_liabilities": liability,
        "equity": equity,
        "balance_check": balance_check,
        "assets_breakdown": asset_detail,
        "liabilities_breakdown": liability_detail
    }

#Invoice system:
def create_invoice(db: Session, customer_id: int, amount: float):
    invoice = Invoice(customer_id = customer_id, amount = amount)

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    #accounting entry:
    receivable = get_on_create_account(db,"Accounts Receivable", "asset")
    revenue = get_on_create_account(db,"Revenue","revenue")

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