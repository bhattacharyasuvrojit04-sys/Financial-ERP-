import React from "react";

export default function COGSInput({
    items = [],
    setItems
}) {

    const addCOGS = () => {

        const newItem = {
            name: "",
            cogs_industry: "generic",
            cogs_type: "fixed",
            amount: 0,
            growth_rate: 0,
            cost_per_kwh: 0,
            cost_per_room: 0
        };

        setItems([
            ...items,
            newItem
        ]);
    };


    const updateCOGS = (index, field, value) => {

        const updated = [...items];

        updated[index] = {
            ...updated[index],
            [field]:
                field === "name" ||
                field === "cogs_industry" ||
                field === "cogs_type"
                    ? value
                    : Number(value)
        };

        setItems(updated);
    };


    const removeCOGS = (index) => {

        setItems(
            items.filter((_, i) => i !== index)
        );

    };


    return (

        <div className="pf-input-section">

            <div className="pf-section-title">
                COST OF GOODS SOLD
            </div>


            {items.map((item, index) => (

                <div
                    key={index}
                    className="pf-cogs-row"
                >

                    {/* =========================
                        COGS NAME
                    ========================== */}

                    <div className="pf-cogs-field">

                        <label>
                            COGS Name
                        </label>

                        <input
                            type="text"
                            value={item.name || ""}
                            placeholder="e.g. Raw Materials"
                            onChange={(e) =>
                                updateCOGS(
                                    index,
                                    "name",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* =========================
                        INDUSTRY
                    ========================== */}

                    <div className="pf-cogs-field">

                        <label>
                            COGS Industry
                        </label>

                        <select
                            value={
                                item.cogs_industry ||
                                "generic"
                            }
                            onChange={(e) =>
                                updateCOGS(
                                    index,
                                    "cogs_industry",
                                    e.target.value
                                )
                            }
                        >

                            <option value="generic">
                                Generic
                            </option>

                            <option value="solar">
                                Solar
                            </option>

                            <option value="hotel">
                                Hotel
                            </option>

                        </select>

                    </div>


                    {/* =========================
                        FIXED / VARIABLE
                    ========================== */}

                    <div className="pf-cogs-field">

                        <label>
                            Cost Type
                        </label>

                        <select
                            value={
                                item.cogs_type ||
                                "fixed"
                            }
                            onChange={(e) =>
                                updateCOGS(
                                    index,
                                    "cogs_type",
                                    e.target.value
                                )
                            }
                        >

                            <option value="fixed">
                                Fixed
                            </option>

                            <option value="variable">
                                Variable
                            </option>

                        </select>

                    </div>


                    {/* =========================
                        FIXED INPUTS
                    ========================== */}

                    {item.cogs_type === "fixed" && (

                        <>

                            <div className="pf-cogs-field">

                                <label>
                                    Year 1 Amount
                                </label>

                                <input
                                    type="number"
                                    value={
                                        item.amount ?? 0
                                    }
                                    onChange={(e) =>
                                        updateCOGS(
                                            index,
                                            "amount",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="pf-cogs-field">

                                <label>
                                    Growth (%)
                                </label>

                                <input
                                    type="number"
                                    value={
                                        item.growth_rate ?? 0
                                    }
                                    onChange={(e) =>
                                        updateCOGS(
                                            index,
                                            "growth_rate",
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </>

                    )}


                    {/* =========================
                        SOLAR VARIABLE
                    ========================== */}

                    {item.cogs_type === "variable" &&
                     item.cogs_industry === "solar" && (

                        <div className="pf-cogs-field">

                            <label>
                                Cost / kWh
                            </label>

                            <input
                                type="number"
                                value={
                                    item.cost_per_kwh ?? 0
                                }
                                onChange={(e) =>
                                    updateCOGS(
                                        index,
                                        "cost_per_kwh",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    )}


                    {/* =========================
                        HOTEL VARIABLE
                    ========================== */}

                    {item.cogs_type === "variable" &&
                     item.cogs_industry === "hotel" && (

                        <div className="pf-cogs-field">

                            <label>
                                Cost / Room
                            </label>

                            <input
                                type="number"
                                value={
                                    item.cost_per_room ?? 0
                                }
                                onChange={(e) =>
                                    updateCOGS(
                                        index,
                                        "cost_per_room",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    )}


                    {/* =========================
                        GENERIC VARIABLE
                    ========================== */}

                    {item.cogs_type === "variable" &&
                     item.cogs_industry === "generic" && (

                        <div className="pf-cogs-field">

                            <label>
                                Variable Cost
                            </label>

                            <input
                                type="number"
                                value={
                                    item.amount ?? 0
                                }
                                onChange={(e) =>
                                    updateCOGS(
                                        index,
                                        "amount",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    )}


                    {/* REMOVE */}

                    <button
                        type="button"
                        className="pf-remove-btn"
                        onClick={() =>
                            removeCOGS(index)
                        }
                    >
                        ×
                    </button>

                </div>

            ))}


            <button
                type="button"
                className="pf-add-btn"
                onClick={addCOGS}
            >
                + Add COGS
            </button>

        </div>

    );

}