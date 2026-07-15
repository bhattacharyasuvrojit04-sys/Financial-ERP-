import { useState } from "react";

import Toolbar from "./Toolbar";
import KPIBar from "./KPIBar";
import EmptyState from "./EmptyState";

import IncomeStatement from "./Statements/IncomeStatementP";
import BalanceSheet from "./Statements/BalanceSheetP";
import CashFlow from "./Statements/CashFlowP";
import DebtSchedule from "./Statements/DebtScheduleP";

export default function Workspace({ result }) {

    const [activeTab, setActiveTab] =
        useState("income");

    return (

        <div className="pf-workspace">

            <Toolbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <KPIBar result={result} />

            {/* TEMPORARY TEST MODE */}
            {!result ? (

                <>
                    {activeTab === "income" && (
                        <div
                            style={{
                                padding: "20px",
                                background: "#fff",
                                border: "1px solid #ddd"
                            }}
                        >
                            INCOME STATEMENT WORKING
                        </div>
                    )}

                    {activeTab === "balance" && (
                        <div
                            style={{
                                padding: "20px",
                                background: "#fff",
                                border: "1px solid #ddd"
                            }}
                        >
                            BALANCE SHEET WORKING
                        </div>
                    )}

                    {activeTab === "cashflow" && (
                        <div
                            style={{
                                padding: "20px",
                                background: "#fff",
                                border: "1px solid #ddd"
                            }}
                        >
                            CASH FLOW WORKING
                        </div>
                    )}

                    {activeTab === "debt" && (
                        <div
                            style={{
                                padding: "20px",
                                background: "#fff",
                                border: "1px solid #ddd"
                            }}
                        >
                            DEBT SCHEDULE WORKING
                        </div>
                    )}
                </>

            ) : (

                <>
                    {activeTab === "income" && (
                        <IncomeStatement
                            data={result.projection}
                        />
                    )}

                    {activeTab === "balance" && (
                        <BalanceSheet
                            data={result.projection}
                        />
                    )}

                    {activeTab === "cashflow" && (
                        <CashFlow
                            data={result.projection}
                        />
                    )}

                    {activeTab === "debt" && (
                        <DebtSchedule
                            data={result.debt_schedule}
                        />
                    )}
                </>

            )}

        </div>

    );

}