export default function Toolbar({
    activeTab,
    setActiveTab,
    displayUnit,
    setDisplayUnit, onExcelDownload
}) {

    return (

        <div className="pf-toolbar">

            <div className="pf-toolbar-tabs">

                <button
                    className={
                        activeTab === "income"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                        setActiveTab("income")
                    }
                >
                    Income Statement
                </button>

                <button
                    className={
                        activeTab === "balance"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                        setActiveTab("balance")
                    }
                >
                    Balance Sheet
                </button>

                <button
                    className={
                        activeTab === "cashflow"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                        setActiveTab("cashflow")
                    }
                >
                    Cash Flow
                </button>

                <button
                    className={
                        activeTab === "revenue"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                        setActiveTab("revenue")
                    }
                >
                    Revenue Schedule
                </button>

                <button
                    className={
                        activeTab === "debt"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                        setActiveTab("debt")
                    }
                >
                    Debt Schedule
                </button>

                <button
                    className={
                        activeTab === "asset"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                        setActiveTab("asset")
                    }
                >
                    Asset Schedule
                </button>

                <button
                    onClick={() => setActiveTab("working-capital")}
                    className={
                        activeTab === "working-capital"
                            ? "active"
                            : ""
                    }
                >
                    Working Capital
                </button>

                <button
                    className={
                        activeTab === "analysis"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("analysis")
                    }
                >
                    Analysis
                </button>

                <button
                    className={
                        activeTab === "dcf"
                            ? "active"
                            : ""
                    }
                    onClick={() => setActiveTab("dcf")}
                >
                    DCF Valuation
                </button>

            </div>

            <div className="pf-toolbar-right">

                <select
                    value={displayUnit}
                    onChange={(e)=>setDisplayUnit(e.target.value)}
                >

                    <option value="RAW">Raw</option>
                    <option value="LAKH">Lakhs</option>
                    <option value="CRORE">Crores</option>
                    <option value="MILLION">Millions</option>
                    <option value="BILLION">Billions</option>

                </select>

                <button
                    onClick={onExcelDownload}
                >
                    Download
                </button>

                <button>
                    Settings
                </button>

            </div>

        </div>

    );

}