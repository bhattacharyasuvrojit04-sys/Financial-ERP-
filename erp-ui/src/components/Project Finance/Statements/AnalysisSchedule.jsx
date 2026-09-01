import React from "react";
import "../../../Styles/AnalysisSchedule.css";

export default function AnalysisSchedule({
    data = [],
    displayUnit = "million"
}) {

    // ==========================================
    // FORMAT NUMBER
    // ==========================================

    const formatNumber = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "--";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return "--";
        }

        let divisor = 1;

        if (displayUnit === "million") {
            divisor = 1000000;
        }

        if (displayUnit === "thousand") {
            divisor = 1000;
        }

        return (
            number / divisor
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    };


    // ==========================================
    // FORMAT PERCENTAGE
    // ==========================================

    const formatPercent = (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "--";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return "--";
        }

        return (
            number * 100
        ).toFixed(2) + "%";
    };


    // ==========================================
    // FORMAT DSCR
    // ==========================================

    const formatDSCR = (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "--";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return "--";
        }

        return number.toFixed(2) + "x";
    };


    // ==========================================
    // DSCR STATUS
    // ==========================================

    const getDSCRClass = (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        const number = Number(value);

        if (number < 1.00) {
            return "dscr-danger";
        }

        if (number < 1.20) {
            return "dscr-warning";
        }

        return "dscr-good";
    };


    // ==========================================
    // SUMMARY VALUES
    // ==========================================

    const validDSCR = data
        .map(row => Number(row.dscr))
        .filter(
            value =>
                !Number.isNaN(value) &&
                Number.isFinite(value)
        );

    const minimumDSCR =
        validDSCR.length > 0
            ? Math.min(...validDSCR)
            : null;


    const lastRow =
        data.length > 0
            ? data[data.length - 1]
            : null;


    const finalProjectIRR =
        lastRow?.project_irr;


    const finalEquityIRR =
        lastRow?.equity_irr;


    const finalNPV =
        lastRow?.npv;


    // ==========================================
    // EMPTY STATE
    // ==========================================

    if (!data || data.length === 0) {

        return (

            <div className="analysis-empty">

                <div className="analysis-empty-title">
                    No Analysis Available
                </div>

                <div className="analysis-empty-text">
                    Run the project analysis to generate
                    yearly project returns and credit metrics.
                </div>

            </div>

        );

    }


    return (

        <div className="analysis-schedule">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="analysis-header">

                <div>

                    <div className="analysis-title">
                        Project Returns & Credit Analysis
                    </div>

                    <div className="analysis-subtitle">
                        Yearly project economics, equity returns
                        and debt service coverage
                    </div>

                </div>

                <div className="analysis-period">

                    {data.length} Project Years

                </div>

            </div>


            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

            <div className="analysis-summary">


                {/* PROJECT IRR */}

                <div className="analysis-card">

                    <div className="analysis-card-label">
                        Project IRR
                    </div>

                    <div className="analysis-card-value">

                        {formatPercent(
                            finalProjectIRR
                        )}

                    </div>

                    <div className="analysis-card-sub">
                        Unlevered return
                    </div>

                </div>


                {/* EQUITY IRR */}

                <div className="analysis-card">

                    <div className="analysis-card-label">
                        Equity IRR
                    </div>

                    <div className="analysis-card-value">

                        {formatPercent(
                            finalEquityIRR
                        )}

                    </div>

                    <div className="analysis-card-sub">
                        Levered equity return
                    </div>

                </div>


                {/* NPV */}

                <div className="analysis-card">

                    <div className="analysis-card-label">
                        NPV
                    </div>

                    <div className="analysis-card-value">

                        {formatNumber(
                            finalNPV
                        )}

                    </div>

                    <div className="analysis-card-sub">

                        {displayUnit === "million"
                            ? "₹ million"
                            : displayUnit === "thousand"
                                ? "₹ thousand"
                                : "₹"}

                    </div>

                </div>


                {/* DSCR */}

                <div className="analysis-card">

                    <div className="analysis-card-label">
                        Minimum DSCR
                    </div>

                    <div
                        className={
                            `analysis-card-value ${
                                getDSCRClass(
                                    minimumDSCR
                                )
                            }`
                        }
                    >

                        {formatDSCR(
                            minimumDSCR
                        )}

                    </div>

                    <div className="analysis-card-sub">
                        Minimum annual coverage
                    </div>

                </div>

            </div>


            {/* ==========================================
                YEARLY SCHEDULE
            ========================================== */}

            <div className="analysis-table-container">

                <div className="analysis-table-header">

                    <div>

                        <div className="analysis-table-title">
                            Yearly Returns Analysis
                        </div>

                        <div className="analysis-table-subtitle">
                            Annual project and financing performance
                        </div>

                    </div>

                </div>


                <div className="analysis-table-scroll">

                    <table className="analysis-table">

                        <thead>

                            <tr>

                                <th className="sticky-year">
                                    Year
                                </th>

                                <th>
                                    Project Cash Flow
                                </th>

                                <th>
                                    Equity Cash Flow
                                </th>

                                <th>
                                    CFADS
                                </th>

                                <th>
                                    Debt Service
                                </th>

                                <th>
                                    DSCR
                                </th>

                                <th>
                                    Project IRR
                                </th>

                                <th>
                                    Equity IRR
                                </th>

                                <th>
                                    Discounted Cash Flow
                                </th>

                                <th>
                                    NPV
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {data.map(
                                (row, index) => {

                                    return (

                                        <tr
                                            key={
                                                row.year ??
                                                index
                                            }
                                        >

                                            {/* YEAR */}

                                            <td className="sticky-year year-cell">

                                                Year{" "}

                                                {row.year ??
                                                    index + 1}

                                            </td>


                                            {/* PROJECT CASH FLOW */}

                                            <td>

                                                {formatNumber(
                                                    row.project_cash_flow
                                                )}

                                            </td>


                                            {/* EQUITY CASH FLOW */}

                                            <td>

                                                {formatNumber(
                                                    row.equity_cash_flow
                                                )}

                                            </td>


                                            {/* CFADS */}

                                            <td className="cfads-cell">

                                                {formatNumber(
                                                    row.cfads
                                                )}

                                            </td>


                                            {/* DEBT SERVICE */}

                                            <td>

                                                {formatNumber(
                                                    row.debt_service
                                                )}

                                            </td>


                                            {/* DSCR */}

                                            <td>

                                                <span
                                                    className={
                                                        `dscr-badge ${
                                                            getDSCRClass(
                                                                row.dscr
                                                            )
                                                        }`
                                                    }
                                                >

                                                    {formatDSCR(
                                                        row.dscr
                                                    )}

                                                </span>

                                            </td>


                                            {/* PROJECT IRR */}

                                            <td className="return-cell">

                                                {formatPercent(
                                                    row.project_irr
                                                )}

                                            </td>


                                            {/* EQUITY IRR */}

                                            <td className="return-cell">

                                                {formatPercent(
                                                    row.equity_irr
                                                )}

                                            </td>


                                            {/* DISCOUNTED CASH FLOW */}

                                            <td>

                                                {formatNumber(
                                                    row.discounted_cash_flow
                                                )}

                                            </td>


                                            {/* NPV */}

                                            <td className="npv-cell">

                                                {formatNumber(
                                                    row.npv
                                                )}

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==========================================
                FOOTNOTE
            ========================================== */}

            <div className="analysis-footnote">

                <div>
                    <strong>DSCR</strong> = CFADS ÷ Debt Service
                </div>

                <div>
                    IRR represents the cumulative return
                    calculated through each project year.
                </div>

                <div>
                    NPV is shown on a cumulative basis using
                    the project's discount rate.
                </div>

            </div>

        </div>

    );

}