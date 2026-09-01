import React from "react";
import RevenueRow from "./RevenueRow";

export default function RevenueSchedule({ projection = [], project }) {

    if (!projection.length) {
        return (
            <div className="statement-card">
                No Projection Found
            </div>
        );
    }

    const years = projection.map(p => p.year);

    const firstRevenueYear = projection.find(
    p => Object.keys(p.revenue_breakdown || {}).length > 0
);

    const revenueKeys = firstRevenueYear
    ? Object.keys(firstRevenueYear.revenue_breakdown)
    : [];

    console.log("Projection:");
    console.log(projection);

    console.log("Revenue Breakdown:");
    console.log(projection[1]?.revenue_breakdown);

    console.log("Revenue Keys:");
    console.log(Object.keys(projection[1]?.revenue_breakdown || {}));
    console.log(projection[1].revenue_breakdown.hotel);

    return (

        <div className="statement-card">

            <h2 className="statement-title">
                Revenue Schedule
            </h2>

            <table className="statement-table">

                <thead>

                    <tr>

                        <th>Revenue Driver</th>

                        {years.map(year => (
                            <th key={year}>
                                Y{year}
                            </th>
                        ))}

                    </tr>

                </thead>

                <tbody>

                    {revenueKeys.map((key, idx) => {

                        const sample =
                            firstRevenueYear.revenue_breakdown[key];

                        return (

                            <React.Fragment key={key}>

                                <tr className="statement-section-header">
                                    <td
                                        colSpan={
                                            years.length + 1
                                        }
                                    >
                                        {key.toUpperCase()}
                                    </td>
                                </tr>

                                {/* ===========================
                                   SOLAR
                                ============================ */}

                                {sample.type === "solar" && (

                                    <>

                                        <RevenueRow
                                            title="Capacity (MW)"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.capacity_mw
                                            )}
                                        />

                                        <RevenueRow
                                            title="Operating Hours"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.operating_hours
                                            )}
                                        />

                                        <RevenueRow
                                            title="CUF (%)"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.cuf
                                            )}
                                        />

                                        <RevenueRow
                                            title="Generation (kWh)"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.generation
                                            )}
                                        />

                                        <RevenueRow
                                            title="Tariff"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.tariff
                                            )}
                                        />

                                        <RevenueRow
                                            title="Energy Revenue"
                                            blue
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.revenue
                                            )}
                                        />

                                    </>

                                )}

                                {/* ===========================
                                   HOTEL
                                ============================ */}

                                {sample.type === "hotel" && (

                                    <>

                                        <RevenueRow
                                            title="Rooms"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.rooms
                                            )}
                                        />

                                        <RevenueRow
                                            title="Occupancy %"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.occupancy
                                            )}
                                        />

                                        <RevenueRow
                                            title="ADR"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.adr
                                            )}
                                        />

                                        <RevenueRow
                                            title="Occupied Room Nights"
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.occupied_room_nights
                                            )}
                                        />

                                        <RevenueRow
                                            title="Room Revenue"
                                            blue
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.room_revenue
                                            )}
                                        />

                                        <RevenueRow
                                            title="Food Revenue"
                                            blue
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.food_revenue
                                            )}
                                        />

                                        <RevenueRow
                                            title="Banquet Revenue"
                                            blue
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.banquet_revenue
                                            )}
                                        />

                                        <RevenueRow
                                            title="Spa Revenue"
                                            blue
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.spa_revenue
                                            )}
                                        />

                                        <RevenueRow
                                            title="Other Revenue"
                                            blue
                                            values={projection.map(
                                                p =>
                                                    p.revenue_breakdown[key]?.other_revenue
                                            )}
                                        />

                                    </>

                                )}
                                {/* ===========================
                                    COGS
                                    ============================ */}

                                    {firstRevenueYear.cogs_breakdown &&
                                        Object.keys(firstRevenueYear.cogs_breakdown).length > 0 && (

                                        <>

                                            <tr className="statement-section-header">
                                                <td colSpan={years.length + 1}>
                                                    COST OF GOODS SOLD
                                                </td>
                                            </tr>

                                            {Object.keys(
                                                firstRevenueYear.cogs_breakdown
                                            ).map(cogsKey => {

                                                const sampleCOGS =
                                                    firstRevenueYear.cogs_breakdown[cogsKey];

                                                return (
                                                    <React.Fragment key={cogsKey}>

                                                        {/* COGS ITEM NAME */}

                                                        <tr className="statement-section-subheader">

                                                            <td colSpan={years.length + 1}>
                                                                {cogsKey.toUpperCase()}
                                                            </td>

                                                        </tr>


                                                        {/* =====================
                                                        SOLAR VARIABLE COGS
                                                        ====================== */}

                                                        {sampleCOGS.type === "variable" &&
                                                            sample.type === "solar" && (

                                                            <>

                                                                <RevenueRow
                                                                    title="Generation (kWh)"
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.generation ?? 0
                                                                    )}
                                                                />

                                                                <RevenueRow
                                                                    title="Cost / kWh"
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.cost_per_kwh ?? 0
                                                                    )}
                                                                />

                                                                <RevenueRow
                                                                    title="Variable COGS"
                                                                    blue
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.cost ?? 0
                                                                    )}
                                                                />

                                                            </>
                                                        )}


                                                        {/* =====================
                                                        HOTEL VARIABLE COGS
                                                        ====================== */}

                                                        {sampleCOGS.type === "variable" &&
                                                            sample.type === "hotel" && (

                                                            <>

                                                                <RevenueRow
                                                                    title="Occupied Room Nights"
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.occupied_room_nights ?? 0
                                                                    )}
                                                                />

                                                                <RevenueRow
                                                                    title="Cost / Room"
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.cost_per_room ?? 0
                                                                    )}
                                                                />

                                                                <RevenueRow
                                                                    title="Variable COGS"
                                                                    blue
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.cost ?? 0
                                                                    )}
                                                                />

                                                            </>
                                                        )}


                                                        {/* =====================
                                                        FIXED COGS
                                                        ====================== */}

                                                        {sampleCOGS.type === "fixed" && (

                                                            <>

                                                                <RevenueRow
                                                                    title="Base Amount"
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.amount ?? 0
                                                                    )}
                                                                />

                                                                <RevenueRow
                                                                    title="Growth (%)"
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.growth_rate ?? 0
                                                                    )}
                                                                />

                                                                <RevenueRow
                                                                    title="Fixed COGS"
                                                                    blue
                                                                    values={projection.map(
                                                                        p =>
                                                                            p.cogs_breakdown
                                                                                ?. [cogsKey]
                                                                                ?.cost ?? 0
                                                                    )}
                                                                />

                                                            </>
                                                        )}

                                                    </React.Fragment>
                                                );

                                            })}


                                            {/* TOTAL COGS */}

                                            <RevenueRow
                                                title="Total COGS"
                                                blue
                                                values={projection.map(
                                                    p => p.cogs ?? 0
                                                )}
                                            />

                                        </>
                                    )}

                                
                            </React.Fragment>

                        );

                    })}

                    <tr className="statement-total">

                        <td>
                            TOTAL REVENUE
                        </td>

                        {projection.map((p, i) => (

                            <td key={i}>
                                {Number(
                                    p.revenue
                                ).toLocaleString()}
                            </td>

                        ))}

                    </tr>

                </tbody>

            </table>

        </div>

    );

}