import numpy as np
import numpy_financial as npf

def generate_cashflows(project):

    cashflows = [-project.capex]

    for year in range(project.project_life):
        tariff_year = project.tariff * (1 + project.tariff_escalation / 100) ** year
        cuf_year = project.cuf * (1 - project.degradation_rate / 100) ** year

        annual_generation_kwh = (
            project.capacity_mw * 1000 * project.operating_hours * (cuf_year/ 100) #we took the project pydantic schema from project_finance.py just check
        )

        annual_Revenue = (annual_generation_kwh * tariff_year)

        opex = (annual_Revenue * (project.opex_pct / 100))

        opex_year = opex * (1 + project.opex_escalation / 100) ** year

        ebitda = (annual_Revenue - opex_year)

        cashflows.append(round(ebitda,2))

    return cashflows

def calculate_irr(cashflows):
    irr = npf.irr(cashflows) * 100

    if irr is None:
        return 0
    return round((irr * 100), 2)

def calculate_npv(cashflows, discount_rate = 10):

    npv = 0
    for i,cf in enumerate(cashflows):
        npv += cf / ((1 + discount_rate/100) ** i)

    return round(npv, 2)

def calculate_dscr(ebitda, annual_debt_service):

    if annual_debt_service == 0:
        return 0
    
    return (round(ebitda / annual_debt_service, 2))
    

