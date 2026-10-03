import { useEffect, useState } from "react";
import {
  getPnl,
  getBalanceSheet,
  getCashFlow,
} from "../../services/api";

import { Link } from "react-router-dom";


function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}


function MetricCard({
  title,
  value,
  subtitle,
  icon,
  positive,
}) {
  return (
    <div className="bg-white border border-[#E4E9E7] rounded-xl p-5 hover:shadow-sm transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-semibold text-[#17211D] mt-2">
            ₹{formatMoney(value)}
          </p>

        </div>

        <div className="w-9 h-9 rounded-lg bg-[#F0F7F4] text-[#0B6B55] flex items-center justify-center text-sm">
          {icon}
        </div>

      </div>

      {subtitle && (
        <div className="mt-3 flex items-center gap-1">

          <span
            className={
              positive === false
                ? "text-xs text-gray-400"
                : "text-xs text-[#0B6B55]"
            }
          >
            {subtitle}
          </span>

        </div>
      )}

    </div>
  );
}


function FinancialRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div
      className={
        strong
          ? "flex justify-between items-center py-3 border-t border-gray-100"
          : "flex justify-between items-center py-2"
      }
    >

      <span
        className={
          strong
            ? "text-sm font-semibold text-[#17211D]"
            : "text-sm text-gray-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-sm font-semibold text-[#17211D]"
            : "text-sm text-gray-700"
        }
      >
        ₹{formatMoney(value)}
      </span>

    </div>
  );
}


