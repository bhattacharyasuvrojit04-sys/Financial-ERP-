import { useEffect, useMemo, useState } from "react";
import {
  getAccounts,
  postJournalEntry,
} from "../../services/api";

import "./Journal.css";

const emptyLine = {
  account_id: "",
  debit: "",
  credit: "",
};

function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   ICONS
   ========================================================= */

function JournalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-title-icon-svg"
    >
      <path
        d="M6 4h12a2 2 0 0 1 2 2v13H8a2 2 0 0 1-2-2V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M6 17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10 8h6M10 12h6M10 16h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-input-icon"
    >
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

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-button-icon"
    >
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

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-trash-icon"
    >
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V4h6v3M7 7l1 14h8l1-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-status-icon-svg"
    >
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-status-icon-svg"
    >
      <path
        d="M12 4 21 20H3L12 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M12 9v5M12 17v.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DebitIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-total-icon"
    >
      <path
        d="M5 17 17 5M9 5h8v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="journal-total-icon"
    >
      <path
        d="M5 7 17 19M9 19h8v-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Journal() {
  const [accounts, setAccounts] =
    useState([]);

  const [description, setDescription] =
    useState("");

  const [date, setDate] =
    useState(getLocalDate());

  const [lines, setLines] =
    useState([
      { ...emptyLine },
      { ...emptyLine },
    ]);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data =
        await getAccounts();

      setAccounts(data || []);
    } catch (error) {
      console.error(
        "Account loading error:",
        error
      );

      setErrorMessage(
        "Unable to load accounts."
      );
    }
  };

  /* =======================================================
     UPDATE LINE
     ======================================================= */

  const updateLine = (
    index,
    field,
    value
  ) => {
    const updated =
      [...lines];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    if (
      field === "debit" &&
      Number(value) > 0
    ) {
      updated[index].credit = "";
    }

    if (
      field === "credit" &&
      Number(value) > 0
    ) {
      updated[index].debit = "";
    }

    setLines(updated);

    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =======================================================
     ADD LINE
     ======================================================= */

  const addLine = () => {
    setLines([
      ...lines,
      { ...emptyLine },
    ]);
  };

  /* =======================================================
     REMOVE LINE
     ======================================================= */

  const removeLine = (index) => {
    if (lines.length <= 2) {
      return;
    }

    setLines(
      lines.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =======================================================
     TOTALS
     ======================================================= */

  const totalDebit = useMemo(() => {
    return lines.reduce(
      (sum, line) =>
        sum +
        Number(line.debit || 0),
      0
    );
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce(
      (sum, line) =>
        sum +
        Number(line.credit || 0),
      0
    );
  }, [lines]);

  const difference =
    totalDebit - totalCredit;

  const absoluteDifference =
    Math.abs(difference);

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    absoluteDifference < 0.01;

  const populatedLines =
    lines.filter(
      (line) =>
        line.account_id ||
        Number(line.debit || 0) > 0 ||
        Number(line.credit || 0)
    ).length;

  /* =======================================================
     CURRENCY
     ======================================================= */

  const formatCurrency = (
    value
  ) => {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateJournal = () => {
    if (!description.trim()) {
      setErrorMessage(
        "Please enter a journal description."
      );
      return false;
    }

    if (!date) {
      setErrorMessage(
        "Please select a journal date."
      );
      return false;
    }

    const invalidLine =
      lines.some(
        (line) =>
          !line.account_id ||
          (
            Number(
              line.debit || 0
            ) === 0 &&
            Number(
              line.credit || 0
            ) === 0
          )
      );

    if (invalidLine) {
      setErrorMessage(
        "Please complete every journal line with an account and debit or credit amount."
      );
      return false;
    }

    const bothSides =
      lines.some(
        (line) =>
          Number(line.debit || 0) >
            0 &&
          Number(line.credit || 0) >
            0
      );

    if (bothSides) {
      setErrorMessage(
        "A journal line cannot contain both debit and credit."
      );
      return false;
    }

    if (!isBalanced) {
      setErrorMessage(
        `Journal is not balanced. Difference: ${formatCurrency(
          absoluteDifference
        )}`
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateJournal()) {
      return;
    }

    try {
      setSaving(true);

      await postJournalEntry({
        description:
          description.trim(),

        date,

        lines: lines.map(
          (line) => ({
            account_id:
              Number(
                line.account_id
              ),

            debit: Number(
              line.debit || 0
            ),

            credit: Number(
              line.credit || 0
            ),
          })
        ),
      });

      setSuccessMessage(
        "Journal entry posted successfully."
      );

      setDescription("");

      setLines([
        { ...emptyLine },
        { ...emptyLine },
      ]);

    } catch (error) {
      console.error(
        "Journal posting error:",
        error
      );

      const backendMessage =
        error?.response?.data
          ?.detail;

      setErrorMessage(
        backendMessage ||
          "Unable to post journal entry. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ACCOUNT LOOKUP
     ======================================================= */

  const getAccount =
    (accountId) => {
      return accounts.find(
        (account) =>
          Number(account.id) ===
          Number(accountId)
      );
    };

  return (
    <div className="journal-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="journal-page-header">

        <div className="journal-breadcrumb">
          <span>Accounting</span>

          <span className="journal-breadcrumb-arrow">
            ›
          </span>

          <strong>
            Journal
          </strong>
        </div>

        <div className="journal-header-main">

          <div className="journal-title-wrapper">

            <div className="journal-title-icon">
              <JournalIcon />
            </div>

            <div>
              <h1>
                New Journal Entry
              </h1>

              <p>
                Record a balanced double-entry accounting transaction
              </p>
            </div>

          </div>

          <div className="journal-header-status">

            <span className="journal-draft-dot"></span>

            Draft Journal

          </div>

        </div>

      </div>

      {/* =================================================
          SUCCESS / ERROR
      ================================================= */}

      {successMessage && (
        <div className="journal-alert journal-success-alert">

          <span className="journal-alert-icon">
            <CheckIcon />
          </span>

          <div>
            <strong>
              Journal Posted
            </strong>

            <span>
              {successMessage}
            </span>
          </div>

        </div>
      )}

      {errorMessage && (
        <div className="journal-alert journal-error-alert">

          <span className="journal-alert-icon">
            <WarningIcon />
          </span>

          <div>
            <strong>
              Unable to Post Journal
            </strong>

            <span>
              {errorMessage}
            </span>
          </div>

        </div>
      )}

      {/* =================================================
          ENTRY DETAILS
      ================================================= */}

      <section className="journal-details-card">

        <div className="journal-section-header">

          <div>
            <span className="journal-section-number">
              01
            </span>

            <div>
              <h2>
                Entry Details
              </h2>

              <p>
                Define the date and purpose of this journal entry.
              </p>
            </div>
          </div>

          <span className="journal-required-label">
            * Required fields
          </span>

        </div>

        <div className="journal-details-grid">

          <div className="journal-field">

            <label>
              Journal Date
              <span>*</span>
            </label>

            <div className="journal-input-wrapper">

              <CalendarIcon />

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="journal-field">

            <label>
              Description
              <span>*</span>
            </label>

            <input
              type="text"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="e.g. Capital introduced, office rent paid, asset purchase..."
            />

          </div>

        </div>

      </section>

      {/* =================================================
          JOURNAL LINES
      ================================================= */}

      <section className="journal-lines-card">

        <div className="journal-lines-header">

          <div className="journal-section-heading">

            <div className="journal-section-number">
              02
            </div>

            <div>

              <h2>
                Journal Lines
              </h2>

              <p>
                Enter the accounts affected by this transaction.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={addLine}
            className="journal-add-line-button"
          >
            <PlusIcon />
            Add Line
          </button>

        </div>

        <div className="journal-account-note">

          <span className="journal-note-mark">
            i
          </span>

          <span>
            Each journal line must have either a debit or a credit amount. The total debits must equal total credits before posting.
          </span>

        </div>

        <div className="journal-table-wrapper">

          <table className="journal-table">

            <thead>

              <tr>

                <th className="journal-line-column">
                  #
                </th>

                <th>
                  Account
                </th>

                <th className="journal-debit-column">
                  Debit
                </th>

                <th className="journal-credit-column">
                  Credit
                </th>

                <th className="journal-action-column">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {lines.map(
                (line, index) => {

                  const selectedAccount =
                    getAccount(
                      line.account_id
                    );

                  const hasDebit =
                    Number(
                      line.debit || 0
                    ) > 0;

                  const hasCredit =
                    Number(
                      line.credit || 0
                    ) > 0;

                  return (
                    <tr
                      key={index}
                      className={
                        `journal-line-row ${
                          hasDebit
                            ? "journal-debit-row"
                            : hasCredit
                            ? "journal-credit-row"
                            : ""
                        }`
                      }
                    >

                      <td className="journal-line-number">

                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                      </td>

                      <td>

                        <div className="journal-account-select-wrapper">

                          <select
                            value={
                              line.account_id
                            }
                            onChange={(e) =>
                              updateLine(
                                index,
                                "account_id",
                                e.target.value
                              )
                            }
                            className={
                              line.account_id
                                ? "has-value"
                                : ""
                            }
                          >

                            <option value="">
                              Select account
                            </option>

                            {accounts.map(
                              (
                                account
                              ) => (
                                <option
                                  key={
                                    account.id
                                  }
                                  value={
                                    account.id
                                  }
                                >
                                  {
                                    account.name
                                  }
                                </option>
                              )
                            )}

                          </select>

                          {selectedAccount && (
                            <span className="journal-account-meta">

                              {selectedAccount.group_name ||
                                selectedAccount.type ||
                                "Account"}

                            </span>
                          )}

                        </div>

                      </td>

                      <td>

                        <div
                          className={
                            `journal-amount-input ${
                              hasDebit
                                ? "active-debit"
                                : ""
                            }`
                          }
                        >

                          <span>
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              line.debit
                            }
                            placeholder="0.00"
                            onChange={(e) =>
                              updateLine(
                                index,
                                "debit",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </td>

                      <td>

                        <div
                          className={
                            `journal-amount-input ${
                              hasCredit
                                ? "active-credit"
                                : ""
                            }`
                          }
                        >

                          <span>
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              line.credit
                            }
                            placeholder="0.00"
                            onChange={(e) =>
                              updateLine(
                                index,
                                "credit",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </td>

                      <td className="journal-action-cell">

                        <button
                          type="button"
                          onClick={() =>
                            removeLine(
                              index
                            )
                          }
                          disabled={
                            lines.length <=
                            2
                          }
                          className="journal-delete-button"
                          title={
                            lines.length <=
                            2
                              ? "At least two journal lines are required"
                              : "Remove line"
                          }
                        >
                          <TrashIcon />
                        </button>

                      </td>

                    </tr>
                  )
                }
              )}

            </tbody>

            <tfoot>

              <tr>

                <td
                  colSpan="2"
                  className="journal-total-label"
                >
                  Total
                </td>

                <td className="journal-total-debit">
                  {formatCurrency(
                    totalDebit
                  )}
                </td>

                <td className="journal-total-credit">
                  {formatCurrency(
                    totalCredit
                  )}
                </td>

                <td></td>

              </tr>

            </tfoot>

          </table>

        </div>

      </section>

      {/* =================================================
          TOTAL SUMMARY
      ================================================= */}

      <section className="journal-summary-grid">

        <div className="journal-summary-card">

          <div className="journal-summary-icon journal-summary-debit">
            <DebitIcon />
          </div>

          <div>

            <span>
              Total Debit
            </span>

            <strong>
              {formatCurrency(
                totalDebit
              )}
            </strong>

          </div>

        </div>

        <div className="journal-summary-card">

          <div className="journal-summary-icon journal-summary-credit">
            <CreditIcon />
          </div>

          <div>

            <span>
              Total Credit
            </span>

            <strong>
              {formatCurrency(
                totalCredit
              )}
            </strong>

          </div>

        </div>

        <div
          className={
            `journal-summary-card ${
              isBalanced
                ? "journal-balanced-summary"
                : "journal-unbalanced-summary"
            }`
          }
        >

          <div
            className={
              `journal-summary-icon ${
                isBalanced
                  ? "journal-summary-balanced"
                  : "journal-summary-warning"
              }`
            }
          >

            {isBalanced ? (
              <CheckIcon />
            ) : (
              <WarningIcon />
            )}

          </div>

          <div>

            <span>
              Difference
            </span>

            <strong>
              {formatCurrency(
                absoluteDifference
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* =================================================
          BALANCE STATUS
      ================================================= */}

      <section
        className={
          `journal-balance-panel ${
            isBalanced
              ? "journal-balance-success"
              : "journal-balance-warning"
          }`
        }
      >

        <div className="journal-balance-left">

          <div className="journal-balance-icon">

            {isBalanced ? (
              <CheckIcon />
            ) : (
              <WarningIcon />
            )}

          </div>

          <div>

            <h3>
              {isBalanced
                ? "Journal is balanced"
                : "Journal is not balanced"}
            </h3>

            <p>

              {isBalanced
                ? "The debit and credit totals are equal. This journal is ready to be posted."
                : "Debit and credit totals must be equal before this journal can be posted."}

            </p>

          </div>

        </div>

        <div className="journal-balance-value">

          <span>
            Difference
          </span>

          <strong>
            {formatCurrency(
              absoluteDifference
            )}
          </strong>

        </div>

      </section>

      {/* =================================================
          FOOTER ACTIONS
      ================================================= */}

      <div className="journal-footer">

        <div className="journal-footer-info">

          <span>
            {populatedLines}
            {" "}
            journal line
            {populatedLines !== 1
              ? "s"
              : ""}
          </span>

          <span className="journal-footer-divider">
            •
          </span>

          <span>
            Double-entry accounting
          </span>

        </div>

        <div className="journal-footer-actions">

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="journal-cancel-button"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !isBalanced ||
              saving
            }
            onClick={
              handleSubmit
            }
            className={
              `journal-post-button ${
                isBalanced &&
                !saving
                  ? "enabled"
                  : ""
              }`
            }
          >

            {saving ? (
              <>
                <span className="journal-button-spinner"></span>
                Posting...
              </>
            ) : (
              <>
                <CheckIcon />
                Post Journal
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}