import React, { useEffect, useState } from "react";

import {
    getAssetSchedule,
    postDepreciationJournal
} from "../../services/api";

import "./AccountingAssetStyles.css";


const formatCurrency = (value) => {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};


const formatDate = (value) => {

    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};


export default function DepreciationSchedule({
    assetId
}) {

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [postingId, setPostingId] = useState(null);


    const loadSchedule = async () => {

        if (!assetId) return;

        setLoading(true);

        setError("");

        try {

            const result =
                await getAssetSchedule(assetId);

            setData(result);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load depreciation schedule."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadSchedule();

    }, [assetId]);


    const handlePost = async (scheduleId) => {

        const confirmed =
            window.confirm(
                "Post this month's depreciation journal voucher?"
            );

        if (!confirmed) {
            return;
        }


        setPostingId(scheduleId);

        setError("");


        try {

            await postDepreciationJournal(
                scheduleId
            );

            await loadSchedule();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to post depreciation."
            );

        } finally {

            setPostingId(null);
        }
    };


    if (loading) {

        return (
            <div className="asset-loading">
                Loading depreciation schedule...
            </div>
        );
    }


    if (error) {

        return (
            <div className="asset-error">
                {error}
            </div>
        );
    }


    if (!data) {
        return null;
    }


    const asset =
        data.asset || data;

    const schedule =
        data.schedule ||
        data.rows ||
        [];


    const dueRows =
        schedule.filter(
            row => row.status === "due"
        );


    const postedRows =
        schedule.filter(
            row => row.status === "posted"
        );


    return (

        <div className="asset-page">

            {/* HEADER */}

            <div className="asset-page-header">

                <div>

                    <div className="page-eyebrow">
                        FIXED ASSETS
                    </div>

                    <h1>
                        Depreciation Schedule
                    </h1>

                    <p>
                        {asset.asset_name}
                        {" · "}
                        {asset.asset_code}
                    </p>

                </div>


                <button
                    className="secondary-btn"
                    onClick={() =>
                        window.history.back()
                    }
                >
                    ← Back
                </button>

            </div>


            {/* ASSET SUMMARY */}

            <div className="depreciation-summary">

                <div className="depreciation-asset-info">

                    <div className="large-asset-icon">
                        FA
                    </div>


                    <div>

                        <span className="asset-code">
                            {asset.asset_code}
                        </span>

                        <h2>
                            {asset.asset_name}
                        </h2>

                        <p>
                            {asset.depreciation_method}
                            {" · "}
                            {asset.depreciation_rate}%
                            annual rate
                        </p>

                    </div>

                </div>


                <div className="depreciation-metrics">

                    <div>

                        <span>
                            Purchase Cost
                        </span>

                        <strong>
                            {formatCurrency(
                                asset.purchase_cost
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Posted Months
                        </span>

                        <strong>
                            {postedRows.length}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Pending Months
                        </span>

                        <strong className={
                            dueRows.length > 0
                                ? "pending-value"
                                : ""
                        }>
                            {dueRows.length}
                        </strong>

                    </div>

                </div>

            </div>


            {/* INFO */}

            <div className="depreciation-info">

                <div className="info-icon">
                    i
                </div>

                <div>

                    <strong>
                        Depreciation posting requires approval
                    </strong>

                    <p>
                        The schedule is generated automatically,
                        but depreciation is not posted to the
                        accounting ledger until you click
                        <b> Post Journal Voucher</b>.
                    </p>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="asset-error">
                    {error}
                </div>
            )}


            {/* TABLE */}

            <div className="asset-table-card">

                <div className="table-card-header">

                    <div>

                        <h2>
                            Monthly Depreciation
                        </h2>

                        <span>
                            {schedule.length} periods
                        </span>

                    </div>


                    <button
                        className="refresh-btn"
                        onClick={loadSchedule}
                    >
                        ↻ Refresh
                    </button>

                </div>


                <div className="asset-table-wrapper">

                    <table className="asset-table depreciation-table">

                        <thead>

                            <tr>

                                <th>
                                    Period
                                </th>

                                <th>
                                    Opening WDV
                                </th>

                                <th>
                                    Depreciation
                                </th>

                                <th>
                                    Closing WDV
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Journal
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {schedule.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="table-empty"
                                    >
                                        No depreciation schedule
                                        available.
                                    </td>

                                </tr>

                            ) : (

                                schedule.map((row) => (

                                    <tr
                                        key={row.id}
                                    >

                                        <td>

                                            <strong>
                                                {formatDate(
                                                    row.period
                                                )}
                                            </strong>

                                        </td>


                                        <td>
                                            {formatCurrency(
                                                row.opening_wdv
                                            )}
                                        </td>


                                        <td>

                                            <strong>
                                                {formatCurrency(
                                                    row.depreciation_amount
                                                )}
                                            </strong>

                                        </td>


                                        <td>
                                            {formatCurrency(
                                                row.closing_wdv
                                            )}
                                        </td>


                                        <td>

                                            {row.status === "posted" ? (

                                                <span className="status-badge posted">
                                                    Posted
                                                </span>

                                            ) : (

                                                <span className="status-badge due">
                                                    Due
                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            {row.status === "posted" ? (

                                                <span className="journal-posted">
                                                    ✓ Posted
                                                </span>

                                            ) : (

                                                <button
                                                    className="post-journal-btn"
                                                    disabled={
                                                        postingId === row.id
                                                    }
                                                    onClick={() =>
                                                        handlePost(row.id)
                                                    }
                                                >

                                                    {postingId === row.id
                                                        ? "Posting..."
                                                        : "Post Journal Voucher"
                                                    }

                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}