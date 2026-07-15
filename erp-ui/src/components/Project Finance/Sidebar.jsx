import React from "react";
import LineItemSection from "./LineItemSection";
import RevenueSection from "./Forms/RevenueSection";
import OpexSection from "./Forms/OpexSection";
import CapexSection from "./Forms/CapexSection";
import AssetSection from "./Forms/AssetSection";
import LiabilitySection from "./Forms/LiabilitySection";
import EquitySection from "./Forms/EquitySection";
import DebtStructureSection from "./Forms/DebtStructureSection";

export default function Sidebar({
    projects = [],

    project,
    setProject,

    selectedProject,
    onSelectProject,

    onAnalyze,
    onSave
}) {

    const setRevenueItems = (items) => {

    setProject({
        ...project,
        revenue_items: items
    });

};

const setOpexItems = (items) => {

    setProject({
        ...project,
        opex_items: items
    });

};

const setCapexItems = (items) => {

    setProject({
        ...project,
        capex_items: items
    });

};

const setAssetItems = (items) => {

    setProject({
        ...project,
        asset_items: items
    });

};

const setLiabilityItems = (items) => {

    setProject({
        ...project,
        liability_items: items
    });

};

const setEquityItems = (items) => {

    setProject({
        ...project,
        equity_items: items
    });

};

    return (

        <div className="pf-sidebar">

            {/* HEADER */}

            <div className="pf-brand">

                <div className="pf-dot"></div>

                <div>

                    <div className="pf-brand-label">
                        PROJECT FINANCE
                    </div>

                    <div className="pf-project-name">
                        {project?.name || "New Project"}
                    </div>

                    <div className="pf-project-subtitle">
                        Project model · 25 years
                    </div>

                </div>

            </div>

            {/* SAVED PROJECTS */}

            <div className="pf-section">

                <div className="pf-section-title">
                    SAVED PROJECTS
                </div>

                <label>Select Project</label>

                <select
                    value={selectedProject?.id || ""}
                    onChange={(e) => {

                        const selected = projects.find(
                            p => p.id === Number(e.target.value)
                        );

                        if (selected) {
                            onSelectProject(selected);
                        }

                    }}
                >

                    <option value="">
                        Select Project
                    </option>

                    {projects.map(project => (

                        <option
                            key={project.id}
                            value={project.id}
                        >
                            {project.name}
                        </option>

                    ))}

                </select>

            </div>

            {/* PROJECT INPUTS */}

            <div className="pf-section">

                <div className="pf-section-title">
                    PROJECT INPUTS
                </div>

                <label>Project Name</label>

                <input
                    value={project?.name || ""}
                    onChange={(e) =>

                        setProject({

                            ...project,

                            name: e.target.value

                        })

                    }
                />

                <label>Project Type</label>

                <select
                    value={project.project_type || ""}
                    onChange={(e)=>

                        setProject({

                            ...project,

                            project_type:
                                e.target.value

                        })

                    }
                >
                    <option value="">
                        Select Project Type
                    </option>

                    <option value="solar">
                        Solar
                    </option>

                    <option value="hotel">
                        Hotel
                    </option>

                    <option value="manufacturing">
                        Manufacturing
                    </option>

                </select>

                <label>Model Horizon</label>

                <input
                    type="number"
                    value={project?.project_life || 25}
                    onChange={(e) =>

                        setProject({

                            ...project,

                            project_life:
                                Number(e.target.value)

                        })

                    }
                />

                <label>Discount Rate (%)</label>

                <input
                    type="number"
                    value={project?.discount_rate || 10}
                    onChange={(e) =>

                        setProject({

                            ...project,

                            discount_rate:
                                Number(e.target.value)

                        })

                    }
                />

                <label>Tax Rate (%)</label>

                <input
                    type="number"
                    value={project.tax_rate || 30}
                    onChange={(e)=>

                        setProject({

                            ...project,

                            tax_rate:
                                Number(e.target.value)

                        })

                    }
                />

                <label>Depreciation Years</label>

                <input
                    type="number"
                    value={project.depreciation_years || 15}
                    onChange={(e)=>

                        setProject({

                            ...project,

                            depreciation_years:
                                Number(e.target.value)

                        })

                    }
/>

            </div>

            {/* DEBT */}

            <DebtStructureSection
                project={project}
                setProject={setProject}
            />

            {/* WORKING CAPITAL */}

            <div className="pf-section">

            <div className="pf-section-title">
                WORKING CAPITAL
            </div>

            <label>Receivable Days</label>

            <input
                type="number"
                value={
                    project.working_capital?.receivable_days || 30
                }
                onChange={(e)=>

                    setProject({

                        ...project,

                        working_capital: {

                            ...project.working_capital,

                            receivable_days:
                                Number(e.target.value)

                        }

                    })

                }
            />

            <label>Payable Days</label>

            <input
                type="number"
                value={
                    project.working_capital?.payable_days || 30
                }
                onChange={(e)=>

                    setProject({

                        ...project,

                        working_capital: {

                            ...project.working_capital,

                            payable_days:
                                Number(e.target.value)

                        }

                    })

                }
            />

            <label>Inventory Days</label>

            <input
                type="number"
                value={
                    project.working_capital?.inventory_days || 0
                }
                onChange={(e)=>

                    setProject({

                        ...project,

                        working_capital: {

                            ...project.working_capital,

                            inventory_days:
                                Number(e.target.value)

                        }

                    })

                }
            />

        </div>

            {/* LINE ITEMS */}

            <div className="pf-section">

                <div className="pf-section-title">
                    LINE ITEMS
                </div>

                <RevenueSection
                    items={project.revenue_items || []}
                    setItems={setRevenueItems}
                />

                <OpexSection
                    title="Opex"
                    items={project.opex_items || []}
                    setItems={setOpexItems}
                    defaultItem={{
                        name: "",
                        amount: 0,
                        growth_rate: 0
                    }}
                />

                <CapexSection
                    title="Capex"
                    items={project.capex_items || []}
                    setItems={setCapexItems}
                    defaultItem={{
                        name: "",
                        amount: 0,
                        growth_rate: 0
                    }}
                />

                <AssetSection
                    title="Asset"
                    items={project.asset_items || []}
                    setItems={setAssetItems}
                    defaultItem={{
                        name: "",
                        amount: 0,
                        growth_rate: 0
                    }}
                />

                <LiabilitySection
                    title="Liability"
                    items={project.liability_items || []}
                    setItems={setLiabilityItems}
                    defaultItem={{
                        name: "",
                        amount: 0,
                        growth_rate: 0
                    }}
                />

                <EquitySection
                    title="Equity"
                    items={project.equity_items || []}
                    setItems={setEquityItems}
                    defaultItem={{
                        name: "",
                        amount: 0,
                        growth_rate: 0
                    }}
                />
            </div>




            {/* ACTIONS */}

            <button
                className="pf-run-btn"
                onClick={onAnalyze}
            >
                ▶ Run Model
            </button>

            <button
                className="pf-save-btn"
                
                onClick={onSave}
            >
                Save Project
            </button>

            

        </div>

        

    );

}