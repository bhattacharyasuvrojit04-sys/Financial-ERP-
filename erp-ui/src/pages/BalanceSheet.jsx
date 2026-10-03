import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getBalanceSheet } from "../services/api";
import "./balanceSheet.css";

export default function BalanceSheet() {

    const [data, setData] = useState([]);
    const [period, setPeriod] = useState("yearly");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * =========================================================
     * LOAD BALANCE SHEET
     * =========================================================
     */

    const loadData = async (selectedPeriod = period) => {

        try {

            setLoading(true);
            setError("");

            console.log(
                "Loading Balance Sheet:",
                selectedPeriod
            );

            const res = await getBalanceSheet({
                period: selectedPeriod
            });

            console.log(
                "BALANCE SHEET RESPONSE:",
                res
            );

            /*
             * Backend can return either:
             *
             * [
             *   {
             *      label: "2026",
             *      data: {...}
             *   }
             * ]
             *
             * OR a single object.
             */

            const normalized = Array.isArray(res)
                ? res
                : [
                    {
                        label: "Current",
                        data: res
                    }
                ];

            setData(normalized);

        } catch (err) {

            console.error(
                "Balance Sheet loading error:",
                err
            );

            setError(
                err.message ||
                "Unable to load Balance Sheet."
            );

            setData([]);

        } finally {

            setLoading(false);

        }
    };


    /*
     * =========================================================
     * INITIAL LOAD
     * =========================================================
     */

    useEffect(() => {

        loadData("yearly");

    }, []);


    /*
     * =========================================================
     * PERIOD COLUMNS
     * =========================================================
     */

    const columns = useMemo(() => {

        return data.map(
            (report) => report.label
        );

    }, [data]);


    /*
     * =========================================================
     * GET REPORT DATA
     * =========================================================
     */

    const getReportData = (report) => {

        return report?.data || report || {};

    };


    /*
     * =========================================================
     * GET ACCOUNTS FOR A SECTION
     *
     * Combines accounts appearing in any period.
     * =========================================================
     */

    const getAccounts = (section) => {

        const accounts = new Set();

        data.forEach((report) => {

            const reportData =
                getReportData(report);

            const items =
                reportData
                    ?.line_items
                    ?. [section] || {};

            Object.keys(items).forEach(
                (account) => {
                    accounts.add(account);
                }
            );

        });

        return Array.from(accounts);

    };


    /*
     * =========================================================
     * LATEST PERIOD
     *
     * Used for dashboard KPI cards.
     * =========================================================
     */

    const latestReport =
        data.length > 0
            ? getReportData(
                data[data.length - 1]
            )
            : {};

    const latestSummary =
        latestReport.summary || {};


    const totalAssets =
        Number(
            latestSummary.total_assets || 0
        );

    const totalLiabilities =
        Number(
            latestSummary.total_liabilities || 0
        );

    const equity =
        Number(
            latestSummary.equity || 0
        );

    const balanceCheck =
        Number(
            latestSummary.balance_check || 0
        );

    /*
     * Balance sheet is considered balanced when
     * the difference is effectively zero.
     */

    const isBalanced =
        Math.abs(balanceCheck) < 0.01;


    /*
     * =========================================================
     * LOADING STATE
     * =========================================================
     */

    if (loading) {

        return (

            

                <div className="bs-page">

                    <div className="bs-loading-card">

                        <div className="bs-spinner"></div>

                        <p>
                            Loading Balance Sheet...
                        </p>

                    </div>

                </div>

            

        );

    }


    /*
     * =========================================================
     * ERROR STATE
     * =========================================================
     */

    if (error) {

        return (

            

                <div className="bs-page">

                    <div className="bs-error-card">

                        <div className="bs-error-icon">
                            !
                        </div>

                        <div>

                            <h3>
                                Unable to load Balance Sheet
                            </h3>

                            <p>
                                {error}
                            </p>

                            <button
                                className="bs-primary-button"
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


    /*
     * =========================================================
     * EMPTY STATE
     * =========================================================
     */

    if (!data.length) {

        return (

            

                <div className="bs-page">

                    <div className="bs-empty-card">

                        <div className="bs-empty-icon">
                            ₹
                        </div>

                        <h3>
                            No Balance Sheet data
                        </h3>

                        <p>
                            There are no accounting
                            transactions available
                            for the selected period.
                        </p>

                        <button
                            className="bs-primary-button"
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


    /*
     * =========================================================
     * MAIN UI
     * =========================================================
     */

    return (

        

            <div className="bs-page">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="bs-header">

                    <div className="bs-header-left">

                        <div className="bs-title-icon">
                            ₹
                        </div>

                        <div>

                            <h1>
                                Balance Sheet
                            </h1>

                            <p>
                                Assets, liabilities and equity
                                across accounting periods.
                            </p>

                        </div>

                    </div>


                    <div className="bs-header-actions">

                        <button
                            className="bs-secondary-button"
                            onClick={() =>
                                loadData(period)
                            }
                        >
                            ↻ Refresh
                        </button>

                        <button
                            className="bs-secondary-button"
                            onClick={() =>
                                window.print()
                            }
                        >
                            ⎙ Print
                        </button>

                    </div>

                </div>


                {/* =================================================
                    PERIOD SELECTOR
                ================================================== */}

                <div className="bs-period-card">

                    <div className="bs-period-left">

                        <span className="bs-period-label">
                            Reporting Period
                        </span>


                        <div className="bs-period-tabs">

                            <button
                                className={
                                    period === "monthly"
                                        ? "bs-period-tab active"
                                        : "bs-period-tab"
                                }
                                onClick={() => {
                                    setPeriod("monthly");
                                    loadData("monthly");
                                }}
                            >
                                Monthly
                            </button>


                            <button
                                className={
                                    period === "quarterly"
                                        ? "bs-period-tab active"
                                        : "bs-period-tab"
                                }
                                onClick={() => {
                                    setPeriod("quarterly");
                                    loadData("quarterly");
                                }}
                            >
                                Quarterly
                            </button>


                            <button
                                className={
                                    period === "yearly"
                                        ? "bs-period-tab active"
                                        : "bs-period-tab"
                                }
                                onClick={() => {
                                    setPeriod("yearly");
                                    loadData("yearly");
                                }}
                            >
                                Yearly
                            </button>

                        </div>

                    </div>


                    <div className="bs-period-info">

                        {columns.length} periods

                    </div>

                </div>


                {/* =================================================
                    SUMMARY CARDS
                ================================================== */}

                <div className="bs-summary-grid">

                    <SummaryCard
                        title="Total Assets"
                        value={totalAssets}
                        icon="◈"
                        type="asset"
                    />


                    <SummaryCard
                        title="Total Liabilities"
                        value={totalLiabilities}
                        icon="↘"
                        type="liability"
                    />


                    <SummaryCard
                        title="Equity"
                        value={equity}
                        icon="◆"
                        type="equity"
                    />


                    <div
                        className={
                            isBalanced
                                ? "bs-summary-card balanced"
                                : "bs-summary-card unbalanced"
                        }
                    >

                        <div className="bs-summary-top">

                            <div className="bs-summary-icon">

                                {isBalanced
                                    ? "✓"
                                    : "!"}

                            </div>

                            <span className="bs-summary-title">
                                Balance Check
                            </span>

                        </div>


                        <div className="bs-balance-status">

                            <span
                                className={
                                    isBalanced
                                        ? "bs-balance-dot balanced"
                                        : "bs-balance-dot unbalanced"
                                }
                            ></span>

                            <span>
                                {isBalanced
                                    ? "Balanced"
                                    : "Not Balanced"}
                            </span>

                        </div>


                        <div className="bs-balance-difference">

                            Difference:{" "}

                            {formatCurrency(
                                balanceCheck
                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    STATEMENT CARD
                ================================================== */}

                <div className="bs-statement-card">

                    <div className="bs-statement-header">

                        <div>

                            <h2>
                                Statement of Financial Position
                            </h2>

                            <p>
                                Assets, liabilities and
                                shareholders' equity.
                            </p>

                        </div>


                        <div
                            className={
                                isBalanced
                                    ? "bs-status balanced"
                                    : "bs-status unbalanced"
                            }
                        >

                            <span
                                className="bs-status-dot"
                            ></span>

                            {isBalanced
                                ? "Balanced"
                                : "Review Required"}

                        </div>

                    </div>


                    {/* =================================================
                        TABLE
                    ================================================== */}

                    <div className="bs-table-wrapper">

                        <table className="bs-table">

                            <thead>

                                <tr>

                                    <th className="bs-account-header">
                                        Account
                                    </th>

                                    {columns.map(
                                        (column) => (

                                            <th
                                                key={column}
                                                className="bs-period-header"
                                            >
                                                {column}
                                            </th>

                                        )
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                {/* =====================================
                                    ASSETS
                                ====================================== */}

                                <SectionHeader
                                    label="Assets"
                                    icon="◈"
                                />


                                <SubSectionHeader
                                    label="Current Assets"
                                />


                                {getAccounts(
                                    "current_assets"
                                ).map(
                                    (account) => (

                                        <AccountRow
                                            key={
                                                `current-asset-${account}`
                                            }
                                            account={account}
                                            data={data}
                                            section="current_assets"
                                        />

                                    )
                                )}


                                <SubSectionHeader
                                    label="Non Current Assets"
                                />


                                {getAccounts(
                                    "non_current_assets"
                                ).map(
                                    (account) => (

                                        <AccountRow
                                            key={
                                                `non-current-asset-${account}`
                                            }
                                            account={account}
                                            data={data}
                                            section="non_current_assets"
                                        />

                                    )
                                )}


                                <TotalRow
                                    label="Total Assets"
                                    values={data.map(
                                        (report) =>
                                            Number(
                                                getReportData(
                                                    report
                                                )
                                                    ?.summary
                                                    ?.total_assets ||
                                                0
                                            )
                                    )}
                                />


                                {/* =====================================
                                    LIABILITIES
                                ====================================== */}

                                <SectionHeader
                                    label="Liabilities"
                                    icon="↘"
                                />


                                <SubSectionHeader
                                    label="Current Liabilities"
                                />


                                {getAccounts(
                                    "current_liabilities"
                                ).map(
                                    (account) => (

                                        <AccountRow
                                            key={
                                                `current-liability-${account}`
                                            }
                                            account={account}
                                            data={data}
                                            section="current_liabilities"
                                        />

                                    )
                                )}


                                <SubSectionHeader
                                    label="Non Current Liabilities"
                                />


                                {getAccounts(
                                    "non_current_liabilities"
                                ).map(
                                    (account) => (

                                        <AccountRow
                                            key={
                                                `non-current-liability-${account}`
                                            }
                                            account={account}
                                            data={data}
                                            section="non_current_liabilities"
                                        />

                                    )
                                )}


                                <TotalRow
                                    label="Total Liabilities"
                                    values={data.map(
                                        (report) =>
                                            Number(
                                                getReportData(
                                                    report
                                                )
                                                    ?.summary
                                                    ?.total_liabilities ||
                                                0
                                            )
                                    )}
                                />


                                {/* =====================================
                                    EQUITY
                                ====================================== */}

                                <SectionHeader
                                    label="Equity"
                                    icon="◆"
                                />


                                <TotalRow
                                    label="Total Equity"
                                    values={data.map(
                                        (report) =>
                                            Number(
                                                getReportData(
                                                    report
                                                )
                                                    ?.summary
                                                    ?.equity ||
                                                0
                                            )
                                    )}
                                />


                                {/* =====================================
                                    TOTAL LIABILITIES + EQUITY
                                ====================================== */}

                                <GrandTotalRow
                                    label="Total Liabilities + Equity"
                                    values={data.map(
                                        (report) => {

                                            const reportData =
                                                getReportData(
                                                    report
                                                );

                                            const summary =
                                                reportData.summary ||
                                                {};

                                            return (
                                                Number(
                                                    summary.total_liabilities ||
                                                    0
                                                ) +
                                                Number(
                                                    summary.equity ||
                                                    0
                                                )
                                            );

                                        }
                                    )}
                                />


                                {/* =====================================
                                    BALANCE CHECK
                                ====================================== */}

                                <BalanceCheckRow
                                    data={data}
                                />

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* =================================================
                    FOOTER NOTE
                ================================================== */}

                <div className="bs-footer-note">

                    <span className="bs-footer-icon">
                        ✓
                    </span>

                    <span>
                        Balance Sheet is generated automatically
                        from posted accounting journal entries.
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
}) {

    return (

        <div
            className={`bs-summary-card ${type}`}
        >

            <div className="bs-summary-top">

                <div className="bs-summary-icon">
                    {icon}
                </div>

                <span className="bs-summary-title">
                    {title}
                </span>

            </div>


            <div className="bs-summary-value">

                {formatCurrency(value)}

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

        <tr className="bs-section-row">

            <td
                colSpan="100%"
                className="bs-section-cell"
            >

                <span className="bs-section-icon">
                    {icon}
                </span>

                {label}

            </td>

        </tr>
    );
}


/* ============================================================
   SUB SECTION
============================================================ */

function SubSectionHeader({
    label,
}) {

    return (

        <tr className="bs-subsection-row">

            <td
                colSpan="100%"
                className="bs-subsection-cell"
            >

                <span className="bs-subsection-line"></span>

                {label}

            </td>

        </tr>
    );
}


/* ============================================================
   ACCOUNT ROW
============================================================ */

function AccountRow({
    account,
    data,
    section,
}) {

    return (

        <tr className="bs-account-row">

            <td className="bs-account-cell">

                <span className="bs-account-dot"></span>

                {formatName(account)}

            </td>


            {data.map(
                (report, index) => {

                    const reportData =
                        report?.data ||
                        report ||
                        {};

                    const value =
                        reportData
                            ?.line_items
                            ?. [section]
                            ?. [account];

                    return (

                        <td
                            key={`${account}-${index}`}
                            className="bs-value-cell"
                        >
                            {formatCurrency(value)}
                        </td>

                    );

                }
            )}

        </tr>
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

        <tr className="bs-total-row">

            <td className="bs-total-label">

                {label}

            </td>


            {values.map(
                (value, index) => (

                    <td
                        key={index}
                        className="bs-total-value"
                    >
                        {formatCurrency(value)}
                    </td>

                )
            )}

        </tr>
    );
}


/* ============================================================
   GRAND TOTAL
============================================================ */

function GrandTotalRow({
    label,
    values,
}) {

    return (

        <tr className="bs-grand-total-row">

            <td className="bs-grand-total-label">
                {label}
            </td>


            {values.map(
                (value, index) => (

                    <td
                        key={index}
                        className="bs-grand-total-value"
                    >
                        {formatCurrency(value)}
                    </td>

                )
            )}

        </tr>
    );
}


/* ============================================================
   BALANCE CHECK ROW
============================================================ */

function BalanceCheckRow({
    data,
}) {

    return (

        <tr className="bs-check-row">

            <td className="bs-check-label">

                <span className="bs-check-icon">
                    ✓
                </span>

                Balance Check

            </td>


            {data.map(
                (report, index) => {

                    const reportData =
                        report?.data ||
                        report ||
                        {};

                    const value =
                        Number(
                            reportData
                                ?.summary
                                ?.balance_check ||
                            0
                        );

                    const balanced =
                        Math.abs(value) < 0.01;

                    return (

                        <td
                            key={index}
                            className={
                                balanced
                                    ? "bs-check-value balanced"
                                    : "bs-check-value unbalanced"
                            }
                        >

                            <span className="bs-check-status">

                                <span className="bs-check-dot"></span>

                                {balanced
                                    ? "Balanced"
                                    : formatCurrency(value)}

                            </span>

                        </td>

                    );

                }
            )}

        </tr>
    );
}


/* ============================================================
   HELPERS
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


function formatName(name) {

    return String(name)
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
        );

}