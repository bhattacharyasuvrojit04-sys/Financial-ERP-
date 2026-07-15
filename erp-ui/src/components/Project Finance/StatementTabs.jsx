import { useState } from "react";

import IncomeStatement from "./Statements/IncomeStatementP";
import BalanceSheet from "./Statements/BalanceSheetP";
import CashFlow from "./Statements/CashFlowP";
import DebtSchedule from "./Statements/DebtScheduleP";

export default function StatementTabs({
    result
}) {

    const [tab, setTab] =
        useState("income");

    return (

        <>

            <div className="pf-tabbar">

                <button
                    onClick={() =>
                        setTab("income")
                    }
                    className={
                        tab === "income"
                        ? "active"
                        : ""
                    }
                >
                    Income Statement
                </button>

                <button
                    onClick={() =>
                        setTab("balance")
                    }
                    className={
                        tab === "balance"
                        ? "active"
                        : ""
                    }
                >
                    Balance Sheet
                </button>

                <button
                    onClick={() =>
                        setTab("cashflow")
                    }
                    className={
                        tab === "cashflow"
                        ? "active"
                        : ""
                    }
                >
                    Cash Flow
                </button>

                <button
                    onClick={() =>
                        setTab("debt")
                    }
                    className={
                        tab === "debt"
                        ? "active"
                        : ""
                    }
                >
                    Debt Schedule
                </button>

            </div>

            {
                tab === "income" &&
                <IncomeStatement
                    data={result?.projection}
                />
            }

            {
                tab === "balance" &&
                <BalanceSheet
                    data={result?.projection}
                />
            }

            {
                tab === "cashflow" &&
                <CashFlow
                    data={result?.projection}
                />
            }

            {
                tab === "debt" &&
                <DebtSchedule
                    data={result?.debt_schedule}
                />
            }

        </>

    );

}