from typing import Dict
import math

from openai import project
from app.Project_Finance.debt_schedule import build_debt_schedule
from app.Project_Finance.asset_schedule import build_asset_schedule
from app.Project_Finance.working_capital import build_working_capital
from app.Project_Finance.cogs import build_cogs

def build_project_statement(project):

    projection = []

    cumulative_retained_earnings = 0

    previous_nwc = 0

    opening_cash = 0

    working_capital_inputs = []

    total_equity_contribution = sum(item.amount for item in project.equity_items)

    debt_schedule = build_debt_schedule(project)

    asset_schedule = build_asset_schedule(project)

    construction_years = math.ceil(project.construction_period_months / 12)

    cumulative_idc = 0

    for year in range(1, project.project_life + 1):

        asset_year = asset_schedule[year - 1]

        gross_block = asset_year["total_gross_block"]

        purchase_this_year = sum(
            a["purchase"]
            for a in asset_year["assets"]
        )

        sale_this_year = sum(
            a["sale"]
            for a in asset_year["assets"]
        )

        accumulated_depreciation = asset_year["total_acc_dep"]

        depreciation = sum(
            a["depreciation"]
            for a in asset_year["assets"]
        )

        #COGS and Revenue calculations
        generation = 0

        occupied_room_nights = 0

        revenue = 0

        revenue_breakdown = {}

        print(
            f"\nYEAR {year}: "
            f"construction_years={construction_years}"
        )

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

                        revenue_breakdown[item.name] = {
                        
                                                "type": "solar",
                        
                                                "capacity_mw": item.capacity_mw,
                        
                                                "operating_hours": item.operating_hours,
                        
                                                "cuf": round(cuf_year,2),
                        
                                                "generation": round(generation,2),
                        
                                                "tariff": round(tariff_year,2),
                        
                                                "revenue": round(value,2)
                        
                                            }

                    elif item.revenue_type.lower() == "hotel":

                        occupancy = min(
                            item.occupancy_pct + (year - construction_years - 1),
                            90
                        )

                        adr_year = (
                            item.adr *
                            (1 + item.growth_rate / 100) ** (year - construction_years - 1)
                        )

                        occupied_room_nights = (
                            item.rooms
                            * occupancy / 100
                            * 365
                        )

                        room_revenue = occupied_room_nights * adr_year

                        food_revenue = room_revenue * item.food_revenue_pct / 100

                        banquet_revenue = room_revenue * item.banquet_revenue_pct / 100

                        spa_revenue = room_revenue * item.spa_revenue_pct / 100

                        other_revenue = room_revenue * item.other_revenue_pct / 100

                        value = (
                            room_revenue
                            + food_revenue
                            + banquet_revenue
                            + spa_revenue
                            + other_revenue
                        )

                        revenue_breakdown[item.name if item.name else item.revenue_type] = {

                            "type": "hotel",

                            "rooms": item.rooms,

                            "occupancy": round(occupancy, 2),

                            "occupied_room_nights": round(occupied_room_nights, 2),

                            "adr": round(adr_year, 2),

                            "room_revenue": round(room_revenue, 2),

                            "food_revenue": round(food_revenue, 2),

                            "banquet_revenue": round(banquet_revenue, 2),

                            "spa_revenue": round(spa_revenue, 2),

                            "other_revenue": round(other_revenue, 2),

                            "revenue": round(value, 2)

                        }
                       

                    else:

                        value = (
                            item.amount *
                            (1 + item.growth_rate / 100) ** (year - construction_years - 1)
                        )

                        revenue_breakdown[item.name] = {

                            "type": "generic",

                            "base_amount": item.amount,

                            "growth_rate": item.growth_rate,

                            "revenue": round(value, 2)

                        }

                    revenue += value
                    

        # =====================================
        # COGS
        # =====================================

        print(
            f"YEAR {year} REVENUE = {revenue:,.2f}"
        )

        print(
            f"YEAR {year} REVENUE BREAKDOWN = "
            f"{revenue_breakdown}"
        )

        print(
            f"YEAR {year} GENERATION = "
            f"{generation:,.2f}"
        )

        print(
            f"YEAR {year} OCCUPIED ROOM NIGHTS = "
            f"{occupied_room_nights:,.2f}"
        )

        cogs_result = build_cogs(

            project,

            {

                "year": year,

                "generation": generation,

                "occupied_room_nights": occupied_room_nights,

                "revenue": revenue

            }

        )

        cogs = cogs_result["total"]

        cogs_breakdown = cogs_result["breakdown"]

        print(
            f"YEAR {year} COGS = {cogs:,.2f}"
        )

        print(
            f"YEAR {year} COGS BREAKDOWN = "
            f"{cogs_breakdown}"
        )

        gross_profit = revenue - cogs

        # ==========Opex ===============

        opex = 0
        opex_breakdown = {}

        if year > construction_years:

            for item in project.opex_items:
                
                value = (item.amount * (1+ item.escalation_rate / 100)** (year - construction_years - 1))

                opex += value

                opex_breakdown[item.name] = round(value , 2)

        ebitda = gross_profit - opex

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

        gross_block = asset_year["total_gross_block"] + cumulative_idc

        net_fixed_assets = gross_block - accumulated_depreciation

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

        working_capital_inputs.append({
            "year": year,
            "revenue": revenue,
            "opex": opex,
            "cogs": cogs,
            "receivable_days": project.working_capital.receivable_days,
            "inventory_days": project.working_capital.inventory_days,
            "payable_days": project.working_capital.payable_days,
        })

        #Non_Current_assets============================

        non_current_asset_investment = 0
        
        for item in project.asset_items:


            value = (item.amount * (1 + item.growth_rate / 100)**(year - 1))

            previous_value = (item.amount * (1+ item.growth_rate / 100)**(year -2)) if year > 1 else 0

            non_current_asset_investment += (value - previous_value)

        #Non_current_liabilities:

        non_current_liability_change = 0

        for item in project.liability_items:

            value = (item.amount * (1 + item.growth_rate / 100)**(year - 1))

            previous_value = (item.amount * (1 + item.growth_rate / 100) ** (year - 2)) if year > 1 else 0

            non_current_liability_change += (value - previous_value)


        

        #cashflows

        cashflow_operations = (pat + depreciation)

        # Fixed asset purchases / CapEx
        capex_cash_outflow = purchase_this_year

        # Investment in other non-current assets
        non_current_asset_cash_outflow = non_current_asset_investment

        # Asset sale proceeds
        asset_sale_cash_inflow = sale_this_year

        cashflow_investing = (
            -capex_cash_outflow
            -non_current_asset_cash_outflow
            +asset_sale_cash_inflow
        )

        if year == 1:

            equity_drawn = total_equity_contribution

        else:

            equity_drawn = 0

        cashflow_financing = (
            debt_drawn - principal + equity_drawn + non_current_liability_change
        )

        # ===========Assets==========

        asset_breakdown = {}

        total_assets = 0

        asset_breakdown["Gross PPE"] = round(
            asset_year["total_gross_block"],
            2
        )

        asset_breakdown["Capitalized IDC"] = round(
            cumulative_idc,
            2
        )

        asset_breakdown["Gross Fixed Assets"] = round(
            gross_block,
            2
        )

        asset_breakdown["Accumulated Depreciation"] = round(
            accumulated_depreciation,
            2
        )

        asset_breakdown["Net Fixed Assets"] = round(
            net_fixed_assets,
            2
        )

        total_assets += net_fixed_assets


    

        for item in project.asset_items:

            value = (item.amount * (1 + item.growth_rate / 100)**(year - 1))

            asset_breakdown[item.name] = round(value, 2)

            total_assets += value


        #==============Liabilities==========

        liability_breakdown = {}

        total_liabilities = 0

        liability_breakdown["Project Debt"] = round(closing_debt, 2)

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

            "cogs": round(cogs, 2),

            "cogs_breakdown": cogs_breakdown,

            "gross_profit": round(gross_profit, 2),

            "opex": round(opex, 2),

            "opex_breakdown": opex_breakdown,

            "ebitda": round(ebitda, 2),

            "depreciation": round(depreciation, 2),

            "ebit": round(ebit, 2),

            "interest": round(interest, 2),

            "idc": round(idc,2),

            "interest_expense": round(interest_expense,2),

            "ebt": round(ebt, 2),

            "tax": round(tax, 2),

            "pat": round(pat, 2),


            # ====================
            # CASH FLOW STATEMENT
            # ====================

            "cashflow_operations":
                round(cashflow_operations, 2),

            "cashflow_investing":
                round(cashflow_investing, 2),

            "cashflow_financing":
                round(cashflow_financing, 2),


            "capex_outflow": round(
                purchase_this_year,
                2
            ),

            "asset_sale_proceeds": round(
                sale_this_year,
                2
            ),

            "debt_drawn": round(debt_drawn, 2),

            "equity_drawn": round(equity_drawn, 2),

            "principal_repayment": round(principal, 2),

            "non_current_asset_investment":
                round(non_current_asset_investment, 2),

            "non_current_liability_change":
                round(non_current_liability_change, 2),


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

    working_capital_schedule = build_working_capital(project, working_capital_inputs)

    for i, wc in enumerate(working_capital_schedule):

        p = projection[i]

        p["cashflow_operations"] = round(
            p["pat"]
            + p["depreciation"]
            - wc["change_in_nwc"],2
        )

        p["net_cash_flow"] = round(
            p["cashflow_operations"]
            + p["cashflow_investing"]
            + p["cashflow_financing"],2
        )

        if i == 0:
            p["opening_cash"] = 0
        else:
            p["opening_cash"] = projection[i - 1]["closing_cash"]

        p["closing_cash"] = (
            p["opening_cash"]
            + p["net_cash_flow"]
        )

         # ----------------------------
        # Update Asset Breakdown
        # ----------------------------

        p["asset_breakdown"]["cash"] = round(p["closing_cash"], 2)

        p["asset_breakdown"]["Accounts Receivable"] = round(
            wc["receivables"], 2
        )

        p["asset_breakdown"]["Inventory"] = round(
            wc["inventory"], 2
        )

        p["asset_breakdown"]["Prepaid Expenses"] = round(
            wc["prepaid_expenses"], 2
        )

        p["asset_breakdown"]["Other Current Assets"] = round(
            wc["other_current_assets"], 2
        )

        p["liability_breakdown"]["Accounts Payable"] = round(
            wc["payables"], 2
        )

        p["liability_breakdown"]["Other Current Liabilities"] = round(
            wc["other_current_liabilities"], 2
        )

        p["working_capital_breakdown"] = {
            "Accounts Receivable": round(wc["receivables"], 2),
            "Inventory": round(wc["inventory"], 2),
            "Prepaid Expenses": round(wc["prepaid_expenses"], 2),
            "Other Current Assets": round(wc["other_current_assets"], 2),
            "Accounts Payable": round(wc["payables"], 2),
            "Other Current Liabilities": round(wc["other_current_liabilities"], 2),
        }

        p["current_assets"] = round(wc["current_assets"], 2)
        p["current_liabilities"] = round(wc["current_liabilities"], 2)
        p["nwc"] = round(wc["nwc"], 2)
        p["change_in_nwc"] = round(wc["change_in_nwc"], 2)

        # <<<<<< PUT THE NEW CODE HERE >>>>>>

        fixed_assets = p["asset_breakdown"]["Net Fixed Assets"]

        other_assets = sum(
            value
            for key, value in p["asset_breakdown"].items()
            if key not in {
                "cash",
                "Gross PPE",
                "Capitalized IDC",
                "Gross Fixed Assets",
                "Accumulated Depreciation",
                "Net Fixed Assets",
                "Accounts Receivable",
                "Inventory",
                "Prepaid Expenses",
                "Other Current Assets",
            }
        )

        p["total_assets"] = (
            p["closing_cash"]
            + fixed_assets
            + wc["receivables"]
            + wc["inventory"]
            + wc["prepaid_expenses"]
            + wc["other_current_assets"]
            + other_assets
        )

        # Do the same for liabilities
        p["total_liabilities"] = (
            p["closing_debt"]
            + wc["payables"]
            + wc["other_current_liabilities"]
            + sum(
                value
                for key, value in p["liability_breakdown"].items()
                if key not in {
                    "Project Debt",
                    "Accounts Payable",
                    "Other Current Liabilities",
                }
            )
        )

        # ----------------------------
        # NOW calculate BS gap
        # ----------------------------

        p["balance_sheet_gap"] = round(
            p["total_assets"]
            - (
                p["total_liabilities"]
                + p["total_equity"]
            ),
            2
        )
                



    return {
    "projection": projection,
    "debt_schedule": debt_schedule,
    "asset_schedule": asset_schedule
    }



                
                    