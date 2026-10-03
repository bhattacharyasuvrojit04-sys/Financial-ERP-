import React, { useEffect, useState } from "react";
import {
    getFixedAssets,
    getAssetSchedule,
    postDepreciationJournal,
} from "../../services/api";

import "./AccountingAssetStyles.css";


const formatCurrency = (value) => {

    const number = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(number);
};


const formatDate = (value) => {

    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


export default function Depreciation() {

    const [assets, setAssets] = useState([]);

    const [depreciationRows, setDepreciationRows] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [postingId, setPostingId] = useState(null);


    const loadDepreciation = async () => {

        setLoading(true);
        setError("");

        try {

            const data = await getFixedAssets();

            const assetList =
                Array.isArray(data)
                    ? data
                    : data?.assets || [];

            setAssets(assetList);


            const rows = [];


            for (const asset of assetList) {

                try {

                    const schedule =
                        await getAssetSchedule(asset.id);

                    const scheduleRows =
                        Array.isArray(schedule)
                            ? schedule
                            : schedule?.schedule || [];

                    scheduleRows.forEach((row) => {

                        rows.push({
                            ...row,
                            asset_id: asset.id,
                            asset_code: asset.asset_code,
                            asset_name: asset.asset_name,
                        });

                    });

                } catch (scheduleError) {

                    console.error(
                        `Failed to load schedule for asset ${asset.id}`,
                        scheduleError
                    );

                }
            }


            setDepreciationRows(rows);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load depreciation."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadDepreciation();
    }, []);


    const pendingRows =
        depreciationRows.filter(
            (row) => row.status !== "posted"
        );


    const postedRows =
        depreciationRows.filter(
            (row) => row.status === "posted"
        );


    const pendingAmount =
        pendingRows.reduce(
            (sum, row) =>
                sum +
                Number(row.depreciation_amount || 0),
            0
        );


    const postedAmount =
        postedRows.reduce(
            (sum, row) =>
                sum +
                Number(row.depreciation_amount || 0),
            0
        );


    const handlePost = async (row) => {

        if (!row.id) {
            return;
        }


        const confirmed =
            window.confirm(
                `Post depreciation journal for ${row.asset_name} for ${formatDate(row.period)}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setPostingId(row.id);

            await postDepreciationJournal(row.id);

            await loadDepreciation();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to post depreciation journal."
            );

        } finally {

            setPostingId(null);
        }
    };


    return (

        <div className="asset-page">

            {/* HEADER */}

            <div className="asset-page-header">

                <div>

                    <div className="page-eyebrow">
                        ACCOUNTING
                    </div>

                    <h1>
                        Depreciation
                    </h1>

                    <p>
                        Review depreciation schedules and post
                        depreciation journal vouchers.
                    </p>

                </div>


                <button
                    className="refresh-btn"
                    onClick={loadDepreciation}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* SUMMARY */}

            <div className="asset-summary-grid">

                <div className="asset-summary-card">

                    <span className="summary-label">
                        Fixed Assets
                    </span>

                    <strong>
                        {assets.length}
                    </strong>

                </div>


                <div className="asset-summary-card">

                    <span className="summary-label">
                        Pending Entries
                    </span>

                    <strong>
                        {pendingRows.length}
                    </strong>

                </div>


                <div className="asset-summary-card">

                    <span className="summary-label">
                        Pending Depreciation
                    </span>

                    <strong>
                        {formatCurrency(pendingAmount)}
                    </strong>

                </div>


                <div className="asset-summary-card">

                    <span className="summary-label">
                        Posted Depreciation
                    </span>

                    <strong>
                        {formatCurrency(postedAmount)}
                    </strong>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="asset-error">
                    {error}
                </div>

            )}


            {/* LOADING */}

            {loading ? (

                <div className="asset-loading">
                    Loading depreciation schedules...
                </div>

            ) : depreciationRows.length === 0 ? (

                <div className="asset-empty">

                    <div className="empty-icon">
                        DP
                    </div>

                    <h3>
                        No depreciation schedules
                    </h3>

                    <p>
                        Create a fixed asset first to generate
                        its depreciation schedule.
                    </p>

                </div>

            ) : (

                <div className="asset-table-card">

                    <div className="table-card-header">

                        <div>

                            <h2>
                                Depreciation Entries
                            </h2>

                            <span>
                                {depreciationRows.length} schedule
                                {depreciationRows.length !== 1
                                    ? "s"
                                    : ""}
                            </span>

                        </div>

                    </div>


                    <div className="asset-table-wrapper">

                        <table className="asset-table">

                            <thead>

                                <tr>

                                    <th>
                                        Asset
                                    </th>

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
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {depreciationRows.map(
                                    (row) => (

                                        <tr key={row.id}>

                                            <td>

                                                <div className="asset-name-cell">

                                                    <div className="asset-icon">
                                                        FA
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {row.asset_name}
                                                        </strong>

                                                        <span>
                                                            {row.asset_code}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {formatDate(
                                                    row.period
                                                )}
                                            </td>


                                            <td>
                                                {formatCurrency(
                                                    row.opening_wdv
                                                )}
                                            </td>


                                            <td>
                                                {formatCurrency(
                                                    row.depreciation_amount
                                                )}
                                            </td>


                                            <td>
                                                {formatCurrency(
                                                    row.closing_wdv
                                                )}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        row.status === "posted"
                                                            ? "status-badge"
                                                            : "status-badge active"
                                                    }
                                                >
                                                    {row.status === "posted"
                                                        ? "Posted"
                                                        : "Due"}
                                                </span>

                                            </td>


                                            <td>

                                                {row.status === "posted" ? (

                                                    <span className="posted-label">
                                                        Journal Posted
                                                    </span>

                                                ) : (

                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            handlePost(row)
                                                        }
                                                        disabled={
                                                            postingId === row.id
                                                        }
                                                    >

                                                        {postingId === row.id
                                                            ? "Posting..."
                                                            : "Post Journal Voucher"}

                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}