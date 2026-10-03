import { useEffect, useMemo, useState } from "react";
import { getTrialBalance } from "../../services/api";

import "./TrialBalance.css";

function BalanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tb-title-icon-svg">
      <path
        d="M4 19h16M6 19V7M18 19V7M3 7h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7 12 3l5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11h3M16 11h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tb-button-icon">
      <path
        d="M12 3v11M8 10l4 4 4-4M5 19h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tb-button-icon">
      <path
        d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 14h10v7H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tb-button-icon">
      <path
        d="M20 11a8 8 0 0 0-14.7-4L4 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 5v4h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8 8 0 0 0 14.7 4L20 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 19v-4h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tb-input-icon">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 3v4M16 3v4M4 9h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="tb-search-icon">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KpiIcon({ type }) {
  if (type === "accounts") {
    return (
      <span className="tb-kpi-icon tb-kpi-blue">
        <svg viewBox="0 0 24 24">
          <path
            d="M5 20V8l7-5 7 5v12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9 20v-5h6v5M3 20h18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  if (type === "debit") {
    return (
      <span className="tb-kpi-icon tb-kpi-green">
        <svg viewBox="0 0 24 24">
          <path
            d="M5 17 17 5M9 5h8v8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (type === "credit") {
    return (
      <span className="tb-kpi-icon tb-kpi-red">
        <svg viewBox="0 0 24 24">
          <path
            d="M5 7 17 19M9 19h8v-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="tb-kpi-icon tb-kpi-purple">
      <svg viewBox="0 0 24 24">
        <path
          d="M12 4v16M7 7h10M7 17h10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M7 7 4 13h6L7 7ZM17 7l-3 6h6l-3-6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function AccountIcon({ type }) {
  const normalized = String(type || "").toLowerCase();

  let iconClass = "tb-account-blue";

  if (
    normalized.includes("income") ||
    normalized.includes("revenue")
  ) {
    iconClass = "tb-account-purple";
  } else if (
    normalized.includes("expense")
  ) {
    iconClass = "tb-account-orange";
  } else if (
    normalized.includes("liabil")
  ) {
    iconClass = "tb-account-red";
  } else if (
    normalized.includes("equity") ||
    normalized.includes("capital")
  ) {
    iconClass = "tb-account-green";
  } else if (
    normalized.includes("contra")
  ) {
    iconClass = "tb-account-gray";
  }

  return (
    <span className={`tb-account-icon ${iconClass}`}>
      <svg viewBox="0 0 24 24">
        <path
          d="M5 20V9l7-5 7 5v11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9 20v-6h6v6M3 20h18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function TrialBalance() {
  const [data, setData] = useState({
    accounts: [],
    total_debit: 0,
    total_credit: 0,
  });

  const [loading, setLoading] = useState(true);

  const [asOfDate, setAsOfDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadTrialBalance = async () => {
    try {
      setLoading(true);

      const result = await getTrialBalance();

      setData({
        accounts: result?.accounts || [],
        total_debit: Number(result?.total_debit || 0),
        total_credit: Number(result?.total_credit || 0),
      });
    } catch (error) {
      console.error(
        "Trial balance loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrialBalance();
  }, []);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not selected";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const filteredAccounts = useMemo(() => {
    if (!appliedSearch.trim()) {
      return data.accounts;
    }

    const search = appliedSearch
      .trim()
      .toLowerCase();

    return data.accounts.filter((account) => {
      return [
        account.name,
        account.type,
        account.group_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [data.accounts, appliedSearch]);

  const difference = Math.abs(
    Number(data.total_debit || 0) -
    Number(data.total_credit || 0)
  );

  const isBalanced = difference < 0.01;

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAccounts.length / rowsPerPage
    )
  );

  const paginatedAccounts =
    filteredAccounts.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

  const handleSearch = () => {
    setAppliedSearch(searchText);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchText("");
    setAppliedSearch("");
    setAsOfDate("");
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (!filteredAccounts.length) return;

    const headers = [
      "Account",
      "Type",
      "Debit",
      "Credit",
    ];

    const rows = filteredAccounts.map(
      (account) => [
        account.name || "",
        account.type || "",
        Number(account.debit || 0).toFixed(2),
        Number(account.credit || 0).toFixed(2),
      ]
    );

    rows.push([
      "Total",
      "",
      Number(data.total_debit || 0).toFixed(2),
      Number(data.total_credit || 0).toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "trial-balance.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  const visiblePages = [];

  if (totalPages <= 5) {
    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      visiblePages.push(i);
    }
  } else {
    visiblePages.push(1);

    if (currentPage > 3) {
      visiblePages.push("...");
    }

    const start =
      Math.max(
        2,
        currentPage - 1
      );

    const end =
      Math.min(
        totalPages - 1,
        currentPage + 1
      );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      visiblePages.push(i);
    }

    if (
      currentPage <
      totalPages - 2
    ) {
      visiblePages.push("...");
    }

    visiblePages.push(
      totalPages
    );
  }

  return (
    <div className="trial-balance-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="tb-page-header">

        <div className="tb-breadcrumb">
          <span>Accounting</span>
          <span className="tb-breadcrumb-arrow">
            ›
          </span>
          <strong>
            Trial Balance
          </strong>
        </div>

        <div className="tb-header-main">

          <div className="tb-title-wrapper">

            <div className="tb-title-icon">
              <BalanceIcon />
            </div>

            <div>
              <h1>
                Trial Balance
              </h1>

              <p>
                Summary of debit and credit balances across all ledger accounts
              </p>
            </div>

          </div>

          <div className="tb-header-actions">

            <button
              className="tb-secondary-button"
              onClick={exportCSV}
            >
              <DownloadIcon />
              Export
            </button>

            <button
              className="tb-secondary-button"
              onClick={handlePrint}
            >
              <PrintIcon />
              Print
            </button>

            <button
              className="tb-primary-button"
              onClick={loadTrialBalance}
            >
              <RefreshIcon />
              Refresh
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          FILTER PANEL
      ================================================= */}

      <section className="tb-filter-card">

        <div className="tb-filter-field">

          <label>
            As of Date
          </label>

          <div className="tb-date-wrapper">

            <CalendarIcon />

            <input
              type="date"
              value={asOfDate}
              onChange={(e) =>
                setAsOfDate(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="tb-filter-field tb-search-field">

          <label>
            Search Account
          </label>

          <div className="tb-search-wrapper">

            <SearchIcon />

            <input
              type="text"
              placeholder="Search by account or account type..."
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  handleSearch();
                }
              }}
            />

          </div>

        </div>

        <div className="tb-filter-actions">

          <button
            className="tb-apply-button"
            onClick={handleSearch}
          >
            Apply Filters
          </button>

          <button
            className="tb-clear-button"
            onClick={handleClear}
          >
            Clear
          </button>

        </div>

      </section>

      {/* =================================================
          BALANCE STATUS
      ================================================= */}

      <div
        className={
          `tb-status-banner ${
            isBalanced
              ? "tb-status-balanced"
              : "tb-status-unbalanced"
          }`
        }
      >

        <div className="tb-status-left">

          <span className="tb-status-icon">
            {isBalanced ? "✓" : "!"}
          </span>

          <div>
            <strong>
              {isBalanced
                ? "Trial Balance is Balanced"
                : "Trial Balance is Not Balanced"}
            </strong>

            <span>
              {isBalanced
                ? "Total debit and credit balances are equal."
                : "There is a difference between total debit and credit balances."}
            </span>
          </div>

        </div>

        <div className="tb-status-difference">
          Difference
          <strong>
            {formatCurrency(
              difference
            )}
          </strong>
        </div>

      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="tb-kpi-grid">

        <div className="tb-kpi-card">

          <KpiIcon
            type="accounts"
          />

          <div className="tb-kpi-content">

            <span className="tb-kpi-label">
              Accounts
            </span>

            <strong>
              {data.accounts.length}
            </strong>

            <small>
              Ledger accounts
            </small>

          </div>

        </div>

        <div className="tb-kpi-card">

          <KpiIcon
            type="debit"
          />

          <div className="tb-kpi-content">

            <span className="tb-kpi-label">
              Total Debit
            </span>

            <strong>
              {formatCurrency(
                data.total_debit
              )}
            </strong>

            <small>
              Total debit balance
            </small>

          </div>

        </div>

        <div className="tb-kpi-card">

          <KpiIcon
            type="credit"
          />

          <div className="tb-kpi-content">

            <span className="tb-kpi-label">
              Total Credit
            </span>

            <strong>
              {formatCurrency(
                data.total_credit
              )}
            </strong>

            <small>
              Total credit balance
            </small>

          </div>

        </div>

        <div className="tb-kpi-card">

          <KpiIcon
            type="balance"
          />

          <div className="tb-kpi-content">

            <span className="tb-kpi-label">
              Difference
            </span>

            <strong>
              {formatCurrency(
                difference
              )}
            </strong>

            <small>
              {isBalanced
                ? "Books are balanced"
                : "Balance variance"}
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          TABLE
      ================================================= */}

      <section className="tb-table-card">

        <div className="tb-table-header">

          <div>

            <h2>
              Trial Balance
            </h2>

            <p>
              {asOfDate
                ? `Account balances as of ${formatDate(
                    asOfDate
                  )}`
                : "Current debit and credit balances across all accounts"}
            </p>

          </div>

          <span className="tb-account-badge">
            {filteredAccounts.length} accounts
          </span>

        </div>

        <div className="tb-table-container">

          <table className="tb-table">

            <thead>

              <tr>

                <th>
                  Account
                </th>

                <th>
                  Type
                </th>

                <th className="tb-align-right">
                  Debit
                </th>

                <th className="tb-align-right">
                  Credit
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="4"
                    className="tb-empty-cell"
                  >

                    <div className="tb-loader">

                      <div className="tb-spinner"></div>

                      Loading trial balance...

                    </div>

                  </td>

                </tr>

              ) : paginatedAccounts.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="tb-empty-cell"
                  >

                    <div className="tb-empty-state">

                      <div className="tb-empty-icon">
                        <BalanceIcon />
                      </div>

                      <strong>
                        No accounts found
                      </strong>

                      <span>
                        Try changing your search criteria.
                      </span>

                    </div>

                  </td>

                </tr>

              ) : (

                paginatedAccounts.map(
                  (account) => {

                    const debit =
                      Number(
                        account.debit || 0
                      );

                    const credit =
                      Number(
                        account.credit || 0
                      );

                    return (
                      <tr
                        key={account.id}
                        className="tb-table-row"
                      >

                        <td>

                          <div className="tb-account-cell">

                            <AccountIcon
                              type={
                                account.type
                              }
                            />

                            <div>

                              <span className="tb-account-name">
                                {account.name}
                              </span>

                              {account.group_name && (
                                <span className="tb-account-group">
                                  {account.group_name}
                                </span>
                              )}

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="tb-type-badge">
                            {account.type ||
                              "Unclassified"}
                          </span>

                        </td>

                        <td className="tb-align-right">

                          {debit > 0 ? (

                            <span className="tb-amount-pill tb-debit-pill">
                              {formatCurrency(
                                debit
                              )}
                            </span>

                          ) : (

                            <span className="tb-dash">
                              —
                            </span>

                          )}

                        </td>

                        <td className="tb-align-right">

                          {credit > 0 ? (

                            <span className="tb-amount-pill tb-credit-pill">
                              {formatCurrency(
                                credit
                              )}
                            </span>

                          ) : (

                            <span className="tb-dash">
                              —
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

            {!loading &&
              paginatedAccounts.length > 0 && (

                <tfoot>

                  <tr>

                    <td colSpan="2">

                      <strong>
                        Total
                      </strong>

                    </td>

                    <td className="tb-align-right">

                      <strong className="tb-total-debit">
                        {formatCurrency(
                          data.total_debit
                        )}
                      </strong>

                    </td>

                    <td className="tb-align-right">

                      <strong className="tb-total-credit">
                        {formatCurrency(
                          data.total_credit
                        )}
                      </strong>

                    </td>

                  </tr>

                </tfoot>

              )}

          </table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          filteredAccounts.length > 0 && (

            <div className="tb-pagination">

              <span className="tb-pagination-info">

                Showing{" "}

                <strong>
                  {Math.min(
                    (currentPage - 1) *
                      rowsPerPage +
                      1,
                    filteredAccounts.length
                  )}
                </strong>

                {" "}to{" "}

                <strong>
                  {Math.min(
                    currentPage *
                      rowsPerPage,
                    filteredAccounts.length
                  )}
                </strong>

                {" "}of{" "}

                <strong>
                  {filteredAccounts.length}
                </strong>

                {" "}accounts

              </span>

              <div className="tb-pagination-controls">

                <button
                  className="tb-page-arrow"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    goToPage(
                      currentPage - 1
                    )
                  }
                >
                  ‹
                </button>

                {visiblePages.map(
                  (page, index) =>
                    page === "..." ? (

                      <span
                        key={`ellipsis-${index}`}
                        className="tb-page-ellipsis"
                      >
                        ...
                      </span>

                    ) : (

                      <button
                        key={page}
                        className={
                          `tb-page-number ${
                            currentPage ===
                            page
                              ? "active"
                              : ""
                          }`
                        }
                        onClick={() =>
                          goToPage(page)
                        }
                      >
                        {page}
                      </button>

                    )
                )}

                <button
                  className="tb-page-arrow"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    goToPage(
                      currentPage + 1
                    )
                  }
                >
                  ›
                </button>

                <select
                  className="tb-page-size"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(
                      Number(
                        e.target.value
                      )
                    );

                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>
                    10 / page
                  </option>

                  <option value={20}>
                    20 / page
                  </option>

                  <option value={50}>
                    50 / page
                  </option>

                  <option value={100}>
                    100 / page
                  </option>

                </select>

              </div>

            </div>

          )}

      </section>

    </div>
  );
}