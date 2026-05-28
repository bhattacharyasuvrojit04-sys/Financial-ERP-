from sqlalchemy.orm import Session
from .models import Account, JournalEntry, JournalLine, Invoice,Rule, Driver
from .ai import classify
from datetime import datetime, timedelta
from sqlalchemy import text
import random

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

def get_on_create_account(db,name, type_, sub_type = None):
    name = name.lower()
    type_ = type_.lower()

    acc = db.query(Account).filter(Account.name == name).first()
    if not acc:
        acc = Account(name = name, type = type_)
        db.add(acc)
        db.commit()
        db.refresh(acc)
    else:
        #FIX: update type if wrong
        if acc.type != type_:
            print(f"Fixing account type: {name} {acc.type} → {type_}")
            acc.type = type_
            db.commit()

    return acc
    

def create_transaction(db: Session, description: str, amount: float, date: str = None):
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

    line_items = {
        "current_assets": {},
        "non_current_assets": {},
        "current_liabilities": {},
        "non_current_liabilities": {}
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