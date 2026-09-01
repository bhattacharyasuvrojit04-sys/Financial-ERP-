from math import pow


def calculate_project_dcf(project, statements):
    """
    Project Finance DCF Valuation

    Uses yearly project statements to calculate:

    - EBIT
    - Tax on EBIT
    - NOPAT
    - D&A
    - Capex
    - Change in NWC
    - Unlevered FCF
    - Discount factor
    - PV of UFCF
    - Terminal value
    - Enterprise value
    """

    projection = statements.get("projection", [])

    if not projection:
        return {
            "dcf_valuation": {},
            "dcf_schedule": []
        }

    # =========================================================
    # DCF ASSUMPTIONS
    # =========================================================

    wacc = (
        getattr(project, "discount_rate", 0) or 0
    ) / 100

    # Initial assumption.
    # Later we can make this a user input.
    terminal_growth_rate = 0.03

    # Prevent invalid Gordon Growth calculation
    if wacc <= terminal_growth_rate:
        raise ValueError(
            "Discount rate must be greater than terminal growth rate."
        )

    # =========================================================
    # YEARLY DCF SCHEDULE
    # =========================================================

    dcf_schedule = []

    cumulative_pv = 0

    for index, row in enumerate(projection):

        year = row.get("year", index + 1)

        # -----------------------------------------------------
        # Operating metrics
        # -----------------------------------------------------

        revenue = row.get(
            "revenue",
            0
        ) or 0

        ebitda = row.get(
            "ebitda",
            0
        ) or 0

        depreciation = row.get(
            "depreciation",
            0
        ) or 0

        # EBIT
        ebit = ebitda - depreciation

        # -----------------------------------------------------
        # TAX
        # -----------------------------------------------------

        tax_rate = (
            getattr(project, "tax_rate", 0) or 0
        ) / 100

        tax_on_ebit = max(
            ebit * tax_rate,
            0
        )

        # -----------------------------------------------------
        # NOPAT
        # -----------------------------------------------------

        ebit_after_tax = (
            ebit - tax_on_ebit
        )

        # -----------------------------------------------------
        # CAPEX
        # -----------------------------------------------------

        capex = (
            row.get("capex", 0)
            or row.get("purchase_this_year", 0)
            or 0
        )

        # Capex should be treated as cash outflow
        capex = abs(capex)

        # -----------------------------------------------------
        # WORKING CAPITAL
        # -----------------------------------------------------

        change_nwc = (
            row.get("change_nwc", 0)
            or row.get("change_working_capital", 0)
            or 0
        )

        # -----------------------------------------------------
        # UNLEVERED FREE CASH FLOW
        #
        # UFCF =
        # EBIT
        # - Tax on EBIT
        # + D&A
        # - Capex
        # - Change in NWC
        # -----------------------------------------------------

        ufcf = (
            ebit_after_tax
            + depreciation
            - capex
            - change_nwc
        )

        # -----------------------------------------------------
        # DISCOUNT FACTOR
        # -----------------------------------------------------

        discount_period = year

        discount_factor = 1 / pow(
            1 + wacc,
            discount_period
        )

        pv_ufcf = (
            ufcf * discount_factor
        )

        cumulative_pv += pv_ufcf

        dcf_schedule.append({

            "year": year,

            "revenue": revenue,

            "ebitda": ebitda,

            "depreciation": depreciation,

            "ebit": ebit,

            "tax_on_ebit": tax_on_ebit,

            "ebit_after_tax": ebit_after_tax,

            "capex": capex,

            "change_nwc": change_nwc,

            "ufcf": ufcf,

            "discount_period": discount_period,

            "discount_factor": discount_factor,

            "pv_ufcf": pv_ufcf

        })

    # =========================================================
    # TERMINAL VALUE
    # =========================================================

    final_year = dcf_schedule[-1]

    terminal_year_ufcf = (
        final_year["ufcf"]
    )

    terminal_value = (
        terminal_year_ufcf
        * (1 + terminal_growth_rate)
        / (
            wacc
            - terminal_growth_rate
        )
    )

    # Discount terminal value back
    terminal_discount_factor = (
        final_year["discount_factor"]
    )

    pv_terminal_value = (
        terminal_value
        * terminal_discount_factor
    )

    # =========================================================
    # ENTERPRISE VALUE
    # =========================================================

    enterprise_value = (
        cumulative_pv
        + pv_terminal_value
    )

    # =========================================================
    # TERMINAL VALUE AS % OF EV
    # =========================================================

    terminal_value_pct = 0

    if enterprise_value != 0:

        terminal_value_pct = (
            pv_terminal_value
            / enterprise_value
        )

    # =========================================================
    # RETURN
    # =========================================================

    return {

        "dcf_valuation": {

            "wacc": wacc,

            "terminal_growth_rate":
                terminal_growth_rate,

            "pv_forecast_cash_flows":
                cumulative_pv,

            "terminal_value":
                terminal_value,

            "pv_terminal_value":
                pv_terminal_value,

            "terminal_value_pct":
                terminal_value_pct,

            "enterprise_value":
                enterprise_value

        },

        "dcf_schedule":
            dcf_schedule

    }