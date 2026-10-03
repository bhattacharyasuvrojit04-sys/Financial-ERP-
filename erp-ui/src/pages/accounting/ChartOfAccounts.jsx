import { useEffect, useMemo, useState } from "react";
import { getAccounts, createAccount } from "../../services/api";
import "./ChartOfAccounts.css";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [groupName, setGroupName] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD ACCOUNTS
     ========================================================= */

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Account loading error:", err);
      setError("Unable to load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  /* =========================================================
     FILTER OPTIONS
     ========================================================= */

  const accountTypes = useMemo(() => {
    return [
      ...new Set(
        accounts
          .map((account) => account.type)
          .filter(Boolean)
      ),
    ];
  }, [accounts]);

  const accountGroups = useMemo(() => {
    return [
      ...new Set(
        accounts
          .map((account) => account.group_name)
          .filter(Boolean)
      ),
    ];
  }, [accounts]);

  /* =========================================================
     FILTER ACCOUNTS
     ========================================================= */

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.name?.toLowerCase().includes(query) ||
        account.group_name?.toLowerCase().includes(query) ||
        account.type?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" ||
        account.type === typeFilter;

      const matchesGroup =
        groupFilter === "all" ||
        account.group_name === groupFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesGroup
      );
    });
  }, [
    accounts,
    search,
    typeFilter,
    groupFilter,
  ]);

  /* =========================================================
     SUMMARY
     ========================================================= */

  const summary = useMemo(() => {
    const total = accounts.length;

    const assets = accounts.filter((account) =>
      ["current_assets", "non_current_assets", "asset", "contra_asset"]
        .includes(account.type)
    ).length;

    const liabilities = accounts.filter((account) =>
      ["current_liabilities", "non_current_liabilities", "liability"]
        .includes(account.type)
    ).length;

    const income = accounts.filter((account) =>
      ["operating_income", "non_operating_income", "income", "revenue"]
        .includes(account.type)
    ).length;

    const expenses = accounts.filter((account) =>
      ["operating_expense", "non_operating_expense", "expense"]
        .includes(account.type)
    ).length;

    const equity = accounts.filter((account) =>
      ["equity", "capital", "retained_earnings"]
        .includes(account.type)
    ).length;

    return {
      total,
      assets,
      liabilities,
      income,
      expenses,
      equity,
    };
  }, [accounts]);

  /* =========================================================
     HELPERS
     ========================================================= */

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  const formatType = (type = "") => {
    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getTypeClass = (type = "") => {
    if (
      [
        "current_assets",
        "non_current_assets",
        "asset",
        "contra_asset",
      ].includes(type)
    ) {
      return "coa-type-badge coa-type-asset";
    }

    if (
      [
        "current_liabilities",
        "non_current_liabilities",
        "liability",
      ].includes(type)
    ) {
      return "coa-type-badge coa-type-liability";
    }

    if (
      [
        "operating_income",
        "non_operating_income",
        "income",
        "revenue",
      ].includes(type)
    ) {
      return "coa-type-badge coa-type-income";
    }

    if (
      [
        "operating_expense",
        "non_operating_expense",
        "expense",
      ].includes(type)
    ) {
      return "coa-type-badge coa-type-expense";
    }

    if (
      [
        "equity",
        "capital",
        "retained_earnings",
      ].includes(type)
    ) {
      return "coa-type-badge coa-type-equity";
    }

    return "coa-type-badge";
  };

  /* =========================================================
     CREATE ACCOUNT
     ========================================================= */

  const handleCreateAccount = async () => {
    setError("");

    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }

    if (!groupName) {
      setError("Please select an account group.");
      return;
    }

    try {
      setSaving(true);

      await createAccount({
        name: accountName.trim(),
        group_name: groupName,
      });

      setAccountName("");
      setGroupName("");
      setShowModal(false);

      await loadAccounts();
    } catch (err) {
      console.error("Account creation error:", err);

      setError(
        err?.response?.data?.detail ||
        "Unable to create account."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ACCOUNT GROUPS
     ========================================================= */

  const accountGroupOptions = [
    {
      value: "Cash-in-Hand",
      description: "Physical cash and petty cash",
    },
    {
      value: "Bank Accounts",
      description: "Current and savings bank accounts",
    },
    {
      value: "Current Assets",
      description: "Short-term operating assets",
    },
    {
      value: "Fixed Assets",
      description: "Property, equipment and long-term assets",
    },
    {
      value: "Investments",
      description: "Investments held by the business",
    },
    {
      value: "Sundry Debtors",
      description: "Customer receivables",
    },
    {
      value: "Capital Account",
      description: "Owner or shareholder capital",
    },
    {
      value: "Secured Loans",
      description: "Loans backed by security",
    },
    {
      value: "Unsecured Loans",
      description: "Loans without security",
    },
    {
      value: "Sundry Creditors",
      description: "Supplier and vendor payables",
    },
    {
      value: "Sales Accounts",
      description: "Revenue from business operations",
    },
    {
      value: "Indirect Income",
      description: "Non-operating or other income",
    },
    {
      value: "Direct Expenses",
      description: "Expenses directly related to production",
    },
    {
      value: "Indirect Expenses",
      description: "Administrative and operating expenses",
    },
    {
      value: "Accumulated Depreciation",
      description: "Contra-asset depreciation accounts",
    },
  ];

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="coa-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="coa-header">

        <div className="coa-header-left">

          <div className="coa-page-icon">
            <span>COA</span>
          </div>

          <div>
            <div className="coa-eyebrow">
              ACCOUNTING
            </div>

            <h1 className="coa-title">
              Chart of Accounts
            </h1>

            <p className="coa-subtitle">
              Manage your accounting structure, account groups
              and ledger classifications.
            </p>
          </div>

        </div>

        <button
          className="coa-primary-btn"
          onClick={() => {
            setError("");
            setAccountName("");
            setGroupName("");
            setShowModal(true);
          }}
        >
          <span className="coa-plus">+</span>
          New Account
        </button>

      </div>

      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <div className="coa-summary-grid">

        <div className="coa-summary-card">

          <div className="coa-summary-top">
            <span className="coa-summary-label">
              Total Accounts
            </span>

            <div className="coa-summary-icon neutral">
              #
            </div>
          </div>

          <div className="coa-summary-value">
            {summary.total}
          </div>

          <div className="coa-summary-footer">
            Accounts configured
          </div>

        </div>

        <div className="coa-summary-card">

          <div className="coa-summary-top">
            <span className="coa-summary-label">
              Assets
            </span>

            <div className="coa-summary-icon asset">
              A
            </div>
          </div>

          <div className="coa-summary-value">
            {summary.assets}
          </div>

          <div className="coa-summary-footer">
            Asset accounts
          </div>

        </div>

        <div className="coa-summary-card">

          <div className="coa-summary-top">
            <span className="coa-summary-label">
              Liabilities
            </span>

            <div className="coa-summary-icon liability">
              L
            </div>
          </div>

          <div className="coa-summary-value">
            {summary.liabilities}
          </div>

          <div className="coa-summary-footer">
            Liability accounts
          </div>

        </div>

        <div className="coa-summary-card">

          <div className="coa-summary-top">
            <span className="coa-summary-label">
              Income
            </span>

            <div className="coa-summary-icon income">
              ↑
            </div>
          </div>

          <div className="coa-summary-value">
            {summary.income}
          </div>

          <div className="coa-summary-footer">
            Revenue accounts
          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
          ===================================================== */}

      <div className="coa-main-card">

        {/* Toolbar */}

        <div className="coa-toolbar">

          <div className="coa-search-box">

            <span className="coa-search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search accounts, groups or types..."
            />

            {search && (
              <button
                className="coa-search-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

          <div className="coa-filters">

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              className="coa-select"
            >
              <option value="all">
                All Types
              </option>

              {accountTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatType(type)}
                </option>
              ))}
            </select>

            <select
              value={groupFilter}
              onChange={(e) =>
                setGroupFilter(e.target.value)
              }
              className="coa-select"
            >
              <option value="all">
                All Groups
              </option>

              {accountGroups.map((group) => (
                <option
                  key={group}
                  value={group}
                >
                  {group}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* Table Header */}

        <div className="coa-table-header">

          <div>
            <span className="coa-table-title">
              Accounts
            </span>

            <span className="coa-table-count">
              {filteredAccounts.length} accounts
            </span>
          </div>

          {(search ||
            typeFilter !== "all" ||
            groupFilter !== "all") && (
            <button
              className="coa-clear-filters"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setGroupFilter("all");
              }}
            >
              Clear filters
            </button>
          )}

        </div>

        {/* ===================================================
            TABLE
            =================================================== */}

        <div className="coa-table-wrapper">

          <table className="coa-table">

            <thead>
              <tr>

                <th className="coa-account-column">
                  ACCOUNT
                </th>

                <th>
                  TYPE
                </th>

                <th>
                  GROUP
                </th>

                <th>
                  NORMAL BALANCE
                </th>

                <th className="coa-id-column">
                  ID
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                Array.from({ length: 6 }).map(
                  (_, index) => (
                    <tr
                      key={index}
                      className="coa-skeleton-row"
                    >
                      <td>
                        <div className="coa-skeleton account" />
                      </td>

                      <td>
                        <div className="coa-skeleton small" />
                      </td>

                      <td>
                        <div className="coa-skeleton medium" />
                      </td>

                      <td>
                        <div className="coa-skeleton small" />
                      </td>

                      <td>
                        <div className="coa-skeleton tiny" />
                      </td>
                    </tr>
                  )
                )

              ) : filteredAccounts.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="coa-empty-cell"
                  >
                    <div className="coa-empty">

                      <div className="coa-empty-icon">
                        ≡
                      </div>

                      <h3>
                        No accounts found
                      </h3>

                      <p>
                        Try changing your search or
                        filter criteria.
                      </p>

                    </div>
                  </td>
                </tr>

              ) : (

                filteredAccounts.map(
                  (account, index) => (
                    <tr
                      key={account.id}
                      className="coa-table-row"
                    >

                      {/* Account */}

                      <td>

                        <div className="coa-account-cell">

                          <div className="coa-account-avatar">
                            {getInitials(account.name)}
                          </div>

                          <div className="coa-account-info">

                            <div className="coa-account-name">
                              {account.name}
                            </div>

                            <div className="coa-account-meta">
                              Account #{account.id}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* Type */}

                      <td>

                        <span
                          className={getTypeClass(
                            account.type
                          )}
                        >
                          {formatType(account.type)}
                        </span>

                      </td>

                      {/* Group */}

                      <td>

                        <div className="coa-group-cell">

                          <span className="coa-group-dot" />

                          <span>
                            {account.group_name || "—"}
                          </span>

                        </div>

                      </td>

                      {/* Normal Balance */}

                      <td>

                        {account.normal_balance ? (
                          <span
                            className={`coa-balance ${
                              account.normal_balance ===
                              "debit"
                                ? "debit"
                                : "credit"
                            }`}
                          >
                            <span className="coa-balance-dot" />

                            {account.normal_balance
                              .charAt(0)
                              .toUpperCase() +
                              account.normal_balance.slice(
                                1
                              )}
                          </span>
                        ) : (
                          <span className="coa-muted">
                            —
                          </span>
                        )}

                      </td>

                      {/* ID */}

                      <td>

                        <span className="coa-account-id">
                          {String(account.id).padStart(
                            4,
                            "0"
                          )}
                        </span>

                      </td>

                    </tr>
                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* Footer */}

        {!loading &&
          filteredAccounts.length > 0 && (
            <div className="coa-table-footer">

              <span>
                Showing{" "}
                <strong>
                  {filteredAccounts.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {accounts.length}
                </strong>{" "}
                accounts
              </span>

              <span className="coa-footer-status">
                <span className="coa-live-dot" />
                Accounting structure active
              </span>

            </div>
          )}

      </div>

      {/* =====================================================
          CREATE ACCOUNT MODAL
          ===================================================== */}

      {showModal && (

        <div
          className="coa-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >

          <div className="coa-modal">

            <div className="coa-modal-header">

              <div>

                <div className="coa-modal-icon">
                  +
                </div>

                <div>
                  <h2>
                    Create Account
                  </h2>

                  <p>
                    Add a new ledger account to your chart.
                  </p>
                </div>

              </div>

              <button
                className="coa-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>

            </div>

            <div className="coa-modal-body">

              {/* Account Name */}

              <div className="coa-form-group">

                <label>
                  Account Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={accountName}
                  onChange={(e) =>
                    setAccountName(e.target.value)
                  }
                  placeholder="e.g. HDFC Bank"
                  autoFocus
                />

                <small>
                  Use a clear and unique account name.
                </small>

              </div>

              {/* Group */}

              <div className="coa-form-group">

                <label>
                  Account Group
                  <span>*</span>
                </label>

                <select
                  value={groupName}
                  onChange={(e) =>
                    setGroupName(e.target.value)
                  }
                >
                  <option value="">
                    Select account group
                  </option>

                  {accountGroupOptions.map(
                    (group) => (
                      <option
                        key={group.value}
                        value={group.value}
                      >
                        {group.value}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Selected group description */}

              {groupName && (
                <div className="coa-group-preview">

                  <div className="coa-preview-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      {groupName}
                    </strong>

                    <p>
                      {
                        accountGroupOptions.find(
                          (group) =>
                            group.value === groupName
                        )?.description
                      }
                    </p>

                  </div>

                </div>
              )}

              {/* Error */}

              {error && (
                <div className="coa-form-error">
                  <span>!</span>
                  {error}
                </div>
              )}

            </div>

            {/* Modal Footer */}

            <div className="coa-modal-footer">

              <button
                className="coa-secondary-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="coa-primary-btn"
                onClick={handleCreateAccount}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="coa-spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="coa-plus">+</span>
                    Create Account
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}