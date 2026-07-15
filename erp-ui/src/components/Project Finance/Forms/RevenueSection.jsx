import React from "react";

export default function RevenueSection({
    items = [],
    setItems
}) {

    const addRevenue = () => {

        setItems([
            ...items,
            {
                name: "",
                revenue_type: "generic",

                amount: 0,
                growth_rate: 0,

                capacity_mw: 0,
                operating_hours: 8760,
                cuf: 20,
                tariff: 0,
                tariff_escalation: 0,
                degradation_rate: 0,

                rooms: 0,
                occupancy_pct: 0,
                adr: 0
            }
        ]);

    };

    const updateItem = (
        index,
        field,
        value
    ) => {

        const updated = [...items];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setItems(updated);

    };

    return (

        <div className="pf-section">

            <div className="pf-section-title">
                REVENUE
            </div>

            {items.map((item, index) => (

                <div
                    key={index}
                    className="pf-card"
                >

                    <label>
                        Revenue Name
                    </label>

                    <input
                        value={item.name}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "name",
                                e.target.value
                            )

                        }
                    />

                    <label>
                        Revenue Type
                    </label>

                    <select
                        value={item.revenue_type}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "revenue_type",
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

                    {/* GENERIC */}

                    {item.revenue_type ===
                        "generic" && (

                        <>

                            <label>
                                Amount
                            </label>

                            <input
                                type="number"
                                value={item.amount}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "amount",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Growth Rate %
                            </label>

                            <input
                                type="number"
                                value={item.growth_rate}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "growth_rate",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                        </>

                    )}

                    {/* SOLAR */}

                    {item.revenue_type ===
                        "solar" && (

                        <>

                            <label>
                                Capacity MW
                            </label>

                            <input
                                type="number"
                                value={item.capacity_mw ?? 0}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "capacity_mw",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Operating Hours
                            </label>

                            <input
                                type="number"
                                value={item.operating_hours ?? 8760}
                                onChange={(e)=>
                                    updateItem(
                                        index,
                                        "operating_hours",
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <label>
                                CUF %
                            </label>

                            <input
                                type="number"
                                value={item.cuf}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "cuf",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Tariff
                            </label>

                            <input
                                type="number"
                                value={item.tariff ?? 0}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "tariff",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Tariff Escalation %
                            </label>

                            <input
                                type="number"
                                value={
                                    item.tariff_escalation
                                }
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "tariff_escalation",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Degradation %
                            </label>

                            <input
                                type="number"
                                value={
                                    item.degradation_rate
                                }
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "degradation_rate",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                        </>

                    )}

                    {/* HOTEL */}

                    {item.revenue_type ===
                        "hotel" && (

                        <>

                            <label>
                                Rooms
                            </label>

                            <input
                                type="number"
                                value={item.rooms ?? 0}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "rooms",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Occupancy %
                            </label>

                            <input
                                type="number"
                                value={
                                    item.occupancy_pct ?? 0
                                }
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "occupancy_pct",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                ADR
                            </label>

                            <input
                                type="number"
                                value={item.adr ?? 0}
                                onChange={(e)=>

                                    updateItem(
                                        index,
                                        "adr",
                                        Number(
                                            e.target.value
                                        )
                                    )

                                }
                            />

                            <label>
                                Revenue Growth %
                            </label>

                            <input
                                type="number"
                                value={item.revenue_growth}
                                onChange={(e)=>
                                    updateItem(
                                        index,
                                        "revenue_growth",
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <label>
                                Food Revenue %
                            </label>

                            <input
                                type="number"
                                value={item.food_revenue_pct ?? 0}
                                onChange={(e)=>
                                    updateItem(
                                        index,
                                        "food_revenue_pct",
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <label>
                                Banquet Revenue %
                            </label>

                            <input
                                type="number"
                                value={item.banquet_revenue_pct ?? 0}
                                onChange={(e)=>
                                    updateItem(
                                        index,
                                        "banquet_revenue_pct",
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <label>
                                Spa Revenue %
                            </label>

                            <input
                                type="number"
                                value={item.spa_revenue_pct ?? 0}
                                onChange={(e)=>
                                    updateItem(
                                        index,
                                        "spa_revenue_pct",
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <label>
                                Other Revenue %
                            </label>

                            <input
                                type="number"
                                value={item.other_revenue_pct ?? 0}
                                onChange={(e)=>
                                    updateItem(
                                        index,
                                        "other_revenue_pct",
                                        Number(e.target.value)
                                    )
                                }
                            />

                        </>

                    )}

                </div>

            ))}

            <button
                className="pf-chip"
                onClick={addRevenue}
            >
                + Add Revenue
            </button>

        </div>

    );

}