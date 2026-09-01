import Toolbar from "./Toolbar";

import KPIBar from "./KPIBar";

import IncomeStatement from "./Statements/IncomeStatementP";
import BalanceSheet from "./Statements/BalanceSheetP";
import CashFlow from "./Statements/CashFlowP";
import DebtSchedule from "./Statements/DebtScheduleP";

import AnalysisSchedule from "./Statements/AnalysisSchedule";
import DCFValuation from "./Statements/DCFValuation";

import AssetWorkspace from "./AssetWorkspace";
import WorkingCapitalP from "./Statements/WorkingCapitalP";
import RevenueSchedule from "./RevenueSchedule";


export default function Workspace({
    result,
    project,
    setProject,
    activeTab,
    setActiveTab,
    assetSchedule,
    displayUnit,
    setDisplayUnit,
    onExcelDownload
}) {

    console.log("========== WORKSPACE ==========");
    console.log("result =", result);
    console.log("activeTab =", activeTab);
    console.log("projection =", result?.projection);
    console.log("analysis_schedule =", result?.analysis_schedule);
    console.log("dcf =", result?.dcf_valuation);


    /*
    ============================================================
    PROFESSIONAL EMPTY STATE
    ============================================================
    */

    const EmptyState = ({ title, description }) => {

        return (

            <div
                style={{
                    minHeight: "420px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px"
                }}
            >

                <div
                    style={{
                        width: "100%",
                        maxWidth: "620px",
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "42px",
                        textAlign: "center",
                        boxShadow: "0 4px 18px rgba(0,0,0,0.04)"
                    }}
                >

                    <div
                        style={{
                            width: "52px",
                            height: "52px",
                            margin: "0 auto 20px",
                            borderRadius: "12px",
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px"
                        }}
                    >
                        📊
                    </div>


                    <h2
                        style={{
                            margin: "0 0 10px",
                            fontSize: "20px",
                            fontWeight: 600,
                            color: "#111827"
                        }}
                    >
                        {title}
                    </h2>


                    <p
                        style={{
                            margin: 0,
                            fontSize: "14px",
                            lineHeight: 1.6,
                            color: "#6b7280"
                        }}
                    >
                        {description}
                    </p>

                </div>

            </div>

        );
    };


    /*
    ============================================================
    WORKSPACE
    ============================================================
    */

    return (

        <div className="pf-workspace">


            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <Toolbar

                activeTab={activeTab}

                setActiveTab={setActiveTab}

                displayUnit={displayUnit}

                setDisplayUnit={setDisplayUnit}

                onExcelDownload={onExcelDownload}

            />


            {/* ==================================================
                KPI BAR
            ================================================== */}

            <KPIBar
                result={result}
            />


            {/* ==================================================
                NO ANALYSIS YET
            ================================================== */}

            {!result ? (

                <>

                    {activeTab === "income" && (

                        <EmptyState

                            title="Income Statement"

                            description="Run the project analysis to generate the projected income statement."

                        />

                    )}


                    {activeTab === "balance" && (

                        <EmptyState

                            title="Balance Sheet"

                            description="Run the project analysis to generate the projected balance sheet."

                        />

                    )}


                    {activeTab === "cashflow" && (

                        <EmptyState

                            title="Cash Flow Statement"

                            description="Run the project analysis to generate the projected cash flow statement."

                        />

                    )}


                    {activeTab === "revenue" && (

                        <EmptyState

                            title="Revenue Schedule"

                            description="Run the project analysis to generate the detailed revenue projection."

                        />

                    )}


                    {activeTab === "working-capital" && (

                        <EmptyState

                            title="Working Capital Schedule"

                            description="Run the project analysis to generate the projected working capital schedule."

                        />

                    )}


                    {activeTab === "debt" && (

                        <EmptyState

                            title="Debt Schedule"

                            description="Run the project analysis to generate the debt repayment and interest schedule."

                        />

                    )}


                    {activeTab === "analysis" && (

                        <EmptyState

                            title="Project Returns & Credit Analysis"

                            description="Run the project analysis to generate yearly IRR, NPV and DSCR metrics."

                        />

                    )}


                    {activeTab === "dcf" && (

                        <EmptyState

                            title="DCF Valuation"

                            description="Run the project analysis to generate the discounted cash flow valuation."

                        />

                    )}


                    {activeTab === "asset" && (

                        <EmptyState

                            title="Asset Schedule"

                            description="Run the project analysis to generate the project asset schedule."

                        />

                    )}

                </>

            ) : (

                /* =================================================
                   ANALYSIS EXISTS
                   ================================================= */

                <>

                    {/* ==================================================
                        INCOME STATEMENT
                    ================================================== */}

                    {activeTab === "income" && (

                        <IncomeStatement

                            data={result.projection}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        BALANCE SHEET
                    ================================================== */}

                    {activeTab === "balance" && (

                        <BalanceSheet

                            data={result.projection}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        CASH FLOW
                    ================================================== */}

                    {activeTab === "cashflow" && (

                        <CashFlow

                            data={result.projection}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        REVENUE SCHEDULE
                    ================================================== */}

                    {activeTab === "revenue" && (

                        <RevenueSchedule

                            projection={result.projection}

                            project={project}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        WORKING CAPITAL
                    ================================================== */}

                    {activeTab === "working-capital" && (

                        <WorkingCapitalP

                            data={result.projection}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        DEBT SCHEDULE
                    ================================================== */}

                    {activeTab === "debt" && (

                        <DebtSchedule

                            data={result.debt_schedule}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        ASSET SCHEDULE
                    ================================================== */}

                    {activeTab === "asset" && (

                        <AssetWorkspace

                            result={result}

                            assetSchedule={assetSchedule}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        ANALYSIS SCHEDULE
                    ================================================== */}

                    {activeTab === "analysis" && (

                        <AnalysisSchedule

                            data={result.analysis_schedule}

                            displayUnit={displayUnit}

                        />

                    )}


                    {/* ==================================================
                        DCF VALUATION
                    ================================================== */}

                    {activeTab === "dcf" && (

                        <DCFValuation

                            data={result?.dcf_valuation}

                            project={project}

                            displayUnit={displayUnit}

                        />

                    )}

                </>

            )}

        </div>

    );

}