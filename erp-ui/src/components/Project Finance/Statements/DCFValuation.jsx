import React from "react";
import "../../../Styles/DCFValuation.css";


/* ============================================================
   HELPERS
============================================================ */

const toNumber = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
};


/*
    Read a number from multiple possible backend keys.
*/
const getNumber = (sources, keys) => {

    for (const source of sources) {

        if (
            !source ||
            typeof source !== "object"
        ) {
            continue;
        }

        for (const key of keys) {

            const value = toNumber(
                source[key]
            );

            if (value !== null) {
                return value;
            }

        }

    }

    return null;
};


/*
    Convert possible backend schedule structures
    into an array.
*/
const normalizeSchedule = (value) => {

    if (Array.isArray(value)) {
        return value;
    }

    if (
        value &&
        typeof value === "object"
    ) {

        if (Array.isArray(value.rows)) {
            return value.rows;
        }

        if (Array.isArray(value.items)) {
            return value.items;
        }

        if (Array.isArray(value.data)) {
            return value.data;
        }

        /*
            Handles an object such as:

            {
                "1": {...},
                "2": {...},
                "3": {...}
            }
        */

        const values = Object.values(value);

        if (
            values.length > 0 &&
            values.every(
                item =>
                    item &&
                    typeof item === "object" &&
                    !Array.isArray(item)
            )
        ) {

            return values;

        }

    }

    return [];
};


/*
    Find the yearly DCF schedule regardless of
    the exact backend naming.
*/
const findSchedule = (dcf, originalData) => {

    const candidates = [

        dcf?.projection,

        dcf?.dcf_schedule,

        dcf?.fcff_schedule,

        dcf?.explicit_fcff_schedule,

        dcf?.schedule,

        dcf?.yearly,

        dcf?.cashflow_schedule,

        dcf?.discounting_schedule,

        dcf?.dcf?.projection,

        dcf?.dcf?.schedule,

        dcf?.valuation?.projection,

        dcf?.valuation?.schedule,

        originalData?.projection,

        originalData?.dcf_schedule,

        originalData?.fcff_schedule

    ];

    for (const candidate of candidates) {

        const normalized =
            normalizeSchedule(candidate);

        if (normalized.length > 0) {
            return normalized;
        }

    }

    return [];
};


/* ============================================================
   COMPONENT
============================================================ */

