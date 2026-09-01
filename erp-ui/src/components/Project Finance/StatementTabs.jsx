import IncomeStatement from "./Statements/IncomeStatementP";
import BalanceSheet from "./Statements/BalanceSheetP";
import CashFlow from "./Statements/CashFlowP";
import DebtSchedule from "./Statements/DebtScheduleP";
import RevenueSchedule from "./RevenueSchedule";

export default function StatementTabs({
    result,
    activeTab,
    project,
    setActiveTab
}) {

    

    return (

        <>

            <div className="pf-tabbar">

                <button
                    onClick={() =>
                        setActiveTab("income")
                    }
                    className={
                        activeTab === "income"
                        ? "active"
                        : ""
                    }
                >
                    Income Statement
                </button>

                <button
                    onClick={() =>
                        setActiveTab("balance")
                    }
                    className={
                        activeTab === "balance"
                        ? "active"
                        : ""
                    }
                >
                    Balance Sheet
                </button>

                <button
                    onClick={() =>
                        setActiveTab("cashflow")
                    }
                    className={
                        activeTab === "cashflow"
                        ? "active"
                        : ""
                    }
                >
                    Cash Flow
                </button>

                <button
                    onClick={() => setActiveTab("revenue")}
                    className={
                        activeTab === "revenue"
                            ? "active"
                            : ""
                    }
                >
                    Revenue Schedule
                </button>

                <button
                    onClick={() =>
                        setActiveTab("debt")
                    }
                    className={
                        activeTab === "debt"
                        ? "active"
                        : ""
                    }
                >
                    Debt Schedule
                </button>

                <button
                    onClick={() =>
                        setActiveTab("asset")
                    }
                    className={
                        activeTab === "asset"
                            ? "active"
                            : ""
                    }
                >
                    Asset Schedule
                </button>

            </div>

            {
                activeTab === "income" &&
                <IncomeStatement
                    data={result?.projection}
                />
            }

            {
                activeTab === "balance" &&
                <BalanceSheet
                    data={result?.projection}
                />
            }

            {
                activeTab === "cashflow" &&
                <CashFlow
                    data={result?.projection}
                />
            }

            {activeTab === "revenue" && (
                <RevenueSchedule
                    projection={result?.projection}
                    project={project}
                />
            )}

            {
                activeTab === "debt" &&
                <DebtSchedule
                    data={result?.debt_schedule}
                />
            }

        </>

    );

}