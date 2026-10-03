import React, { useEffect, useState } from "react";
import { getAccountingOverview } from "../../services/api";
import { Link } from "react-router-dom";
import "./Overview.css";


function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}


/* =========================================================
   KPI CARD
   ========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  variant = "green",
}) {
  return (
    <div className="ao-kpi-card">

      <div className="ao-kpi-top">

        <span className="ao-kpi-title">
          {title}
        </span>

        <div className={`ao-kpi-icon ${variant}`}>
          {icon}
        </div>

      </div>

      <div className="ao-kpi-value">
        {formatMoney(value)}
      </div>

      <div className="ao-kpi-subtitle">
        {subtitle}
      </div>

    </div>
  );
}


/* =========================================================
   FINANCIAL ROW
   ========================================================= */

function FinancialRow({
  label,
  description,
  value,
  negative = false,
}) {
  return (
    <div className="ao-financial-row">

      <div className="ao-financial-label">

        <div className="ao-financial-name">
          {label}
        </div>

        {description && (
          <div className="ao-financial-description">
            {description}
          </div>
        )}

      </div>

      <div
        className={`ao-financial-value ${
          negative ? "negative" : ""
        }`}
      >
        {formatMoney(value)}
      </div>

    </div>
  );
}


/* =========================================================
   QUICK ACTION
   ========================================================= */

function QuickAction({
  title,
  description,
  to,
  icon,
}) {
  return (
    <Link
      to={to}
      className="ao-action"
    >

      <div className="ao-action-icon">
        {icon}
      </div>

      <div className="ao-action-content">

        <div className="ao-action-title">
          {title}
        </div>

        <div className="ao-action-description">
          {description}
        </div>

      </div>

      <div className="ao-action-arrow">
        →
      </div>

    </Link>
  );
}


/* =========================================================
   OVERVIEW
   ========================================================= */

