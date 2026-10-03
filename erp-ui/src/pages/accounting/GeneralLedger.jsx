import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccounts,
  getGeneralLedger,
} from "../../services/api";

import "./GeneralLedger.css";

function LedgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-title-icon-svg">
      <path
        d="M6 4.5A2.5 2.5 0 0 1 8.5 2H19v17.5A2.5 2.5 0 0 0 16.5 17H6V4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 17V19.5A2.5 2.5 0 0 0 8.5 22H19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 6h5M10 9h5M10 12h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-search-icon">
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-input-icon">
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

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-button-icon">
      <path
        d="M4 6h16M7 12h10M10 18h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-button-icon">
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
    <svg viewBox="0 0 24 24" className="gl-button-icon">
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-button-icon">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gl-button-icon">
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

function AccountIcon({ type }) {
  const normalized = String(type || "").toLowerCase();

  let iconClass = "gl-account-blue";

  if (
    normalized.includes("income") ||
    normalized.includes("revenue")
  ) {
    iconClass = "gl-account-purple";
  } else if (
    normalized.includes("expense")
  ) {
    iconClass = "gl-account-orange";
  } else if (
    normalized.includes("liabil")
  ) {
    iconClass = "gl-account-red";
  } else if (
    normalized.includes("equity") ||
    normalized.includes("capital")
  ) {
    iconClass = "gl-account-green";
  }

  return (
    <span className={`gl-account-icon ${iconClass}`}>
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

function KpiIcon({ type }) {
  if (type === "entries") {
    return (
      <span className="gl-kpi-icon gl-kpi-blue">
        <svg viewBox="0 0 24 24">
          <path
            d="M5 4h14v16H5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M8 8h8M8 12h8M8 16h5"
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
      <span className="gl-kpi-icon gl-kpi-green">
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
      <span className="gl-kpi-icon gl-kpi-red">
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
    <span className="gl-kpi-icon gl-kpi-purple">
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

export default function GeneralLedger() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    account: "",
    fromDate: "",
    toDate: "",
    searchText: "",
  });

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    try {
      setLoading(true);

      const [accountData, ledgerData] = await Promise.all([
        getAccounts(),
        getGeneralLedger(selectedAccount || ""),
      ]);

      setAccounts(accountData || []);
      setEntries(ledgerData || []);
    } catch (error) {
      console.error("General ledger loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFilters = async () => {
    try {
      setLoading(true);

      const data = await getGeneralLedger(selectedAccount || "");

      setEntries(data || []);

      setAppliedFilters({
        account: selectedAccount,
        fromDate,
        toDate,
        searchText,
      });

      setCurrentPage(1);
    } catch (error) {
      console.error("General ledger filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setSelectedAccount("");
    setFromDate("");
    setToDate("");
    setSearchText("");

    setAppliedFilters({
      account: "",
      fromDate: "",
      toDate: "",
      searchText: "",
    });

    setCurrentPage(1);

    try {
      setLoading(true);
      const data = await getGeneralLedger("");
      setEntries(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDateOnly = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
  };

  const getAccount = (accountId) => {
    return accounts.find(
      (account) => Number(account.id) === Number(accountId)
    );
  };

  const selectedAccountData = getAccount(appliedFilters.account);

  /*
   * Industry-style filtering:
   * - Account is filtered by backend
   * - Date/search filters are applied here
   */
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = getDateOnly(entry.date);

      if (
        appliedFilters.fromDate &&
        entryDate < appliedFilters.fromDate
      ) {
        return false;
      }

      if (
        appliedFilters.toDate &&
        entryDate > appliedFilters.toDate
      ) {
        return false;
      }

      if (appliedFilters.searchText) {
        const search = appliedFilters.searchText.toLowerCase();

        const searchableText = [
          entry.journal,
          entry.account,
          entry.description,
          entry.account_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [entries, appliedFilters]);

  /*
   * Opening balance:
   * Only meaningful when a single account is selected.
   */
  const openingBalance = useMemo(() => {
    if (!appliedFilters.account) return 0;

    const account = selectedAccountData;

    if (!account) return 0;

    let balance = 0;

    entries.forEach((entry) => {
      const entryDate = getDateOnly(entry.date);

      if (
        appliedFilters.fromDate &&
        entryDate >= appliedFilters.fromDate
      ) {
        return;
      }

      if (
        appliedFilters.searchText &&
        ![
          entry.journal,
          entry.account,
          entry.description,
          entry.account_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(appliedFilters.searchText.toLowerCase())
      ) {
        return;
      }

      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      if (account.normal_balance === "credit") {
        balance += credit - debit;
      } else {
        balance += debit - credit;
      }
    });

    return balance;
  }, [
    entries,
    appliedFilters,
    selectedAccountData,
  ]);

  const totalDebit = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.debit || 0),
    0
  );

  const totalCredit = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.credit || 0),
    0
  );

  /*
   * For All Accounts this is simply the net debit/credit movement.
   * For one account this represents the closing account balance.
   */
  const closingBalance = useMemo(() => {
    if (!appliedFilters.account) {
      return totalDebit - totalCredit;
    }

    const account = selectedAccountData;

    if (!account) {
      return 0;
    }

    let balance = openingBalance;

    filteredEntries.forEach((entry) => {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      if (account.normal_balance === "credit") {
        balance += credit - debit;
      } else {
        balance += debit - credit;
      }
    });

    return balance;
  }, [
    appliedFilters.account,
    selectedAccountData,
    openingBalance,
    filteredEntries,
    totalDebit,
    totalCredit,
  ]);

  /*
   * Running balances for selected account.
   */
  const entriesWithBalance = useMemo(() => {
    if (!appliedFilters.account) {
      return filteredEntries.map((entry) => ({
        ...entry,
        calculatedBalance: null,
      }));
    }

    const account = selectedAccountData;

    if (!account) {
      return filteredEntries.map((entry) => ({
        ...entry,
        calculatedBalance: null,
      }));
    }

    let running = openingBalance;

    return filteredEntries.map((entry) => {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      if (account.normal_balance === "credit") {
        running += credit - debit;
      } else {
        running += debit - credit;
      }

      return {
        ...entry,
        calculatedBalance: running,
      };
    });
  }, [
    filteredEntries,
    appliedFilters.account,
    selectedAccountData,
    openingBalance,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(entriesWithBalance.length / rowsPerPage)
  );

  const paginatedEntries = entriesWithBalance.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const balanceLabel = (value) => {
    if (value === null || value === undefined) {
      return "—";
    }

    if (Math.abs(value) < 0.005) {
      return "₹0.00";
    }

    const account = selectedAccountData;

    let suffix;

    if (account?.normal_balance === "credit") {
      suffix = value >= 0 ? "Cr" : "Dr";
    } else {
      suffix = value >= 0 ? "Dr" : "Cr";
    }

    return `${formatCurrency(Math.abs(value))} ${suffix}`;
  };

  const exportCSV = () => {
    if (!entriesWithBalance.length) return;

    const headers = [
      "Date",
      "Journal",
      "Account",
      "Description",
      "Debit",
      "Credit",
      "Balance",
    ];

    const rows = entriesWithBalance.map((entry) => [
      formatDate(entry.date),
      entry.journal || "",
      entry.account || "",
      entry.description || "",
      Number(entry.debit || 0).toFixed(2),
      Number(entry.credit || 0).toFixed(2),
      balanceLabel(entry.calculatedBalance),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "general-ledger.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const visiblePages = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      visiblePages.push(i);
    }
  } else {
    visiblePages.push(1);

    if (currentPage > 3) {
      visiblePages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    if (currentPage < totalPages - 2) {
      visiblePages.push("...");
    }

    visiblePages.push(totalPages);
  }

  return (
    <div className="general-ledger-page">

      {/* HEADER */}
      <div className="gl-page-header">

        <div className="gl-breadcrumb">
          <span>Accounting</span>
          <span className="gl-breadcrumb-arrow">›</span>
          <strong>General Ledger</strong>
        </div>

        <div className="gl-header-main">

          <div className="gl-title-wrapper">

            <div className="gl-title-icon">
              <LedgerIcon />
            </div>

            <div>
              <h1>General Ledger</h1>
              <p>
                Complete account-wise record of posted journal transactions
              </p>
            </div>

          </div>

          <div className="gl-header-actions">

            <button
              className="gl-secondary-button"
              onClick={exportCSV}
            >
              <DownloadIcon />
              Export
            </button>

            <button
              className="gl-secondary-button"
              onClick={handlePrint}
            >
              <PrintIcon />
              Print
            </button>

            <button
              className="gl-primary-button"
              onClick={() => navigate("/journal")}
            >
              <PlusIcon />
              New Journal
            </button>

          </div>

        </div>

      </div>

      {/* FILTER PANEL */}
      <section className="gl-filter-card">

        <div className="gl-filter-grid">

          <div className="gl-filter-field">

            <label>Account</label>

            <div className="gl-select-wrapper">

              <select
                value={selectedAccount}
                onChange={(e) =>
                  setSelectedAccount(e.target.value)
                }
              >
                <option value="">All Accounts</option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                ))}

              </select>

            </div>

          </div>

          <div className="gl-filter-field">

            <label>From Date</label>

            <div className="gl-date-wrapper">

              <CalendarIcon />

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
              />

            </div>

          </div>

          <div className="gl-filter-field">

            <label>To Date</label>

            <div className="gl-date-wrapper">

              <CalendarIcon />

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
              />

            </div>

          </div>

          <div className="gl-filter-field gl-search-field">

            <label>Search</label>

            <div className="gl-search-wrapper">

              <SearchIcon />

              <input
                type="text"
                placeholder="Search by journal, account or description..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
              />

            </div>

          </div>

          <div className="gl-filter-actions">

            <button
              className="gl-apply-button"
              onClick={handleApplyFilters}
            >
              <FilterIcon />
              Apply Filters
            </button>

            <button
              className="gl-clear-button"
              onClick={handleClearFilters}
            >
              <RefreshIcon />
              Clear
            </button>

          </div>

        </div>

      </section>

      {/* KPI CARDS */}
      <section className="gl-kpi-grid">

        <div className="gl-kpi-card">

          <KpiIcon type="entries" />

          <div className="gl-kpi-content">
            <span className="gl-kpi-label">
              Ledger Entries
            </span>

            <strong>
              {entriesWithBalance.length}
            </strong>

            <small>
              Posted journal lines
            </small>
          </div>

        </div>

        <div className="gl-kpi-card">

          <KpiIcon type="debit" />

          <div className="gl-kpi-content">
            <span className="gl-kpi-label">
              Total Debit
            </span>

            <strong>
              {formatCurrency(totalDebit)}
            </strong>

            <small>
              Total debit amount
            </small>
          </div>

        </div>

        <div className="gl-kpi-card">

          <KpiIcon type="credit" />

          <div className="gl-kpi-content">
            <span className="gl-kpi-label">
              Total Credit
            </span>

            <strong>
              {formatCurrency(totalCredit)}
            </strong>

            <small>
              Total credit amount
            </small>
          </div>

        </div>

        <div className="gl-kpi-card">

          <KpiIcon type="balance" />

          <div className="gl-kpi-content">

            <span className="gl-kpi-label">
              {appliedFilters.account
                ? "Closing Balance"
                : "Net Movement"}
            </span>

            <strong>
              {formatCurrency(Math.abs(closingBalance))}
            </strong>

            <small>
              {appliedFilters.account
                ? "Current account balance"
                : "Debit less credit"}
            </small>

          </div>

        </div>

      </section>

      {/* TABLE CARD */}
      <section className="gl-table-card">

        <div className="gl-table-header">

          <div>
            <h2>Ledger Entries</h2>

            <p>
              {appliedFilters.account
                ? `Showing transactions for ${
                    selectedAccountData?.name || "selected account"
                  }`
                : "Showing posted journal entries across all accounts"}
            </p>
          </div>

          <span className="gl-entry-badge">
            {entriesWithBalance.length} entries
          </span>

        </div>

        <div className="gl-table-container">

          <table className="gl-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Journal</th>
                <th>Account</th>
                <th>Description</th>
                <th className="gl-align-right">Debit</th>
                <th className="gl-align-right">Credit</th>
                <th className="gl-align-right">Balance</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="gl-empty-cell"
                  >
                    <div className="gl-loader">
                      <div className="gl-spinner"></div>
                      Loading ledger entries...
                    </div>
                  </td>
                </tr>

              ) : paginatedEntries.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="gl-empty-cell"
                  >
                    <div className="gl-empty-state">
                      <div className="gl-empty-icon">
                        <LedgerIcon />
                      </div>

                      <strong>
                        No ledger entries found
                      </strong>

                      <span>
                        Try changing your filters or date range.
                      </span>
                    </div>
                  </td>
                </tr>

              ) : (

                paginatedEntries.map((entry, index) => {

                  const debit = Number(entry.debit || 0);
                  const credit = Number(entry.credit || 0);

                  return (
                    <tr
                      key={`${entry.id}-${index}`}
                      className="gl-table-row"
                    >

                      <td>
                        <span className="gl-date-text">
                          {formatDate(entry.date)}
                        </span>
                      </td>

                      <td>
                        <span className="gl-journal-number">
                          {entry.journal || `JV-${entry.journal_id}`}
                        </span>
                      </td>

                      <td>

                        <div className="gl-account-cell">

                          <AccountIcon
                            type={entry.account_type}
                          />

                          <span>
                            {entry.account}
                          </span>

                        </div>

                      </td>

                      <td>
                        <span className="gl-description">
                          {entry.description || "—"}
                        </span>
                      </td>

                      <td className="gl-align-right">

                        {debit > 0 ? (
                          <span className="gl-amount-pill gl-debit-pill">
                            {formatCurrency(debit)}
                          </span>
                        ) : (
                          <span className="gl-dash">
                            —
                          </span>
                        )}

                      </td>

                      <td className="gl-align-right">

                        {credit > 0 ? (
                          <span className="gl-amount-pill gl-credit-pill">
                            {formatCurrency(credit)}
                          </span>
                        ) : (
                          <span className="gl-dash">
                            —
                          </span>
                        )}

                      </td>

                      <td className="gl-align-right">

                        {entry.calculatedBalance === null ? (

                          <span className="gl-dash">
                            —
                          </span>

                        ) : (

                          <span
                            className={
                              `gl-balance-pill ${
                                entry.calculatedBalance >= 0
                                  ? "gl-balance-positive"
                                  : "gl-balance-negative"
                              }`
                            }
                          >
                            {balanceLabel(
                              entry.calculatedBalance
                            )}
                          </span>

                        )}

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

            {!loading && paginatedEntries.length > 0 && (
              <tfoot>

                <tr>

                  <td colSpan="4">
                    <strong>Page Total</strong>
                  </td>

                  <td className="gl-align-right">
                    <strong>
                      {formatCurrency(
                        paginatedEntries.reduce(
                          (sum, entry) =>
                            sum + Number(entry.debit || 0),
                          0
                        )
                      )}
                    </strong>
                  </td>

                  <td className="gl-align-right">
                    <strong>
                      {formatCurrency(
                        paginatedEntries.reduce(
                          (sum, entry) =>
                            sum + Number(entry.credit || 0),
                          0
                        )
                      )}
                    </strong>
                  </td>

                  <td></td>

                </tr>

              </tfoot>
            )}

          </table>

        </div>

        {/* PAGINATION */}
        {!loading && entriesWithBalance.length > 0 && (
          <div className="gl-pagination">

            <span className="gl-pagination-info">
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * rowsPerPage + 1,
                  entriesWithBalance.length
                )}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(
                  currentPage * rowsPerPage,
                  entriesWithBalance.length
                )}
              </strong>{" "}
              of{" "}
              <strong>
                {entriesWithBalance.length}
              </strong>{" "}
              entries
            </span>

            <div className="gl-pagination-controls">

              <button
                className="gl-page-arrow"
                disabled={currentPage === 1}
                onClick={() =>
                  goToPage(currentPage - 1)
                }
              >
                ‹
              </button>

              {visiblePages.map((page, index) =>
                page === "..." ? (

                  <span
                    key={`ellipsis-${index}`}
                    className="gl-page-ellipsis"
                  >
                    ...
                  </span>

                ) : (

                  <button
                    key={page}
                    className={
                      `gl-page-number ${
                        currentPage === page
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
                className="gl-page-arrow"
                disabled={currentPage === totalPages}
                onClick={() =>
                  goToPage(currentPage + 1)
                }
              >
                ›
              </button>

              <select
                className="gl-page-size"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(
                    Number(e.target.value)
                  );
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>

            </div>

          </div>
        )}

      </section>

    </div>
  );
}