function QuickAction({
  title,
  description,
  to,
  icon,
}) {
  return (
    <Link
      to={to}
      className="
        group
        bg-white
        border border-[#E4E9E7]
        rounded-xl
        p-4
        hover:border-[#0B6B55]
        hover:shadow-sm
        transition
      "
    >

      <div className="flex items-start gap-3">

        <div className="
          w-9
          h-9
          rounded-lg
          bg-[#F0F7F4]
          text-[#0B6B55]
          flex
          items-center
          justify-center
          text-sm
          flex-shrink-0
        ">
          {icon}
        </div>

        <div>

          <div className="text-sm font-medium text-[#17211D] group-hover:text-[#0B6B55]">
            {title}
          </div>

          <div className="text-xs text-gray-400 mt-1 leading-5">
            {description}
          </div>

        </div>

      </div>

    </Link>
  );
}


export default function Accounting() {

  const [pnl, setPnl] = useState(null);
  const [balance, setBalance] = useState(null);
  const [cashflow, setCashflow] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadAccounting();
  }, []);


  const loadAccounting = async () => {

    try {

      setLoading(true);

      const [
        pnlData,
        balanceData,
        cashflowData,
      ] = await Promise.all([
        getPnl(),
        getBalanceSheet(),
        getCashFlow(),
      ]);

      console.log("P&L:", pnlData);
      console.log("Balance Sheet:", balanceData);
      console.log("Cash Flow:", cashflowData);

      setPnl(pnlData);
      setBalance(balanceData);
      setCashflow(cashflowData);

    } catch (error) {

      console.error(
        "Accounting dashboard error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  const summary = pnl?.summary || {};
  const bs = balance?.summary || {};
  const cf = cashflow?.summary || {};


  /*
   * Depending on your backend, cash flow may have
   * different field names. These fallbacks prevent
   * the UI from breaking.
   */

  const cash =
    cf.closing_cash ??
    cf.cash_balance ??
    cf.net_cash ??
    0;


  const totalAssets =
    bs.total_assets ??
    (
      Number(bs.current_assets || 0) +
      Number(bs.non_current_assets || 0)
    );


  const totalLiabilities =
    Number(bs.current_liabilities || 0) +
    Number(bs.non_current_liabilities || 0);


  const equity = bs.equity || 0;


  return (

    <div className="space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2">

            <h1 className="text-xl font-semibold text-[#17211D]">
              Accounting Overview
            </h1>

            <span className="
              px-2
              py-1
              rounded-full
              bg-[#F0F7F4]
              text-[#0B6B55]
              text-[10px]
              font-medium
            ">
              Current Period
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-1">
            Financial performance, position and accounting activity
          </p>

        </div>


        <Link
          to="/journal"
          className="
            bg-[#0B6B55]
            hover:bg-[#095844]
            text-white
            px-4
            py-2.5
            rounded-lg
            text-sm
            font-medium
            transition
          "
        >
          + New Journal Entry
        </Link>

      </div>


      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        <MetricCard
          title="Revenue"
          value={summary.total_income}
          subtitle="Total income"
          icon="↗"
        />

        <MetricCard
          title="Operating Expenses"
          value={summary.operating_expense}
          subtitle="Operating costs"
          icon="−"
          positive={false}
        />

        <MetricCard
          title="Net Profit"
          value={summary.profit}
          subtitle={
            Number(summary.profit || 0) >= 0
              ? "Positive earnings"
              : "Loss position"
          }
          icon="₹"
          positive={
            Number(summary.profit || 0) >= 0
          }
        />

        <MetricCard
          title="Total Assets"
          value={totalAssets}
          subtitle="Current + non-current"
          icon="◆"
        />

      </div>


      {/* ================================================= */}
      {/* MAIN FINANCIAL AREA */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-5
      ">


        {/* =============================================== */}
        {/* PROFIT & LOSS */}
        {/* =============================================== */}

        <div className="
          xl:col-span-2
          bg-white
          border border-[#E4E9E7]
          rounded-xl
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b border-gray-100
            flex
            items-center
            justify-between
          ">

            <div>

              <h2 className="text-sm font-semibold text-[#17211D]">
                Profit & Loss
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Current accounting period
              </p>

            </div>

            <Link
              to="/pnl"
              className="text-xs text-[#0B6B55] hover:underline"
            >
              View statement →
            </Link>

          </div>


          <div className="p-5">

            <FinancialRow
              label="Operating Income"
              value={summary.operating_income}
            />

            <FinancialRow
              label="Non-operating Income"
              value={summary.non_operating_income}
            />

            <FinancialRow
              label="Operating Expenses"
              value={summary.operating_expense}
            />

            <FinancialRow
              label="Non-operating Expenses"
              value={summary.non_operating_expense}
            />

            <FinancialRow
              label="Net Profit"
              value={summary.profit}
              strong
            />

          </div>

        </div>


        {/* =============================================== */}
        {/* FINANCIAL POSITION */}
        {/* =============================================== */}

        <div className="
          bg-white
          border border-[#E4E9E7]
          rounded-xl
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b border-gray-100
          ">

            <h2 className="text-sm font-semibold text-[#17211D]">
              Financial Position
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Balance sheet snapshot
            </p>

          </div>


          <div className="p-5">

            <FinancialRow
              label="Current Assets"
              value={bs.current_assets}
            />

            <FinancialRow
              label="Non-current Assets"
              value={bs.non_current_assets}
            />

            <FinancialRow
              label="Current Liabilities"
              value={bs.current_liabilities}
            />

            <FinancialRow
              label="Non-current Liabilities"
              value={bs.non_current_liabilities}
            />

            <FinancialRow
              label="Equity"
              value={equity}
              strong
            />

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* SECONDARY FINANCIAL SUMMARY */}
      {/* ================================================= */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
      ">


        {/* CASH POSITION */}

        <div className="
          bg-white
          border border-[#E4E9E7]
          rounded-xl
          p-5
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-gray-500">
                Cash Position
              </p>

              <p className="text-xl font-semibold text-[#17211D] mt-2">
                ₹{formatMoney(cash)}
              </p>

            </div>

            <div className="
              w-9
              h-9
              rounded-lg
              bg-[#F0F7F4]
              text-[#0B6B55]
              flex
              items-center
              justify-center
            ">
              $
            </div>

          </div>

          <p className="text-xs text-gray-400 mt-3">
            Based on latest cash flow data
          </p>

        </div>


        {/* LIABILITIES */}

        <div className="
          bg-white
          border border-[#E4E9E7]
          rounded-xl
          p-5
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-gray-500">
                Total Liabilities
              </p>

              <p className="text-xl font-semibold text-[#17211D] mt-2">
                ₹{formatMoney(totalLiabilities)}
              </p>

            </div>

            <div className="
              w-9
              h-9
              rounded-lg
              bg-[#F8F4F1]
              text-gray-600
              flex
              items-center
              justify-center
            ">
              L
            </div>

          </div>

          <p className="text-xs text-gray-400 mt-3">
            Current + non-current liabilities
          </p>

        </div>


        {/* EQUITY */}

        <div className="
          bg-white
          border border-[#E4E9E7]
          rounded-xl
          p-5
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-gray-500">
                Total Equity
              </p>

              <p className="text-xl font-semibold text-[#17211D] mt-2">
                ₹{formatMoney(equity)}
              </p>

            </div>

            <div className="
              w-9
              h-9
              rounded-lg
              bg-[#F0F7F4]
              text-[#0B6B55]
              flex
              items-center
              justify-center
            ">
              E
            </div>

          </div>

          <p className="text-xs text-gray-400 mt-3">
            Share capital and retained earnings
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* ACCOUNTING ACTIONS */}
      {/* ================================================= */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <div>

            <h2 className="text-sm font-semibold text-[#17211D]">
              Accounting Workspace
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Manage transactions, accounts and financial reports
            </p>

          </div>

        </div>


        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          <QuickAction
            title="Journal Entry"
            description="Record a balanced double-entry transaction"
            to="/journal"
            icon="+"
          />

          <QuickAction
            title="Chart of Accounts"
            description="Manage accounts and accounting classifications"
            to="/chart-of-accounts"
            icon="≡"
          />

          <QuickAction
            title="General Ledger"
            description="Review account-wise transaction activity"
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


         {/* ================================================= */}
      {/* FOOTER STATUS */}
      {/* ================================================= */}

      <div
        className="
          bg-[#F8FAF9]
          border border-[#E4E9E7]
          rounded-xl
          px-5
          py-3
          flex
          items-center
          justify-between
        "
      >
        <div className="flex items-center gap-2">

          <span
            className="
              w-2
              h-2
              rounded-full
              bg-[#0B6B55]
            "
          />

          <span className="text-xs text-gray-500">
            Accounting data synchronized
          </span>

        </div>

        <span className="text-xs text-gray-400">
          {loading
            ? "Updating..."
            : "Updated from accounting records"}
        </span>

      </div>

    </div>
  );
}