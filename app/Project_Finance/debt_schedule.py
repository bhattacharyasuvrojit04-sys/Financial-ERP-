from collections import defaultdict
import math


def build_debt_schedule(project):

    schedule = []

    total_months = project.project_life * 12

    monthly_rate = project.interest_rate / 100 / 12

    # ---------------------------------------------------
    # Drawdown Map
    # ---------------------------------------------------

    drawdown_map = defaultdict(float)

    for tranche in project.debt_drawdowns:

        month_number = (
            (tranche.year - 1) * 12
            + tranche.drawdown_months
        )

        drawdown_map[month_number] += tranche.drawdown_amount

    if len(drawdown_map) == 0:
        return schedule

    first_drawdown_month = min(drawdown_map.keys())

    # ---------------------------------------------------
    # Repayment Frequency
    # ---------------------------------------------------

    frequency = project.repayment_frequency.lower()

    if frequency == "monthly":
        repayment_interval = 1

    elif frequency == "quarterly":
        repayment_interval = 3

    elif frequency in ["half yearly", "half-yearly", "half_yearly"]:
        repayment_interval = 6

    elif frequency == "yearly":
        repayment_interval = 12

    else:
        repayment_interval = 1

    repayment_start = (
        first_drawdown_month
        + project.moratorium_months
    )

    repayment_end = first_drawdown_month + project.loan_tenor * 12

    repayment_periods = math.ceil(
        (repayment_end - repayment_start + 1)
        / repayment_interval
    )

    total_drawdown = sum(drawdown_map.values())

    opening_balance = 0

    # ---------------------------------------------------
    # Equal Principal
    # ---------------------------------------------------

    principal_installment = (
        total_drawdown / repayment_periods
        if repayment_periods > 0
        else 0
    )

    # ---------------------------------------------------
    # Monthly Schedule
    # ---------------------------------------------------

    for month in range(1, total_months + 1):

        drawdown = drawdown_map.get(month, 0)

        opening_balance += drawdown

        interest = opening_balance * monthly_rate

        principal = 0

        idc = 0

        repayment_due = (
            month >= repayment_start
            and
            (month - repayment_start) % repayment_interval == 0
        )

        if repayment_due and opening_balance > 0:

            if project.repayment_type.lower() == "equal principal":

                principal = min(
                    principal_installment,
                    opening_balance
                )

            else:
                principal = min(
                    principal_installment,
                    opening_balance
                )

        # ---------------------------------------------
        # Interest Capitalization
        # ---------------------------------------------

        if (
            month < repayment_start
            and project.interest_capitalized
        ):

            idc = interest

            closing_balance = (opening_balance + idc)

        else:

            closing_balance = (
                opening_balance - principal
            )

        schedule.append({

            "month": month,

            "year": ((month - 1) // 12) + 1,

            "month_of_year": ((month - 1) % 12) + 1,

            "drawdown": round(drawdown, 2),

            "opening_balance": round(opening_balance, 2),

            "interest": round(interest, 2),

            "idc": round(idc,2),

            "principal": round(principal, 2),

            "debt_service": round(
                principal + interest,
                2
            ),

            "closing_balance": round(
                closing_balance,
                2
            )

        })

        opening_balance = closing_balance

    return schedule