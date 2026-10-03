import { useEffect, useMemo, useState } from "react";
import { getPnl } from "../services/api";
import "./pnl.css";

export default function PnlMultiPeriod() {

    const [data, setData] = useState([]);
    const [period, setPeriod] = useState("monthly");
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData("monthly");
    }, []);

    const loadData = async (selectedPeriod) => {

        try {

            setLoading(true);
            setError("");

            console.log(
                "Loading P&L period:",
                selectedPeriod
            );

            const res = await getPnl({
                period: selectedPeriod
            });

            console.log(
                "P&L BACKEND RESPONSE:",
                res
            );

            if (!Array.isArray(res)) {
                console.error(
                    "Unexpected P&L response:",
                    res
                );

                throw new Error(
                    "Invalid P&L response from backend."
                );
            }

            setData(res);
            setPeriod(selectedPeriod);
            setExpanded({});

        } catch (err) {

            console.error(
                "P&L loading error:",
                err
            );

            setError(
                err.message ||
                "Unable to load Profit & Loss statement."
            );

            setData([]);

        } finally {

            setLoading(false);

        }
    };


    /* =====================================================
       PERIOD COLUMNS
    ===================================================== */

    const columns = useMemo(() => {

        return data.map(
            (item) => item.label
        );

    }, [data]);


    /* =====================================================
       GET SUMMARY VALUES
    ===================================================== */

    const getValues = (keyPath) => {

        return data.map((item) => {

            let value = item?.data;

            keyPath.forEach((key) => {

                value = value?.[key];

            });

            return Number(value || 0);

        });

    };


    /* =====================================================
       LINE ITEMS
    ===================================================== */

    const getLineItems = (category) => {

        const map = {};

        data.forEach(
            (periodData, periodIndex) => {

                const raw =
                    periodData?.data
                        ?.line_items
                        ?. [category];

                if (!raw) {
                    return;
                }

                let items = [];

                if (Array.isArray(raw)) {

                    items = raw;

                } else if (
                    typeof raw === "object"
                ) {

                    items = Object.keys(raw).map(
                        (key) => ({
                            name: key,
                            value: raw[key],
                        })
                    );

                } else {

                    console.warn(
                        "Unexpected line item format:",
                        category,
                        raw
                    );

                    return;
                }


                items.forEach((item) => {

                    if (
                        !item ||
                        !item.name
                    ) {
                        return;
                    }

                    if (!map[item.name]) {

                        map[item.name] =
                            new Array(
                                data.length
                            ).fill(0);

                    }

                    map[item.name][
                        periodIndex
                    ] =
                        Number(
                            item.value || 0
                        );

                });

            }
        );

        return map;
    };


    /* =====================================================
       TOGGLE
    ===================================================== */

    const toggle = (key) => {

        setExpanded((previous) => ({

            ...previous,

            [key]: !previous[key],

        }));

    };


    /* =====================================================
       LATEST PERIOD SUMMARY
    ===================================================== */

    const latestData =
        data.length > 0
            ? data[data.length - 1]?.data || {}
            : {};

    const latestSummary =
        latestData.summary || {};


    const totalIncome =
        Number(
            latestSummary.total_income || 0
        );

    const totalExpense =
        Number(
            latestSummary.total_expense || 0
        );

    const netProfit =
        Number(
            latestSummary.profit || 0
        );

    const profitMargin =
        totalIncome !== 0
            ? (
                netProfit /
                totalIncome
            ) * 100
            : 0;


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="pnl-page">

                <div className="pnl-loading-card">

                    <div className="pnl-spinner"></div>

                    <p>
                        Loading Profit & Loss statement...
                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="pnl-page">

                <div className="pnl-error-card">

                    <div className="pnl-error-icon">
                        !
                    </div>

                    <div>

                        <h3>
                            Unable to load P&L
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            className="pnl-primary-button"
                            onClick={() =>
                                loadData(period)
                            }
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    /* =====================================================
       EMPTY
    ===================================================== */

    if (
        !data ||
        data.length === 0
    ) {

        return (

            <div className="pnl-page">

                <div className="pnl-empty-card">

                    <div className="pnl-empty-icon">
                        ₹
                    </div>

                    <h3>
                        No P&L data available
                    </h3>

                    <p>
                        There are no accounting
                        transactions available
                        for the selected period.
                    </p>

                    <button
                        className="pnl-primary-button"
                        onClick={() =>
                            loadData(period)
                        }
                    >
                        Refresh
                    </button>

                </div>

            </div>

        );

    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <div className="pnl-page">

            {/* HEADER */}

            <div className="pnl-header">

                <div className="pnl-header-left">

                    <div className="pnl-title-icon">
                        ₹
                    </div>

                    <div>

                        <h1>
                            Profit & Loss Statement
                        </h1>

                        <p>
                            Revenue, expenses and
                            profitability across
                            accounting periods.
                        </p>

                    </div>

                </div>


                <div className="pnl-header-actions">

                    <button
                        className="pnl-secondary-button"
                        onClick={() =>
                            loadData(period)
                        }
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="pnl-secondary-button"
                        onClick={() =>
                            window.print()
                        }
                    >
                        ⎙ Print
                    </button>

                </div>

            </div>


            {/* PERIOD SELECTOR */}

            <div className="pnl-period-card">

                <div className="pnl-period-left">

                    <span className="pnl-period-label">
                        Reporting Period
                    </span>


                    <div className="pnl-period-tabs">

                        <button
                            className={
                                period === "monthly"
                                    ? "pnl-period-tab active"
                                    : "pnl-period-tab"
                            }
                            onClick={() =>
                                loadData("monthly")
                            }
                        >
                            Monthly
                        </button>


                        <button
                            className={
                                period === "quarterly"
                                    ? "pnl-period-tab active"
                                    : "pnl-period-tab"
                            }
                            onClick={() =>
                                loadData("quarterly")
                            }
                        >
                            Quarterly
                        </button>


                        <button
                            className={
                                period === "half_yearly"
                                    ? "pnl-period-tab active"
                                    : "pnl-period-tab"
                            }
                            onClick={() =>
                                loadData("half_yearly")
                            }
                        >
                            Half Yearly
                        </button>


                        <button
                            className={
                                period === "yearly"
                                    ? "pnl-period-tab active"
                                    : "pnl-period-tab"
                            }
                            onClick={() =>
                                loadData("yearly")
                            }
                        >
                            Yearly
                        </button>

                    </div>

                </div>


                <div className="pnl-period-info">

                    {columns.length} periods

                </div>

            </div>


            {/* SUMMARY */}

            <div className="pnl-summary-grid">

                <SummaryCard
                    title="Total Income"
                    value={totalIncome}
                    icon="↗"
                    type="income"
                />


                <SummaryCard
                    title="Total Expenses"
                    value={totalExpense}
                    icon="↘"
                    type="expense"
                />


                <SummaryCard
                    title="Net Profit"
                    value={netProfit}
                    icon="₹"
                    type={
                        netProfit >= 0
                            ? "profit"
                            : "loss"
                    }
                />


                <SummaryCard
                    title="Profit Margin"
                    value={
                        `${profitMargin.toFixed(1)}%`
                    }
                    icon="%"
                    type={
                        profitMargin >= 0
                            ? "profit"
                            : "loss"
                    }
                    isPercentage
                />

            </div>


            {/* STATEMENT */}

            <div className="pnl-statement-card">

                <div className="pnl-statement-header">

                    <div>

                        <h2>
                            Statement of Profit & Loss
                        </h2>

                        <p>
                            Click an account category
                            to view its line items.
                        </p>

                    </div>


                    <div className="pnl-status">

                        <span className="pnl-status-dot"></span>

                        Live

                    </div>

                </div>


                <div className="pnl-table-wrapper">

                    <table className="pnl-table">

                        <thead>

                            <tr>

                                <th className="pnl-particulars-header">
                                    Particulars
                                </th>

                                {columns.map(
                                    (column) => (

                                        <th
                                            key={column}
                                            className="pnl-period-header"
                                        >
                                            {column}
                                        </th>

                                    )
                                )}

                            </tr>

                        </thead>


                        <tbody>

                            {/* REVENUE */}

                            <SectionHeader
                                label="Revenue"
                                icon="↗"
                            />


                            <ExpandableRow
                                label="Operating Income"
                                values={getValues([
                                    "summary",
                                    "operating_income",
                                ])}
                                expanded={
                                    expanded.operating_income
                                }
                                onClick={() =>
                                    toggle(
                                        "operating_income"
                                    )
                                }
                            />


                            {expanded.operating_income && (

                                <LineItems
                                    category="operating_income"
                                    getLineItems={
                                        getLineItems
                                    }
                                />

                            )}


                            <ExpandableRow
                                label="Other Income"
                                values={getValues([
                                    "summary",
                                    "non_operating_income",
                                ])}
                                expanded={
                                    expanded
                                        .non_operating_income
                                }
                                onClick={() =>
                                    toggle(
                                        "non_operating_income"
                                    )
                                }
                            />


                            {expanded.non_operating_income && (

                                <LineItems
                                    category="non_operating_income"
                                    getLineItems={
                                        getLineItems
                                    }
                                />

                            )}


                            <TotalRow
                                label="Total Income"
                                values={getValues([
                                    "summary",
                                    "total_income",
                                ])}
                            />


                            {/* EXPENSES */}

                            <SectionHeader
                                label="Expenses"
                                icon="↘"
                            />


                            <ExpandableRow
                                label="Operating Expense"
                                values={getValues([
                                    "summary",
                                    "operating_expense",
                                ])}
                                expanded={
                                    expanded
                                        .operating_expense
                                }
                                onClick={() =>
                                    toggle(
                                        "operating_expense"
                                    )
                                }
                            />


                            {expanded.operating_expense && (

                                <LineItems
                                    category="operating_expense"
                                    getLineItems={
                                        getLineItems
                                    }
                                />

                            )}


                            <ExpandableRow
                                label="Other Expense"
                                values={getValues([
                                    "summary",
                                    "non_operating_expense",
                                ])}
                                expanded={
                                    expanded
                                        .non_operating_expense
                                }
                                onClick={() =>
                                    toggle(
                                        "non_operating_expense"
                                    )
                                }
                            />


                            {expanded.non_operating_expense && (

                                <LineItems
                                    category="non_operating_expense"
                                    getLineItems={
                                        getLineItems
                                    }
                                />

                            )}


                            <TotalRow
                                label="Total Expense"
                                values={getValues([
                                    "summary",
                                    "total_expense",
                                ])}
                            />


                            {/* PROFIT */}

                            <ProfitRow
                                label="Net Profit"
                                values={getValues([
                                    "summary",
                                    "profit",
                                ])}
                            />

                        </tbody>

                    </table>

                </div>

            </div>


            {/* FOOTER */}

            <div className="pnl-footer-note">

                <span className="pnl-footer-icon">
                    ✓
                </span>

                <span>
                    Profit & Loss is generated
                    automatically from posted
                    accounting journal entries.
                </span>

            </div>

        </div>
    );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
    title,
    value,
    icon,
    type,
    isPercentage = false,
}) {

    return (

        <div
            className={`pnl-summary-card ${type}`}
        >

            <div className="pnl-summary-top">

                <div className="pnl-summary-icon">
                    {icon}
                </div>

                <span className="pnl-summary-title">
                    {title}
                </span>

            </div>


            <div className="pnl-summary-value">

                {isPercentage
                    ? value
                    : formatCurrency(value)}

            </div>

        </div>
    );
}


