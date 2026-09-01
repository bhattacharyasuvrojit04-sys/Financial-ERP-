import numpy_financial as npf
import numpy as np


# ============================================================
# IRR HELPER
# ============================================================

def calculate_irr(cashflows):

    """
    Calculate IRR from a complete cash-flow series.

    Requires:
        - At least one negative cash flow
        - At least one positive cash flow

    Returns:
        Decimal IRR
        Example: 0.154 = 15.4%
    """

    if not cashflows:
        return None

    # Remove None values
    cashflows = [
        float(cf or 0)
        for cf in cashflows
    ]

    # IRR requires both positive and negative values
    if not any(cf < 0 for cf in cashflows):
        return None

    if not any(cf > 0 for cf in cashflows):
        return None

    try:

        irr = npf.irr(cashflows)

        if irr is None:
            return None

        if np.isnan(irr):
            return None

        if np.isinf(irr):
            return None

        return float(irr)

    except Exception:

        return None


# ============================================================
# PROJECT RETURNS
# ============================================================

def calculate_project_returns(project, statements):

    projection = statements.get(
        "projection",
        []
    )

    analysis_schedule = []

    # --------------------------------------------------------
    # FULL CASH FLOW SERIES
    # --------------------------------------------------------

    project_cashflows = []
    equity_cashflows = []

    # --------------------------------------------------------
    # NPV
    # --------------------------------------------------------

    cumulative_npv = 0

    discount_rate = (
        project.discount_rate / 100
        if project.discount_rate
        else 0
    )

    # ========================================================
    # YEAR LOOP
    # ========================================================

    for i, year_data in enumerate(projection):

        year = year_data.get(
            "year",
            i + 1
        )

        # ====================================================
        # CAPEX
        # ====================================================

        capex = (
            year_data.get(
                "capex_outflow",
                0
            )
            or 0
        )

        # ====================================================
        # OPERATING CASH FLOW
        # ====================================================

        operating_cash_flow = (
            year_data.get(
                "cashflow_operations",
                0
            )
            or 0
        )

        # ====================================================
        # PROJECT CASH FLOW
        #
        # Unlevered project cash flow:
        #
        # Operating CF
        # - Capex
        #
        # This is the cash flow used for Project IRR.
        # ====================================================

        project_cash_flow = (
            operating_cash_flow
            - capex
        )

        # Add to project cash-flow series

        project_cashflows.append(
            project_cash_flow
        )

        # ====================================================
        # DEBT
        # ====================================================

        debt_drawdown = (
            year_data.get(
                "debt_drawn",
                0
            )
            or 0
        )

        principal_repayment = (
            year_data.get(
                "principal_repayment",
                year_data.get(
                    "principal",
                    0
                )
            )
            or 0
        )

        # ====================================================
        # EQUITY CASH FLOW
        #
        # Equity CF =
        #
        # Project CF
        # + Debt Drawdown
        # - Principal Repayment
        #
        # ====================================================

        equity_cash_flow = (
            project_cash_flow
            + debt_drawdown
            - principal_repayment
        )

        equity_cashflows.append(
            equity_cash_flow
        )

        # ====================================================
        # CFADS
        # ====================================================

        ebitda = (
            year_data.get(
                "ebitda",
                0
            )
            or 0
        )

        tax = (
            year_data.get(
                "tax",
                0
            )
            or 0
        )

        change_in_nwc = (
            year_data.get(
                "change_in_nwc",
                0
            )
            or 0
        )

        cfads = (
            ebitda
            - tax
            - change_in_nwc
        )

        # ====================================================
        # DEBT SERVICE
        # ====================================================

        interest = (
            year_data.get(
                "interest_expense",
                year_data.get(
                    "interest",
                    0
                )
            )
            or 0
        )

        debt_service = (
            principal_repayment
            + interest
        )

        # ====================================================
        # DSCR
        # ====================================================

        if debt_service > 0:

            dscr = (
                cfads
                / debt_service
            )

        else:

            dscr = None

        # ====================================================
        # PROJECT IRR
        # ====================================================

        project_irr = calculate_irr(
            project_cashflows
        )

        # ====================================================
        # EQUITY IRR
        # ====================================================

        equity_irr = calculate_irr(
            equity_cashflows
        )

        # ====================================================
        # DISCOUNTED PROJECT CASH FLOW
        # ====================================================

        if discount_rate > -1:

            discounted_cash_flow = (
                project_cash_flow
                /
                (
                    (1 + discount_rate)
                    ** year
                )
            )

        else:

            discounted_cash_flow = 0

        # ====================================================
        # CUMULATIVE NPV
        # ====================================================

        cumulative_npv += (
            discounted_cash_flow
        )

        # ====================================================
        # ANALYSIS SCHEDULE
        # ====================================================

        analysis_schedule.append({

            "year":
                year,

            "project_cash_flow":
                project_cash_flow,

            "equity_cash_flow":
                equity_cash_flow,

            "cfads":
                cfads,

            "debt_service":
                debt_service,

            "dscr":
                dscr,

            "project_irr":
                project_irr,

            "equity_irr":
                equity_irr,

            "discounted_cash_flow":
                discounted_cash_flow,

            "npv":
                cumulative_npv

        })

    # ========================================================
    # FINAL RETURNS
    # ========================================================

    final_project_irr = calculate_irr(
        project_cashflows
    )

    final_equity_irr = calculate_irr(
        equity_cashflows
    )

    # ========================================================
    # MINIMUM DSCR
    # ========================================================

    valid_dscr = [

        row["dscr"]

        for row in analysis_schedule

        if row["dscr"] is not None

    ]

    minimum_dscr = (
        min(valid_dscr)
        if valid_dscr
        else None
    )

    # ========================================================
    # RETURN
    # ========================================================

    return {

        "analysis_schedule":
            analysis_schedule,

        "project_irr":
            final_project_irr,

        "equity_irr":
            final_equity_irr,

        "npv":
            cumulative_npv,

        "minimum_dscr":
            minimum_dscr

    }