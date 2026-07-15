export default function Toolbar({
    activeTab,
    setActiveTab
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

            </div>

            <div className="pf-toolbar-right">

                <select>
                    <option>5-Year</option>
                    <option>10-Year</option>
                    <option>Full Model</option>
                </select>

                <button>
                    Download
                </button>

                <button>
                    Settings
                </button>

            </div>

        </div>

    );

}