/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
    label,
    icon,
}) {

    return (

        <tr className="pnl-section-row">

            <td
                colSpan="100%"
                className="pnl-section-cell"
            >

                <span className="pnl-section-icon">
                    {icon}
                </span>

                {label}

            </td>

        </tr>
    );
}


/* ============================================================
   EXPANDABLE ROW
============================================================ */

function ExpandableRow({
    label,
    values,
    expanded,
    onClick,
}) {

    return (

        <tr
            className="pnl-expandable-row"
            onClick={onClick}
        >

            <td className="pnl-label-cell">

                <span
                    className={
                        expanded
                            ? "pnl-chevron expanded"
                            : "pnl-chevron"
                    }
                >
                    ▶
                </span>

                <span>
                    {label}
                </span>

            </td>


            {values.map(
                (value, index) => (

                    <td
                        key={index}
                        className="pnl-value-cell"
                    >
                        {formatCurrency(value)}
                    </td>

                )
            )}

        </tr>
    );
}


/* ============================================================
   LINE ITEMS
============================================================ */

function LineItems({
    category,
    getLineItems,
}) {

    let items = {};

    try {

        items =
            getLineItems(category);

    } catch (error) {

        console.error(
            "P&L LineItems error:",
            error
        );

        return null;
    }


    if (
        !items ||
        Object.keys(items).length === 0
    ) {

        return null;

    }


    return (

        <>

            {Object.entries(items).map(
                ([name, values]) => {

                    if (!Array.isArray(values)) {
                        return null;
                    }

                    return (

                        <tr
                            key={`${category}-${name}`}
                            className="pnl-line-item-row"
                        >

                            <td className="pnl-sub-label-cell">

                                <span className="pnl-sub-dot"></span>

                                {formatLabel(name)}

                            </td>


                            {values.map(
                                (value, index) => (

                                    <td
                                        key={index}
                                        className="pnl-value-cell pnl-sub-value"
                                    >
                                        {formatCurrency(value)}
                                    </td>

                                )
                            )}

                        </tr>

                    );

                }
            )}

        </>

    );
}


/* ============================================================
   TOTAL ROW
============================================================ */

function TotalRow({
    label,
    values,
}) {

    return (

        <tr className="pnl-total-row">

            <td className="pnl-total-label">
                {label}
            </td>


            {values.map(
                (value, index) => (

                    <td
                        key={index}
                        className="pnl-total-value"
                    >
                        {formatCurrency(value)}
                    </td>

                )
            )}

        </tr>
    );
}


/* ============================================================
   PROFIT ROW
============================================================ */

function ProfitRow({
    label,
    values,
}) {

    return (

        <tr className="pnl-profit-row">

            <td className="pnl-profit-label">

                <span className="pnl-profit-icon">
                    ✓
                </span>

                {label}

            </td>


            {values.map(
                (value, index) => (

                    <td
                        key={index}
                        className="pnl-profit-value"
                    >
                        {formatCurrency(value)}
                    </td>

                )
            )}

        </tr>
    );
}


/* ============================================================
   FORMATTERS
============================================================ */

function formatCurrency(value) {

    const number =
        Number(value || 0);

    if (number < 0) {

        return `(${Math.abs(number).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )})`;

    }

    return `₹${number.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}


function formatLabel(value) {

    return String(value)
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
        );
}