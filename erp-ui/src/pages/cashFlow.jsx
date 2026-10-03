import { useEffect, useMemo, useState } from "react";
import { getCashFlow } from "../services/api";
import "./cashflow.css";

export default function CashFlow() {
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState({
    assets: true,
    liabilities: true,
    investing: true,
    financing: true,
  });

  /* =========================================================
     LOAD CASH FLOW
     ========================================================= */

  const loadCashFlow = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCashFlow({period});

      setData(result);
    } catch (err) {
      console.error("Cash flow loading error:", err);
      setError("Unable to load cash flow statement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashFlow();
  }, [period]);

  /* =========================================================
     NORMALIZE PERIODIC RESPONSE
     
     Your backend periodic endpoint may return an array
     while the normal endpoint returns a single object.
     ========================================================= */

 const periods = useMemo(() => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  return [
    {
      label: "Current Period",
      data: data,
    },
  ];
}, [data]);

const currentData = useMemo(() => {
  if (!periods.length) return null;

  return periods[0]?.data || periods[0];
}, [periods]);

  /* =========================================================
     HELPERS
     ========================================================= */

  const formatNumber = (num) => {
    const value = Number(num || 0);

    if (Math.abs(value) < 0.01) {
      return "—";
    }

    const formatted = Math.abs(value).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return value < 0
      ? `(${formatted})`
      : formatted;
  };

  const formatCurrency = (num) => {
    const value = Number(num || 0);

    if (Math.abs(value) < 0.01) {
      return "₹—";
    }

    const formatted = Math.abs(value).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return value < 0
      ? `₹(${formatted})`
      : `₹${formatted}`;
  };

  const formatLabel = (str = "") =>
    str
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getValueClass = (value) => {
    const number = Number(value || 0);

    if (number > 0) return "positive";
    if (number < 0) return "negative";

    return "neutral";
  };

  const toggleSection = (section) => {
    setExpanded((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  /* =========================================================
     RENDER LINE ITEMS
     ========================================================= */

  const renderLineItems = (
    items = {},
    indent = false
  ) => {
    return Object.entries(items).map(
      ([key, value]) => (
        <div
          className={`cf-row ${
            indent ? "cf-row-indent" : ""
          }`}
          key={key}
        >
          <span className="cf-row-label">
            {formatLabel(key)}
          </span>

          <span
            className={`cf-row-value ${getValueClass(
              value
            )}`}
          >
            {formatCurrency(value)}
          </span>
        </div>
      )
    );
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading && !data) {
    return (
      <div className="cf-page">
        <div className="cf-loading">

          <div className="cf-loading-spinner" />

          <div>
            <div className="cf-loading-title">
              Loading Cash Flow
            </div>

            <div className="cf-loading-text">
              Preparing your financial statement...
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error && !data) {
    return (
      <div className="cf-page">
        <div className="cf-error-card">

          <div className="cf-error-icon">
            !
          </div>

          <div>
            <h3>
              Unable to load Cash Flow
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={loadCashFlow}
              className="cf-retry-btn"
            >
              Try Again
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (!currentData) {
    return null;
  }

  const { summary = {}, line_items = {} } =
    currentData;

  const operating =
    line_items.operating || {};

  const investing =
    line_items.investing || {};

  const financing =
    line_items.financing || {};

  /* =========================================================
     VALUES
     ========================================================= */

  const operatingCashFlow =
    Number(summary.operating_cash_flow || 0);

  const investingCashFlow =
    Number(summary.investing_cash_flow || 0);

  const financingCashFlow =
    Number(summary.financing_cash_flow || 0);

  const netCashFlow =
    Number(summary.net_cash_flow || 0);

  /* =========================================================
     PERIOD LABEL
     ========================================================= */

  const periodLabel = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    half_yearly: "Half-Yearly",
    yearly: "Yearly",
  }[period];

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="cf-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="cf-header">

        <div className="cf-header-left">

          <div className="cf-icon">
            <span>CF</span>
          </div>

          <div>

            <div className="cf-eyebrow">
              FINANCIAL STATEMENTS
            </div>

            <h1 className="cf-title">
              Cash Flow Statement
            </h1>

            <p className="cf-subtitle">
              Track cash generated and used across
              operating, investing and financing activities.
            </p>

          </div>

        </div>

        <div className="cf-header-actions">

          <button
            className="cf-action-btn"
            onClick={() => window.print()}
          >
            <span>⎙</span>
            Print
          </button>

          <button
            className="cf-action-btn"
            onClick={loadCashFlow}
          >
            <span>↻</span>
            Refresh
          </button>

        </div>

      </div>

      {/* =====================================================
          PERIOD SELECTOR
          ===================================================== */}

      <div className="cf-period-bar">

        <div className="cf-period-left">

          <span className="cf-period-label">
            Reporting Period
          </span>

          <div className="cf-period-tabs">

            {[
              ["monthly", "Monthly"],
              ["quarterly", "Quarterly"],
              ["half_yearly", "Half-Yearly"],
              ["yearly", "Yearly"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`cf-period-tab ${
                  period === value
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPeriod(value)
                }
              >
                {label}
              </button>
            ))}

          </div>

        </div>

        <div className="cf-period-status">

          <span className="cf-status-dot" />

          {periodLabel} View

        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="cf-summary-grid">

        <SummaryCard
          label="Operating Cash Flow"
          value={operatingCashFlow}
          icon="O"
          type="operating"
        />

        <SummaryCard
          label="Investing Cash Flow"
          value={investingCashFlow}
          icon="I"
          type="investing"
        />

        <SummaryCard
          label="Financing Cash Flow"
          value={financingCashFlow}
          icon="F"
          type="financing"
        />

        <div className="cf-net-card">

          <div className="cf-net-card-top">

            <span className="cf-summary-label">
              Net Increase in Cash
            </span>

            <div className="cf-net-icon">
              ↑
            </div>

          </div>

          <div
            className={`cf-net-value ${getValueClass(
              netCashFlow
            )}`}
          >
            {formatCurrency(netCashFlow)}
          </div>

          <div className="cf-net-footer">
            {netCashFlow >= 0
              ? "Positive cash generation"
              : "Net cash outflow"}
          </div>

        </div>

      </div>

      {/* =====================================================
          STATEMENT
          ===================================================== */}

      <div className="cf-statement-card">

        <div className="cf-statement-header">

          <div>

            <div className="cf-statement-title">
              Cash Flow Analysis
            </div>

            <div className="cf-statement-period">
              {periodLabel} financial activity
            </div>

          </div>

          {loading && (
            <div className="cf-updating">
              Updating...
            </div>
          )}

        </div>

        {/* ===================================================
            OPERATING ACTIVITIES
            =================================================== */}

        <section className="cf-section">

          <SectionHeader
            title="Operating Activities"
            subtitle="Cash generated from core business operations"
            value={operatingCashFlow}
            type="operating"
          />

          <div className="cf-section-body">

            <div className="cf-row cf-highlight-row">

              <span className="cf-row-label">
                Net Profit
              </span>

              <span
                className={`cf-row-value ${getValueClass(
                  operating.net_profit
                )}`}
              >
                {formatCurrency(
                  operating.net_profit
                )}
              </span>

            </div>

            <div className="cf-row">

              <span className="cf-row-label">
                Depreciation
              </span>

              <span
                className={`cf-row-value ${getValueClass(
                  operating.depreciation
                )}`}
              >
                {formatCurrency(
                  operating.depreciation
                )}
              </span>

            </div>

            {/* Current Assets */}

            {operating.change_in_current_assets &&
              Object.keys(
                operating.change_in_current_assets
              ).length > 0 && (

                <div className="cf-subsection">

                  <button
                    className="cf-subsection-header"
                    onClick={() =>
                      toggleSection("assets")
                    }
                  >

                    <span className="cf-subsection-left">

                      <span className="cf-chevron">
                        {expanded.assets
                          ? "⌄"
                          : "›"}
                      </span>

                      Change in Current Assets

                    </span>

                  </button>

                  {expanded.assets && (
                    <div className="cf-subsection-body">
                      {renderLineItems(
                        operating.change_in_current_assets,
                        true
                      )}
                    </div>
                  )}

                </div>
              )}

            {/* Current Liabilities */}

            {operating.change_in_current_liabilities &&
              Object.keys(
                operating.change_in_current_liabilities
              ).length > 0 && (

                <div className="cf-subsection">

                  <button
                    className="cf-subsection-header"
                    onClick={() =>
                      toggleSection("liabilities")
                    }
                  >

                    <span className="cf-subsection-left">

                      <span className="cf-chevron">
                        {expanded.liabilities
                          ? "⌄"
                          : "›"}
                      </span>

                      Change in Current Liabilities

                    </span>

                  </button>

                  {expanded.liabilities && (
                    <div className="cf-subsection-body">
                      {renderLineItems(
                        operating.change_in_current_liabilities,
                        true
                      )}
                    </div>
                  )}

                </div>
              )}

          </div>

          <TotalRow
            label="Net Cash from Operating Activities"
            value={operatingCashFlow}
          />

        </section>

        {/* ===================================================
            INVESTING
            =================================================== */}

        <section className="cf-section">

          <SectionHeader
            title="Investing Activities"
            subtitle="Cash used for assets and investments"
            value={investingCashFlow}
            type="investing"
          />

          <div className="cf-section-body">

            <div className="cf-subsection">

              <button
                className="cf-subsection-header"
                onClick={() =>
                  toggleSection("investing")
                }
              >

                <span className="cf-subsection-left">

                  <span className="cf-chevron">
                    {expanded.investing
                      ? "⌄"
                      : "›"}
                  </span>

                  Investing Transactions

                </span>

              </button>

              {expanded.investing && (
                <div className="cf-subsection-body">
                  {renderLineItems(investing)}
                </div>
              )}

            </div>

          </div>

          <TotalRow
            label="Net Cash from Investing Activities"
            value={investingCashFlow}
          />

        </section>

        {/* ===================================================
            FINANCING
            =================================================== */}

        <section className="cf-section">

          <SectionHeader
            title="Financing Activities"
            subtitle="Cash raised or returned through financing"
            value={financingCashFlow}
            type="financing"
          />

          <div className="cf-section-body">

            <div className="cf-subsection">

              <button
                className="cf-subsection-header"
                onClick={() =>
                  toggleSection("financing")
                }
              >

                <span className="cf-subsection-left">

                  <span className="cf-chevron">
                    {expanded.financing
                      ? "⌄"
                      : "›"}
                  </span>

                  Financing Transactions

                </span>

              </button>

              {expanded.financing && (
                <div className="cf-subsection-body">
                  {renderLineItems(financing)}
                </div>
              )}

            </div>

          </div>

          <TotalRow
            label="Net Cash from Financing Activities"
            value={financingCashFlow}
          />

        </section>

        {/* ===================================================
            NET CASH
            =================================================== */}

        <div className="cf-grand-total">

          <div className="cf-grand-left">

            <div className="cf-grand-icon">
              ₹
            </div>

            <div>

              <div className="cf-grand-title">
                Net Increase in Cash
              </div>

              <div className="cf-grand-subtitle">
                Operating + Investing + Financing
              </div>

            </div>

          </div>

          <div
            className={`cf-grand-value ${getValueClass(
              netCashFlow
            )}`}
          >
            {formatCurrency(netCashFlow)}
          </div>

        </div>

      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="cf-footer">

        <span>
          Cash Flow Statement · {periodLabel}
        </span>

        <span>
          <strong>
            {netCashFlow >= 0
              ? "Positive cash position"
              : "Negative cash position"}
          </strong>
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  label,
  value,
  icon,
  type,
}) {
  const number = Number(value || 0);

  const formatted = Math.abs(number).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  return (
    <div className={`cf-summary-card ${type}`}>

      <div className="cf-summary-top">

        <span className="cf-summary-label">
          {label}
        </span>

        <div className="cf-summary-icon">
          {icon}
        </div>

      </div>

      <div
        className={`cf-summary-value ${
          number < 0
            ? "negative"
            : number > 0
            ? "positive"
            : "neutral"
        }`}
      >
        {number < 0
          ? `₹(${formatted})`
          : `₹${formatted}`}
      </div>

      <div className="cf-summary-footer">
        Cash movement
      </div>

    </div>
  );
}

/* =========================================================
   SECTION HEADER
   ========================================================= */

function SectionHeader({
  title,
  subtitle,
  value,
  type,
}) {
  const number = Number(value || 0);

  return (
    <div className="cf-section-header">

      <div className="cf-section-heading">

        <div className={`cf-section-icon ${type}`}>
          {type === "operating"
            ? "O"
            : type === "investing"
            ? "I"
            : "F"}
        </div>

        <div>

          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>

        </div>

      </div>

      <div className="cf-section-total">

        <span>
          Net
        </span>

        <strong
          className={
            number < 0
              ? "negative"
              : "positive"
          }
        >
          {number < 0
            ? `₹(${Math.abs(number).toLocaleString(
                "en-IN"
              )})`
            : `₹${number.toLocaleString(
                "en-IN"
              )}`}
        </strong>

      </div>

    </div>
  );
}

/* =========================================================
   TOTAL ROW
   ========================================================= */

function TotalRow({
  label,
  value,
}) {
  const number = Number(value || 0);

  return (
    <div className="cf-total-row">

      <span>
        {label}
      </span>

      <strong
        className={
          number < 0
            ? "negative"
            : number > 0
            ? "positive"
            : "neutral"
        }
      >
        {number < 0
          ? `₹(${Math.abs(number).toLocaleString(
              "en-IN"
            )})`
          : `₹${number.toLocaleString(
              "en-IN"
            )}`}
      </strong>

    </div>
  );
}