export default function DCFValuation({

    data,

    project,

    displayUnit = "million"

}) {


    console.log(
        "========== DCF VALUATION =========="
    );

    console.log(
        "Raw DCF Data:",
        data
    );


    /*
        Backend may return:

        result.dcf_valuation

        OR

        the DCF object directly.
    */

    const dcf =
        data?.dcf_valuation ??
        data?.dcfValuation ??
        data?.dcf ??
        data;


    if (!dcf) {

        return (

            <div className="dcf-empty">

                <div className="dcf-empty-title">
                    No DCF Valuation Available
                </div>

                <div className="dcf-empty-sub">
                    Run the project analysis to generate
                    the DCF valuation.
                </div>

            </div>

        );

    }


    /* ============================================================
       SUMMARY SOURCES
    ============================================================ */

    const summarySources = [

        dcf?.summary,

        dcf?.valuation,

        dcf

    ];


    /*
        IMPORTANT:

        This is the part fixing your blank table.
    */

    const schedule =
        findSchedule(
            dcf,
            data
        );


    console.log(
        "DCF Schedule:",
        schedule
    );


    if (schedule.length === 0) {

        console.warn(
            "DCFValuation: No yearly DCF schedule found."
        );

    }


    /* ============================================================
       WACC
    ============================================================ */

    const projectDiscountRate =
        toNumber(
            project?.discount_rate
        );


    const wacc =
        getNumber(
            summarySources,
            [
                "wacc",
                "discount_rate",
                "discountRate"
            ]
        )
        ??
        (
            projectDiscountRate !== null
                ? projectDiscountRate / 100
                : 0
        );


    /* ============================================================
       TERMINAL GROWTH
    ============================================================ */

    const terminalGrowth =
        getNumber(
            summarySources,
            [
                "terminal_growth",
                "terminal_growth_rate",
                "terminalGrowth",
                "perpetual_growth",
                "perpetual_growth_rate"
            ]
        )
        ?? 0;


    /* ============================================================
       NORMALIZE YEARLY DCF DATA
    ============================================================ */

    const rows = schedule.map(
        (rawRow, index) => {

            const year =
                rawRow?.year ??
                rawRow?.fiscal_year ??
                rawRow?.period ??
                rawRow?.fy ??
                index + 1;


            /*
                Revenue
            */

            const revenue =
                getNumber(
                    [rawRow],
                    [
                        "revenue",
                        "total_revenue"
                    ]
                );


            /*
                EBITDA
            */

            const ebitda =
                getNumber(
                    [rawRow],
                    [
                        "ebitda",
                        "EBITDA"
                    ]
                );


            /*
                Depreciation / D&A
            */

            const depreciation =
                getNumber(
                    [rawRow],
                    [
                        "depreciation",
                        "d_and_a",
                        "da",
                        "depreciation_expense"
                    ]
                ) ?? 0;


            /*
                EBIT
            */

            const rawEbit =
                getNumber(
                    [rawRow],
                    [
                        "ebit",
                        "EBIT",
                        "ebit_after_depreciation"
                    ]
                );


            const ebit =
                rawEbit !== null
                    ? rawEbit
                    : (
                        ebitda !== null
                            ? ebitda - depreciation
                            : null
                    );


            /*
                Tax on EBIT
            */

            const rawTax =
                getNumber(
                    [rawRow],
                    [
                        "tax_on_ebit",
                        "tax_on_EBIT",
                        "tax"
                    ]
                );


            const taxOnEbit =
                rawTax ?? 0;


            /*
                NOPAT
            */

            const rawNopat =
                getNumber(
                    [rawRow],
                    [
                        "nopat",
                        "NOPAT"
                    ]
                );


            const nopat =
                rawNopat !== null
                    ? rawNopat
                    : (
                        ebit !== null
                            ? ebit - taxOnEbit
                            : null
                    );


            /*
                CAPEX

                We normalize it to a positive
                investment amount internally.
            */

            const rawCapex =
                getNumber(
                    [rawRow],
                    [
                        "capex",
                        "capex_outflow",
                        "capital_expenditure",
                        "capital_expenditure_outflow",
                        "capex_investment"
                    ]
                );


            const capex =
                rawCapex !== null
                    ? Math.abs(rawCapex)
                    : 0;


            /*
                CHANGE IN NWC
            */

            const changeInNwc =
                getNumber(
                    [rawRow],
                    [
                        "change_in_working_capital",
                        "change_in_nwc",
                        "delta_working_capital",
                        "working_capital_change"
                    ]
                ) ?? 0;


            /*
                FCFF

                Prefer backend FCFF.

                Otherwise:

                FCFF =
                NOPAT
                + D&A
                - Capex
                - Change in NWC
            */

            const rawFcff =
                getNumber(
                    [rawRow],
                    [
                        "fcff",
                        "free_cash_flow",
                        "free_cash_flow_to_firm"
                    ]
                );


            const fcff =
                rawFcff !== null
                    ? rawFcff
                    : (
                        nopat !== null
                            ? nopat
                              + depreciation
                              - capex
                              - changeInNwc
                            : null
                    );


            /*
                Discount period
            */

            const discountPeriod =
                getNumber(
                    [rawRow],
                    [
                        "discount_period",
                        "discountPeriod",
                        "discount_year",
                        "period"
                    ]
                )
                ?? Number(year)
                ?? index + 1;


            /*
                Discount factor
            */

            const backendDiscountFactor =
                getNumber(
                    [rawRow],
                    [
                        "discount_factor",
                        "discountFactor"
                    ]
                );


            const discountFactor =
                backendDiscountFactor !== null
                    ? backendDiscountFactor
                    : (
                        wacc > -1
                            ? 1 /
                              Math.pow(
                                  1 + wacc,
                                  discountPeriod
                              )
                            : null
                    );


            /*
                PV FCFF
            */

            const backendPvFcff =
                getNumber(
                    [rawRow],
                    [
                        "pv_fcff",
                        "present_value_fcff",
                        "pv_free_cash_flow"
                    ]
                );


            const pvFcff =
                backendPvFcff !== null
                    ? backendPvFcff
                    : (
                        fcff !== null &&
                        discountFactor !== null
                            ? fcff * discountFactor
                            : null
                    );


            return {

                year,

                revenue,

                ebitda,

                depreciation,

                ebit,

                taxOnEbit,

                nopat,

                capex,

                changeInNwc,

                fcff,

                discountPeriod,

                discountFactor,

                pvFcff

            };

        }
    );


    /* ============================================================
       TERMINAL VALUE
    ============================================================ */

    const lastRow =
        rows.length > 0
            ? rows[rows.length - 1]
            : null;


    const backendTerminalYearFCFF =
        getNumber(
            summarySources,
            [
                "terminal_year_fcff",
                "terminalYearFCFF",
                "terminal_fcff",
                "terminalFCFF"
            ]
        );


    const terminalYearFCFF =
        backendTerminalYearFCFF !== null
            ? backendTerminalYearFCFF
            : lastRow?.fcff ?? null;


    /*
        Terminal Value:

        TV =
        FCFF(n+1) / (WACC - g)

        where

        FCFF(n+1) =
        FCFF(n) × (1 + g)
    */

    const calculatedTerminalValue =
        terminalYearFCFF !== null &&
        wacc > terminalGrowth
            ? (
                terminalYearFCFF *
                (1 + terminalGrowth)
            ) /
            (
                wacc - terminalGrowth
            )
            : null;


    const backendTerminalValue =
        getNumber(
            summarySources,
            [
                "terminal_value",
                "terminalValue"
            ]
        );


    const terminalValue =
        backendTerminalValue !== null &&
        backendTerminalValue !== 0
            ? backendTerminalValue
            : calculatedTerminalValue;


    /*
        Terminal discount factor
    */

    const terminalDiscountFactor =
        lastRow?.discountFactor ?? null;


    /*
        PV Terminal Value
    */

    const backendPvTerminal =
        getNumber(
            summarySources,
            [
                "pv_terminal_value",
                "pvTerminalValue",
                "present_value_terminal_value"
            ]
        );


    const pvTerminalValue =
        backendPvTerminal !== null &&
        backendPvTerminal !== 0
            ? backendPvTerminal
            : (
                terminalValue !== null &&
                terminalDiscountFactor !== null
                    ? terminalValue *
                      terminalDiscountFactor
                    : null
            );


    /* ============================================================
       PV OF EXPLICIT FCFF
    ============================================================ */

    const calculatedPvExplicit =
        rows.length > 0
            ? rows.reduce(
                (total, row) =>
                    total +
                    (
                        row.pvFcff ?? 0
                    ),
                0
            )
            : null;


    const backendPvExplicit =
        getNumber(
            summarySources,
            [
                "pv_explicit_fcff",
                "pv_explicit_fcf",
                "pv_explicit_cash_flows",
                "pv_explicit_cashflow",
                "pv_fcff_total",
                "explicit_pv"
            ]
        );


    /*
        Prefer schedule calculation.

        This prevents the situation in your screenshot
        where the backend summary says 0 but the yearly
        FCFF schedule contains actual PV values.
    */

    const pvExplicitFCFF =
        calculatedPvExplicit !== null &&
        rows.some(
            row =>
                row.pvFcff !== null
        )
            ? calculatedPvExplicit
            : backendPvExplicit;


    /* ============================================================
       ENTERPRISE VALUE
    ============================================================ */

    const backendEnterpriseValue =
        getNumber(
            summarySources,
            [
                "enterprise_value",
                "enterpriseValue",
                "ev"
            ]
        );


    const calculatedEnterpriseValue =
        pvExplicitFCFF !== null &&
        pvTerminalValue !== null
            ? pvExplicitFCFF +
              pvTerminalValue
            : null;


    const enterpriseValue =
        backendEnterpriseValue !== null &&
        backendEnterpriseValue !== 0
            ? backendEnterpriseValue
            : calculatedEnterpriseValue;


    /* ============================================================
       NET DEBT
    ============================================================ */

    const netDebt =
        getNumber(
            summarySources,
            [
                "net_debt",
                "netDebt"
            ]
        );


    /* ============================================================
       EQUITY VALUE
    ============================================================ */

    const backendEquityValue =
        getNumber(
            summarySources,
            [
                "equity_value",
                "equityValue"
            ]
        );


    const calculatedEquityValue =
        enterpriseValue !== null &&
        netDebt !== null
            ? enterpriseValue - netDebt
            : null;


    const equityValue =
        backendEquityValue !== null &&
        backendEquityValue !== 0
            ? backendEquityValue
            : calculatedEquityValue;


    /* ============================================================
       ADDITIONAL METRICS
    ============================================================ */

    const tvToEV =
        enterpriseValue &&
        pvTerminalValue !== null
            ? pvTerminalValue /
              enterpriseValue
            : null;


    const dcfEbitdaMultiple =
        getNumber(
            summarySources,
            [
                "dcf_ebitda_multiple",
                "dcfEbitdaMultiple",
                "ev_ebitda",
                "ev_to_ebitda"
            ]
        );


    const taxRate =
        toNumber(
            project?.tax_rate
        );


    /* ============================================================
       FORMATTERS
    ============================================================ */

    const scaleValue = (value) => {

        if (value === null) {
            return null;
        }

        if (displayUnit === "million") {
            return value / 1000000;
        }

        if (displayUnit === "thousand") {
            return value / 1000;
        }

        return value;

    };


    const formatNumber = (
        value,
        decimals = 1
    ) => {

        const number =
            toNumber(value);

        if (number === null) {
            return "—";
        }

        return scaleValue(number)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits:
                        decimals,

                    maximumFractionDigits:
                        decimals
                }
            );

    };


    const formatAmount = (
        value,
        decimals = 1
    ) => {

        const number =
            toNumber(value);

        if (number === null) {
            return "—";
        }

        const scaled =
            scaleValue(
                number
            );


        const absolute =
            Math.abs(scaled);


        const formatted =
            absolute.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits:
                        decimals,

                    maximumFractionDigits:
                        decimals
                }
            );


        if (scaled < 0) {
            return `(${formatted})`;
        }

        return formatted;

    };


    const formatPercent = (
        value
    ) => {

        const number =
            toNumber(value);

        if (number === null) {
            return "—";
        }

        return (
            number * 100
        ).toFixed(1) + "%";

    };


    const formatFactor = (
        value
    ) => {

        const number =
            toNumber(value);

        if (number === null) {
            return "—";
        }

        return number.toFixed(4);

    };


    const formatMultiple = (
        value
    ) => {

        const number =
            toNumber(value);

        if (number === null) {
            return "—";
        }

        return (
            number.toFixed(1) +
            "x"
        );

    };


    const unitLabel =
        displayUnit === "million"
            ? "₹ Mn"
            : displayUnit === "thousand"
                ? "₹ '000"
                : "₹";


    /* ============================================================
       TABLE ROW
    ============================================================ */

    const CalculationRow = ({
        label,
        values,
        type = "amount",
        className = ""
    }) => {

        return (

            <div
                className={
                    `dcf-grid-row ${className}`
                }
            >

                <div className="dcf-grid-label">

                    {label}

                </div>


                {values.map(
                    (value, index) => {

                        let displayValue;


                        if (
                            type ===
                            "percent"
                        ) {

                            displayValue =
                                formatPercent(
                                    value
                                );

                        }

                        else if (
                            type ===
                            "factor"
                        ) {

                            displayValue =
                                formatFactor(
                                    value
                                );

                        }

                        else {

                            displayValue =
                                formatAmount(
                                    value
                                );

                        }


                        return (

                            <div
                                key={index}
                                className="dcf-grid-value"
                            >

                                {displayValue}

                            </div>

                        );

                    }
                )}

            </div>

        );

    };


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div className="dcf-container">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="dcf-header">

                <div>

                    <div className="dcf-title">
                        DCF Valuation
                    </div>

                    <div className="dcf-subtitle">

                        Discounted Cash Flow —
                        Unlevered Free Cash Flow Valuation

                    </div>

                </div>


                <div className="dcf-header-meta">

                    <span>
                        {project?.name ||
                            "Project"}
                    </span>

                    <span className="dcf-divider">
                        |
                    </span>

                    <span>
                        Base Case
                    </span>

                </div>

            </div>


            {/* ==================================================
                KPI CARDS
            ================================================== */}

            <div className="dcf-kpi-grid">


                <div className="dcf-kpi-card">

                    <div className="dcf-kpi-label">
                        Enterprise Value
                    </div>

                    <div className="dcf-kpi-value">

                        {unitLabel}{" "}

                        {formatNumber(
                            enterpriseValue
                        )}

                    </div>

                    <div className="dcf-kpi-sub">

                        PV of Explicit FCFF
                        + PV of Terminal Value

                    </div>

                </div>


                <div className="dcf-kpi-card">

                    <div className="dcf-kpi-label">
                        Equity Value
                    </div>

                    <div className="dcf-kpi-value">

                        {unitLabel}{" "}

                        {formatNumber(
                            equityValue
                        )}

                    </div>

                    <div className="dcf-kpi-sub">

                        Enterprise Value
                        − Net Debt

                    </div>

                </div>


                <div className="dcf-kpi-card">

                    <div className="dcf-kpi-label">
                        WACC
                    </div>

                    <div className="dcf-kpi-value">

                        {formatPercent(
                            wacc
                        )}

                    </div>

                    <div className="dcf-kpi-sub">
                        Discount rate
                    </div>

                </div>


                <div className="dcf-kpi-card">

                    <div className="dcf-kpi-label">
                        Terminal Growth
                    </div>

                    <div className="dcf-kpi-value">

                        {formatPercent(
                            terminalGrowth
                        )}

                    </div>

                    <div className="dcf-kpi-sub">
                        Perpetual growth
                    </div>

                </div>

            </div>


            {/* ==================================================
                ASSUMPTIONS
            ================================================== */}

            <div className="dcf-section">

                <div className="dcf-section-title">
                    DCF Assumptions
                </div>


                <div className="dcf-assumption-grid">


                    <div className="dcf-assumption">

                        <span>
                            WACC
                        </span>

                        <strong>
                            {formatPercent(
                                wacc
                            )}
                        </strong>

                    </div>


                    <div className="dcf-assumption">

                        <span>
                            Terminal Growth
                        </span>

                        <strong>
                            {formatPercent(
                                terminalGrowth
                            )}
                        </strong>

                    </div>


                    <div className="dcf-assumption">

                        <span>
                            Tax Rate
                        </span>

                        <strong>
                            {
                                taxRate !== null
                                    ? `${taxRate.toFixed(1)}%`
                                    : "—"
                            }
                        </strong>

                    </div>


                    <div className="dcf-assumption">

                        <span>
                            Discount Convention
                        </span>

                        <strong>
                            Annual
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                FCFF CALCULATION
            ================================================== */}

            <div className="dcf-section">

                <div className="dcf-section-header">

                    <div>

                        <div className="dcf-section-title">
                            FCFF Calculation
                        </div>

                        <div className="dcf-section-description">

                            Unlevered free cash flow available
                            to all capital providers

                        </div>

                    </div>

                    <div className="dcf-unit">
                        {unitLabel}
                    </div>

                </div>


                {
                    rows.length === 0 ? (

                        <div className="dcf-no-data">

                            No yearly DCF schedule was
                            returned by the backend.

                            <br />

                            Check the browser console for
                            the received DCF response.

                        </div>

                    ) : (

                        <div className="dcf-table-scroll">

                            <div
                                className="dcf-grid"
                                style={{
                                    minWidth:
                                        `${190 + rows.length * 110}px`
                                }}
                            >

                                {/* HEADER */}

                                <div className="dcf-grid-row dcf-grid-header">

                                    <div className="dcf-grid-label">
                                        Fiscal Year
                                    </div>


                                    {rows.map(
                                        (row, index) => (

                                            <div
                                                key={index}
                                                className="dcf-grid-value"
                                            >

                                                Year{" "}
                                                {row.year}

                                            </div>

                                        )
                                    )}

                                </div>


                                <CalculationRow
                                    label="Revenue"
                                    values={
                                        rows.map(
                                            row =>
                                                row.revenue
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="EBITDA"
                                    values={
                                        rows.map(
                                            row =>
                                                row.ebitda
                                        )
                                    }
                                    className="dcf-ebitda-row"
                                />


                                <CalculationRow
                                    label="Less: D&A"
                                    values={
                                        rows.map(
                                            row =>
                                                row.depreciation !== null
                                                    ? -Math.abs(
                                                        row.depreciation
                                                    )
                                                    : null
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="EBIT"
                                    values={
                                        rows.map(
                                            row =>
                                                row.ebit
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="Less: Tax on EBIT"
                                    values={
                                        rows.map(
                                            row =>
                                                row.taxOnEbit !== null
                                                    ? -Math.abs(
                                                        row.taxOnEbit
                                                    )
                                                    : null
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="NOPAT"
                                    values={
                                        rows.map(
                                            row =>
                                                row.nopat
                                        )
                                    }
                                    className="dcf-subtotal-row"
                                />


                                <CalculationRow
                                    label="Add: D&A"
                                    values={
                                        rows.map(
                                            row =>
                                                row.depreciation
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="Less: Capex"
                                    values={
                                        rows.map(
                                            row =>
                                                row.capex !== null
                                                    ? -Math.abs(
                                                        row.capex
                                                    )
                                                    : null
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="Less: Change in NWC"
                                    values={
                                        rows.map(
                                            row =>
                                                row.changeInNwc !== null
                                                    ? -row.changeInNwc
                                                    : null
                                        )
                                    }
                                />


                                <CalculationRow
                                    label="FCFF"
                                    values={
                                        rows.map(
                                            row =>
                                                row.fcff
                                        )
                                    }
                                    className="dcf-fcff-row"
                                />

                            </div>

                        </div>

                    )
                }

            </div>


            {/* ==================================================
                DISCOUNTING
            ================================================== */}

            <div className="dcf-section">

                <div className="dcf-section-header">

                    <div>

                        <div className="dcf-section-title">
                            Discounting Schedule
                        </div>

                        <div className="dcf-section-description">

                            Each year's FCFF is discounted
                            to present value using WACC.

                        </div>

                    </div>

                </div>


                <div className="dcf-table-scroll">

                    <div
                        className="dcf-grid"
                        style={{
                            minWidth:
                                `${190 + Math.max(
                                    rows.length,
                                    1
                                ) * 110}px`
                        }}
                    >

                        <div className="dcf-grid-row dcf-grid-header">

                            <div className="dcf-grid-label">
                                Fiscal Year
                            </div>


                            {rows.map(
                                (row, index) => (

                                    <div
                                        key={index}
                                        className="dcf-grid-value"
                                    >

                                        Year{" "}
                                        {row.year}

                                    </div>

                                )
                            )}

                        </div>


                        <CalculationRow
                            label="FCFF"
                            values={
                                rows.map(
                                    row =>
                                        row.fcff
                                )
                            }
                        />


                        <CalculationRow
                            label="Discount Period"
                            values={
                                rows.map(
                                    row =>
                                        row.discountPeriod
                                )
                            }
                        />


                        <CalculationRow
                            label="Discount Factor"
                            values={
                                rows.map(
                                    row =>
                                        row.discountFactor
                                )
                            }
                            type="factor"
                        />


                        <CalculationRow
                            label="PV of FCFF"
                            values={
                                rows.map(
                                    row =>
                                        row.pvFcff
                                )
                            }
                            className="dcf-fcff-row"
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                TERMINAL VALUE CALCULATION
            ================================================== */}

            <div className="dcf-section">

                <div className="dcf-section-title">
                    Terminal Value Calculation
                </div>


                <div className="dcf-formula">

                    Terminal Value = Terminal Year FCFF ×
                    (1 + Terminal Growth) ÷
                    (WACC − Terminal Growth)

                </div>


                <div className="dcf-terminal-grid">


                    <div className="dcf-terminal-card">

                        <span>
                            Terminal Year FCFF
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                terminalYearFCFF
                            )}

                        </strong>

                    </div>


                    <div className="dcf-terminal-card">

                        <span>
                            Terminal Growth
                        </span>

                        <strong>

                            {formatPercent(
                                terminalGrowth
                            )}

                        </strong>

                    </div>


                    <div className="dcf-terminal-card">

                        <span>
                            WACC
                        </span>

                        <strong>

                            {formatPercent(
                                wacc
                            )}

                        </strong>

                    </div>


                    <div className="dcf-terminal-card">

                        <span>
                            Terminal Value
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                terminalValue
                            )}

                        </strong>

                    </div>


                    <div className="dcf-terminal-card">

                        <span>
                            Terminal Discount Factor
                        </span>

                        <strong>

                            {formatFactor(
                                terminalDiscountFactor
                            )}

                        </strong>

                    </div>


                    <div className="dcf-terminal-card">

                        <span>
                            PV of Terminal Value
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                pvTerminalValue
                            )}

                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                VALUATION BRIDGE
            ================================================== */}

            <div className="dcf-section">

                <div className="dcf-section-title">
                    Enterprise Value Bridge
                </div>


                <div className="dcf-bridge">


                    <div className="dcf-bridge-row">

                        <span>
                            PV of Explicit FCFF
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                pvExplicitFCFF
                            )}

                        </strong>

                    </div>


                    <div className="dcf-bridge-row">

                        <span>
                            PV of Terminal Value
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                pvTerminalValue
                            )}

                        </strong>

                    </div>


                    <div className="dcf-bridge-row dcf-bridge-total">

                        <span>
                            Enterprise Value
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                enterpriseValue
                            )}

                        </strong>

                    </div>


                    <div className="dcf-bridge-row">

                        <span>
                            Less: Net Debt
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                netDebt
                            )}

                        </strong>

                    </div>


                    <div className="dcf-bridge-row dcf-equity-value">

                        <span>
                            Equity Value
                        </span>

                        <strong>

                            {unitLabel}{" "}

                            {formatNumber(
                                equityValue
                            )}

                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                VALUATION CHECKS
            ================================================== */}

            <div className="dcf-section">

                <div className="dcf-section-title">
                    Valuation Checks
                </div>


                <div className="dcf-check-grid">


                    <div className="dcf-check-card">

                        <span>
                            PV Terminal Value / EV
                        </span>

                        <strong>

                            {formatPercent(
                                tvToEV
                            )}

                        </strong>

                    </div>


                    <div className="dcf-check-card">

                        <span>
                            DCF / EBITDA
                        </span>

                        <strong>

                            {formatMultiple(
                                dcfEbitdaMultiple
                            )}

                        </strong>

                    </div>


                    <div className="dcf-check-card">

                        <span>
                            Explicit Forecast Years
                        </span>

                        <strong>

                            {rows.length}

                        </strong>

                    </div>


                    <div className="dcf-check-card">

                        <span>
                            Terminal Method
                        </span>

                        <strong>
                            Gordon Growth
                        </strong>

                    </div>

                </div>

            </div>


        </div>

    );

}