export default function Overview() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {

    try {

      setLoading(true);

      const result = await getAccountingOverview();

      console.log("ACCOUNTING OVERVIEW:", result);

      setData(result);

    } catch (error) {

      console.error(
        "Accounting overview loading error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadOverview();
  }, []);


  const summary = data?.summary || {};

  const recentActivity =
    data?.recent_activity || [];

  const accounts =
    data?.accounts || [];


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (
      <div className="ao-page">

        <div className="ao-loading">

          <div className="ao-loading-spinner" />

          <span>
            Loading accounting overview...
          </span>

        </div>

      </div>
    );

  }


  /* =====================================================
     CALCULATIONS
     ===================================================== */

  const revenue =
    Number(summary.revenue || 0);

  const expenses =
    Number(summary.expenses || 0);

  const netProfit =
    Number(
      summary.net_profit ??
      revenue - expenses
    );

  const assets =
    Number(summary.assets || 0);

  const liabilities =
    Number(summary.liabilities || 0);

  const equity =
    Number(summary.equity || 0);


  return (

    <div className="ao-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="ao-page-header">

        <div>

          <div className="ao-title-row">

            <h1>
              Accounting Overview
            </h1>

            <span className="ao-period-badge">
              Current Period
            </span>

          </div>

          <p>
            Financial performance, position and accounting activity
          </p>

        </div>


        <Link
          to="/journal"
          className="ao-primary-button"
        >
          <span>+</span>
          New Journal Entry
        </Link>

      </div>


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="ao-kpi-grid">

        <MetricCard
          title="Revenue"
          value={revenue}
          subtitle="Current accounting period"
          icon="↗"
          variant="green"
        />

        <MetricCard
          title="Operating Expenses"
          value={expenses}
          subtitle="Total recorded expenses"
          icon="−"
          variant="orange"
        />

        <MetricCard
          title="Net Profit"
          value={netProfit}
          subtitle={
            netProfit >= 0
              ? "Profit after expenses"
              : "Loss position"
          }
          icon="₹"
          variant="green"
        />

        <MetricCard
          title="Total Assets"
          value={assets}
          subtitle="Current + non-current"
          icon="◆"
          variant="blue"
        />

      </div>


      {/* =================================================
          MAIN FINANCIAL GRID
      ================================================= */}

      <div className="ao-main-grid">


        {/* =================================================
            PROFIT & LOSS
        ================================================= */}

        <div className="ao-card ao-pnl-card">

          <div className="ao-card-header">

            <div>

              <h2>
                Profit & Loss
              </h2>

              <p>
                Current period performance
              </p>

            </div>

            <Link to="/pnl">
              View statement →
            </Link>

          </div>


          <div className="ao-card-body">

            <FinancialRow
              label="Operating Income"
              description="Revenue generated"
              value={revenue}
            />

            <div className="ao-divider" />

            <FinancialRow
              label="Operating Expenses"
              description="Expenses recorded"
              value={expenses}
              negative
            />

            <div className="ao-divider" />

            <div className="ao-profit-row">

              <div>

                <div className="ao-profit-title">
                  Net Profit
                </div>

                <div className="ao-profit-description">
                  Revenue − Expenses
                </div>

              </div>

              <div
                className={`ao-profit-value ${
                  netProfit < 0 ? "negative" : ""
                }`}
              >
                {formatMoney(netProfit)}
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            FINANCIAL POSITION
        ================================================= */}

        <div className="ao-card">

          <div className="ao-card-header">

            <div>

              <h2>
                Financial Position
              </h2>

              <p>
                Balance sheet snapshot
              </p>

            </div>

            <Link to="/balance-sheet">
              View →
            </Link>

          </div>


          <div className="ao-position-body">
          <div className="ao-position-row">

            <span>
              Assets
            </span>

            <strong>
              {formatMoney(assets)}
            </strong>

          </div>


          <div className="ao-position-row">

            <span>
              Liabilities
            </span>

            <strong>
              {formatMoney(liabilities)}
            </strong>

          </div>


          <div className="ao-position-row">

            <span>
              Equity
            </span>

            <strong>
              {formatMoney(equity)}
            </strong>

          </div>


          <div className="ao-position-row">

            <span>
              Current Period Profit / (Loss)
            </span>

            <strong>
              {formatMoney(netProfit)}
            </strong>

          </div>


          <div className="ao-equation">

            <span>
              Liabilities + Equity + Current P&L
            </span>

            <strong>
              {formatMoney(
                liabilities +
                equity +
                netProfit
              )}
            </strong>

          </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ACTIVITY GRID
      ================================================= */}

      <div className="ao-activity-grid">


        {/* =================================================
            RECENT JOURNAL ACTIVITY
        ================================================= */}

        <div className="ao-card ao-activity-card">

          <div className="ao-card-header">

            <div>

              <h2>
                Recent Journal Activity
              </h2>

              <p>
                Latest posted accounting transactions
              </p>

            </div>

            <Link to="/journal">
              New Entry
            </Link>

          </div>


          <div className="ao-journal-list">

            {recentActivity.length === 0 ? (

              <div className="ao-empty">

                <div className="ao-empty-icon">
                  +
                </div>

                <div className="ao-empty-title">
                  No journal entries posted yet
                </div>

                <div className="ao-empty-description">
                  Start recording your accounting transactions.
                </div>

                <Link to="/journal">
                  Create your first journal →
                </Link>

              </div>

            ) : (

              recentActivity
                .slice(0, 6)
                .map((entry) => (

                  <div
                    key={entry.id}
                    className="ao-journal-row"
                  >

                    <div className="ao-journal-left">

                      <div className="ao-journal-icon">
                        JV
                      </div>

                      <div>

                        <div className="ao-journal-title">
                          {entry.description}
                        </div>

                        <div className="ao-journal-meta">

                          JV-
                          {String(entry.id).padStart(5, "0")}

                          <span>•</span>

                          {entry.date
                            ? new Date(
                                entry.date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}

                        </div>

                      </div>

                    </div>


                    <div className="ao-journal-right">

                      <div className="ao-journal-amount">
                        {formatMoney(entry.debit)}
                      </div>

                      <div className="ao-balanced">
                        Balanced
                      </div>

                    </div>

                  </div>

                ))

            )}

          </div>

        </div>


        {/* =================================================
            ACCOUNTING ACTIONS
        ================================================= */}

        <div className="ao-card">

          <div className="ao-card-header">

            <div>

              <h2>
                Accounting Actions
              </h2>

              <p>
                Quick access
              </p>

            </div>

          </div>


          <div className="ao-actions">

            <QuickAction
              title="Journal Entry"
              description="Record a double-entry transaction"
              to="/journal"
              icon="+"
            />

            <QuickAction
              title="Chart of Accounts"
              description="Manage your account structure"
              to="/chart-of-accounts"
              icon="≡"
            />

            <QuickAction
              title="General Ledger"
              description="Review account-level activity"
              to="/general-ledger"
              icon="▤"
            />

            <QuickAction
              title="Trial Balance"
              description="Verify debit and credit balances"
              to="/trial-balance"
              icon="✓"
            />

          </div>

        </div>

      </div>


      {/* =================================================
          ACCOUNT SNAPSHOT
      ================================================= */}

      <div className="ao-card ao-snapshot-card">

        <div className="ao-card-header">

          <div>

            <h2>
              Account Snapshot
            </h2>

            <p>
              Current balances by account
            </p>

          </div>

          <Link to="/chart-of-accounts">
            View all accounts →
          </Link>

        </div>


        <div className="ao-table-wrapper">

          <table className="ao-table">

            <thead>

              <tr>

                <th>
                  Account
                </th>

                <th>
                  Type
                </th>

                <th>
                  Group
                </th>

                <th className="right">
                  Debit
                </th>

                <th className="right">
                  Credit
                </th>

                <th className="right">
                  Balance
                </th>

              </tr>

            </thead>


            <tbody>

              {accounts.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="ao-table-empty"
                  >
                    No account activity available.
                  </td>

                </tr>

              ) : (

                accounts
                  .slice(0, 10)
                  .map((account) => (

                    <tr key={account.id}>

                      <td>

                        <div className="ao-account-name">
                          {account.name}
                        </div>

                      </td>

                      <td>

                        <span className="ao-type-badge">
                          {account.type}
                        </span>

                      </td>

                      <td className="ao-muted">
                        {account.group_name || "—"}
                      </td>

                      <td className="right">
                        {formatMoney(account.debit)}
                      </td>

                      <td className="right">
                        {formatMoney(account.credit)}
                      </td>

                      <td className="right ao-balance">
                        {formatMoney(
                          Math.abs(
                            Number(
                              account.balance || 0
                            )
                          )
                        )}
                      </td>

                    </tr>

                  ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          FOOTER STATUS
      ================================================= */}

      <div className="ao-status-bar">

        <div className="ao-status-left">

          <span className="ao-status-dot" />

          <span>
            Accounting data synchronized
          </span>

        </div>

        <span>
          Updated from accounting records
        </span>

      </div>

    </div>
  );
}