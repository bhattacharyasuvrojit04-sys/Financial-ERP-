from typing import Dict
import math
from app.Project_Finance.debt_schedule import build_debt_schedule

def build_project_statement(project):

    projection = []

    total_capex = sum(item.amount for item in project.capex_items)

    cumulative_retained_earnings = 0

    previous_nwc = 0

    opening_cash = 0

    total_equity_contribution = sum(item.amount for item in project.equity_items)

    debt_schedule = build_debt_schedule(project)

    construction_years = math.ceil(project.construction_period_months / 12)

    cumulative_idc = 0

    for year in range(1, project.project_life + 1):

        revenue = 0

        revenue_breakdown = {}

        if year > construction_years:
                
                for item in project.revenue_items:

                    if item.revenue_type.lower() == "solar":

                        tariff_year = (
                            item.tariff *
                            (1 + item.tariff_escalation / 100) ** (year - construction_years - 1)
                        )

                        cuf_year = (
                            item.cuf *
                            (1 - item.degradation_rate / 100) ** (year - construction_years - 1)
                        )

                        generation = (
                            item.capacity_mw
                            * 1000
                            * item.operating_hours
                            * (cuf_year / 100)
                        )

                        value = generation * tariff_year

                    elif item.revenue_type.lower() == "hotel":

                        occupancy = min(
                            item.occupancy_pct + (year - construction_years - 1),
                            90
                        )

                        adr_year = (
                            item.adr *
                            (1 + item.growth_rate / 100) ** (year - construction_years - 1)
                        )

                        value = (
                            item.rooms
                            * occupancy / 100
                            * adr_year
                            * 365
                        )

                    else:

                        value = (
                            item.amount *
                            (1 + item.growth_rate / 100) ** (year - construction_years - 1)
                        )

                    revenue += value
                    revenue_breakdown[item.name] = round(value,2)

        # ==========Opex ===============

                opex = 0
                opex_breakdown = {}

                if year > construction_years:

                    for item in project.opex_items:
                        
                        value = (item.amount * (1+ item.escalation_rate / 100)** (year - construction_years - 1))

                    opex += value

                    opex_breakdown[item.name] = round(value , 2)

                ebitda = revenue - opex

                year_start_month = (
                        (year - 1) * 12
                    ) + 1

                year_end_month = (
                        year * 12
                    )

                year_rows = [
                        row
                        for row in debt_schedule

                        if year_start_month
                        <= row["month"]
                        <= year_end_month

                    ]
                
                opening_debt = (
                    year_rows[0]["opening_balance"]
                    if year_rows
                    else 0
                )

                principal = sum(
                    row["principal"]
                    for row in year_rows
                )

                interest = sum(
                    row["interest"]
                    for row in year_rows
                )

                idc = sum(
                    row["idc"]
                    for row in year_rows
                )

                cumulative_idc += idc

                capitalized_cost = total_capex + cumulative_idc

                annual_depreciation = (capitalized_cost /project.depreciation_years)

                if year <= construction_years:

                    depreciation = 0

                elif year <= construction_years + project.depreciation_years:

                    depreciation = annual_depreciation

                else:

                    depreciation = 0

                ebit = ebitda - depreciation

                closing_debt = (
                    year_rows[-1]["closing_balance"]
                    if year_rows
                    else 0
                )

                debt_drawn = sum(
                    row["drawdown"]
                    for row in year_rows
                )

                if year <= construction_years:

                    interest_expense = 0
                else:

                    interest_expense = interest
                    

                ebt = (ebit - interest_expense)

                tax = max(ebt * project.tax_rate / 100, 0)

                pat = (ebt - tax)

                # =========Working Capital========

                receivables = (
                    revenue * project.working_capital.receivable_days / 365
                )

                payables = (
                    opex * project.working_capital.payable_days / 365
                )

                inventory = (
                    opex * project.working_capital.inventory_days / 365
                )

                nwc = (receivables + inventory - payables)

                change_in_nwc = (nwc - previous_nwc)

                previous_nwc = nwc

                #Non_Current_assets============================

                non_current_asset_investment = 0
                
                for item in project.asset_items:

                    if item.asset_type == "non_current":
                        value = (item.amount * (1 + item.growth_rate)**(year - 1))

                        previous_value = (item.amount * (1+ item.growth_rate)**(year -2)) if year > 1 else 0

                        non_current_asset_investment += (value - previous_value)

                #Non_current_liabilities:

                non_current_liability_change = 0

                for item in project.liability_items:

                    value = (item.amount * (1 + item.growth_rate)**(year - 1))

                    previous_value = (item.amount * (1 + item.growth_rate) ** (year - 2)) if year > 1 else 0

                    non_current_liability_change += (value - previous_value)


                

                #cashflows

                cashflow_operations = (pat + depreciation - change_in_nwc)

                cashflow_investing = ((-total_capex if year == 1 else 0)
                                    - idc
                                    - non_current_asset_investment)

                if year == 1:

                    equity_drawn = total_equity_contribution

                else:

                    equity_drawn = 0

                cashflow_financing = (
                    debt_drawn - principal + equity_drawn + non_current_liability_change
                )

                net_cash_flow = (cashflow_financing + cashflow_investing + cashflow_operations)

                closing_cash = (opening_cash + net_cash_flow)

                opening_cash = closing_cash


                # ===========Assets==========

                asset_breakdown = {}

                total_assets = 0

                asset_breakdown["cash"] = round(closing_cash,2)
                asset_breakdown["Accounts Receivable"] = round(receivables ,2)
                asset_breakdown["Inventory"] = round(inventory, 2)
                total_assets += closing_cash 
                total_assets += receivables
                total_assets += inventory 

                years_depreciated = max(
                    0,
                    year - construction_years
                )

                accumulated_depreciation = min(annual_depreciation * years_depreciated, capitalized_cost)

                net_fixed_assets = (capitalized_cost - accumulated_depreciation)

                asset_breakdown["Net Fixed Assets"] = round(net_fixed_assets , 2)

                total_assets += net_fixed_assets

            

                for item in project.asset_items:

                    value = (item.amount * (1 + item.growth_rate / 100)**(year - 1))

                    asset_breakdown[item.name] = round(value, 2)

                    total_assets += value


                #==============Liabilities==========

                liability_breakdown = {}

                total_liabilities = 0

                liability_breakdown["Accounts Payables"] = round(payables, 2)

                liability_breakdown["Project Debt"] = round(closing_debt, 2)

                total_liabilities += payables
                total_liabilities += closing_debt

                


                for item in project.liability_items:

                    value = (item.amount * (1+ item.growth_rate / 100)**(year - 1))

                    liability_breakdown[item.name] = round(value, 2)

                    total_liabilities += value

                    

                #============equity=================

                equity_breakdown = {}

                total_equity = 0

                for item in project.equity_items:

                    value = (item.amount * (1 + item.growth_rate / 100)**(year - 1))

                    equity_breakdown[item.name] = round(value, 2)

                    total_equity += value
                

                # Add retained earnings

                cumulative_retained_earnings += pat

                retained_earnings = cumulative_retained_earnings

                equity_breakdown["Retained Earnings"] = round(
                    retained_earnings,
                    2
                )

                total_equity += retained_earnings

                balance_sheet_gap = (total_assets - (total_equity + total_liabilities))

                projection.append({

                    "year": year,

                    # ====================
                    # INCOME STATEMENT
                    # ====================

                    "revenue": round(revenue, 2),

                    "revenue_breakdown": revenue_breakdown,

                    "opex": round(opex, 2),

                    "opex_breakdown": opex_breakdown,

                    "ebitda": round(ebitda, 2),

                    "depreciation": round(depreciation, 2),

                    "ebit": round(ebit, 2),

                    "interest": round(interest, 2),

                    "idc": round(idc,2),

                    "capitalized_cost": round(capitalized_cost,2),

                    "interest_expense": round(interest_expense,2),

                    "ebt": round(ebt, 2),

                    "tax": round(tax, 2),

                    "pat": round(pat, 2),

                    # ====================
                    # WORKING CAPITAL
                    # ====================

                    "receivables": round(receivables, 2),

                    "inventory": round(inventory, 2),

                    "payables": round(payables, 2),

                    "nwc": round(nwc, 2),

                    "change_in_nwc": round(change_in_nwc, 2),

                    # ====================
                    # CASH FLOW STATEMENT
                    # ====================

                    "cashflow_operations":
                        round(cashflow_operations, 2),

                    "cashflow_investing":
                        round(cashflow_investing, 2),

                    "cashflow_financing":
                        round(cashflow_financing, 2),

                    "net_cash_flow":
                        round(net_cash_flow, 2),

                    "closing_cash":
                        round(closing_cash, 2),

                    "debt_drawn": round(debt_drawn, 2),

                    "equity_drawn": round(equity_drawn, 2),

                    "principal_repayment": round(principal, 2),

                    "capex_outflow": round(
                        total_capex if year == 1 else 0,
                        2
                    ),

                    "non_current_asset_investment":
                        round(non_current_asset_investment, 2),

                    "non_current_liability_change":
                        round(non_current_liability_change, 2),

                    "opening_cash":
                        round(opening_cash - net_cash_flow, 2),

                    # ====================
                    # DEBT SCHEDULE
                    # ====================

                    "opening_debt":
                        round(opening_debt, 2)
                        if year <= project.loan_tenor
                        else 0,

                    "principal":
                        round(principal, 2),

                    "interest_expense":
                        round(interest, 2),

                    "closing_debt":
                        round(closing_debt, 2),

                    # ====================
                    # BALANCE SHEET
                    # ====================

                    "total_assets":
                        round(total_assets, 2),

                    "asset_breakdown":
                        asset_breakdown,

                    "total_liabilities":
                        round(total_liabilities, 2),

                    "liability_breakdown":
                        liability_breakdown,

                    "total_equity":
                        round(total_equity, 2),

                    "equity_breakdown":
                        equity_breakdown,

                    "balance_sheet_gap":
                        round(balance_sheet_gap, 2)

                })

        return {
        "projection": projection,
        "debt_schedule": debt_schedule
    }



                
                    