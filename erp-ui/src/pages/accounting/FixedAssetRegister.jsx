import React, { useEffect, useState } from "react";
import {
    getFixedAssets
} from "../../services/api";

import FixedAssetForm from "./FixedAssetForm";

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


export default function FixedAssetRegister() {

    const [assets, setAssets] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [selectedAsset, setSelectedAsset] =
        useState(null);


    const loadAssets = async () => {

        setLoading(true);

        setError("");

        try {

            const data = await getFixedAssets();

            const assetList =
                Array.isArray(data)
                    ? data
                    : data?.assets || [];

            setAssets(assetList);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load fixed assets."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadAssets();
    }, []);


    const handleCreated = async () => {

        setShowForm(false);

        await loadAssets();
    };


    if (showForm) {

        return (
            <FixedAssetForm
                onCreated={handleCreated}
                onCancel={() => setShowForm(false)}
            />
        );
    }


    return (
        <div className="asset-page">

            {/* HEADER */}

            <div className="asset-page-header">

                <div>

                    <div className="page-eyebrow">
                        ACCOUNTING
                    </div>

                    <h1>
                        Fixed Asset Register
                    </h1>

                    <p>
                        Manage fixed assets, depreciation
                        and asset schedules.
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={() => setShowForm(true)}
                >
                    + New Fixed Asset
                </button>

            </div>


            {/* SUMMARY */}

            <div className="asset-summary-grid">

                <div className="asset-summary-card">

                    <span className="summary-label">
                        Total Assets
                    </span>

                    <strong>
                        {assets.length}
                    </strong>

                </div>


                <div className="asset-summary-card">

                    <span className="summary-label">
                        Gross Asset Value
                    </span>

                    <strong>
                        {formatCurrency(
                            assets.reduce(
                                (sum, asset) =>
                                    sum +
                                    Number(
                                        asset.purchase_cost || 0
                                    ),
                                0
                            )
                        )}
                    </strong>

                </div>


                <div className="asset-summary-card">

                    <span className="summary-label">
                        Active Assets
                    </span>

                    <strong>
                        {
                            assets.filter(
                                asset =>
                                    asset.status === "active"
                            ).length
                        }
                    </strong>

                </div>


                <div className="asset-summary-card">

                    <span className="summary-label">
                        Pending Depreciation
                    </span>

                    <strong>
                        {
                            assets.reduce(
                                (sum, asset) =>
                                    sum +
                                    Number(
                                        asset.pending_depreciation || 0
                                    ),
                                0
                            ) > 0
                                ? formatCurrency(
                                    assets.reduce(
                                        (sum, asset) =>
                                            sum +
                                            Number(
                                                asset.pending_depreciation || 0
                                            ),
                                        0
                                    )
                                )
                                : "₹0"
                        }
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
                    Loading fixed assets...
                </div>

            ) : assets.length === 0 ? (

                <div className="asset-empty">

                    <div className="empty-icon">
                        FA
                    </div>

                    <h3>
                        No fixed assets yet
                    </h3>

                    <p>
                        Add your first fixed asset to start
                        generating depreciation schedules.
                    </p>

                    <button
                        className="primary-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Fixed Asset
                    </button>

                </div>

            ) : (

                <div className="asset-table-card">

                    <div className="table-card-header">

                        <div>
                            <h2>
                                Assets
                            </h2>

                            <span>
                                {assets.length} registered asset
                                {assets.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <button
                            className="refresh-btn"
                            onClick={loadAssets}
                        >
                            ↻ Refresh
                        </button>

                    </div>


                    <div className="asset-table-wrapper">

                        <table className="asset-table">

                            <thead>

                                <tr>

                                    <th>
                                        Asset Code
                                    </th>

                                    <th>
                                        Asset Name
                                    </th>

                                    <th>
                                        Purchase Cost
                                    </th>

                                    <th>
                                        Purchase Date
                                    </th>

                                    <th>
                                        Method
                                    </th>

                                    <th>
                                        Rate
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

                                {assets.map((asset) => (

                                    <tr
                                        key={asset.id}
                                    >

                                        <td>

                                            <span className="asset-code">
                                                {asset.asset_code}
                                            </span>

                                        </td>


                                        <td>

                                            <div className="asset-name-cell">

                                                <div className="asset-icon">
                                                    FA
                                                </div>

                                                <div>

                                                    <strong>
                                                        {asset.asset_name}
                                                    </strong>

                                                    {asset.asset_category && (
                                                        <span>
                                                            {
                                                                asset.asset_category
                                                            }
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                        </td>


                                        <td>
                                            {formatCurrency(
                                                asset.purchase_cost
                                            )}
                                        </td>


                                        <td>
                                            {formatDate(
                                                asset.purchase_date
                                            )}
                                        </td>


                                        <td>

                                            <span className="method-badge">

                                                {
                                                    asset.depreciation_method
                                                }

                                            </span>

                                        </td>


                                        <td>
                                            {
                                                asset.depreciation_rate
                                            }%
                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    asset.status === "active"
                                                        ? "status-badge active"
                                                        : "status-badge"
                                                }
                                            >

                                                {asset.status ||
                                                    "active"}

                                            </span>

                                        </td>


                                        <td>

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    setSelectedAsset(
                                                        asset
                                                    )
                                                }
                                            >
                                                View Schedule
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}


            {/* SCHEDULE MODAL */}

            {selectedAsset && (

                <div className="asset-modal-overlay">

                    <div className="asset-modal">

                        <div className="asset-modal-header">

                            <div>

                                <span>
                                    {selectedAsset.asset_code}
                                </span>

                                <h2>
                                    {selectedAsset.asset_name}
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedAsset(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="asset-modal-body">

                            <div className="asset-detail-grid">

                                <div>
                                    <span>
                                        Purchase Cost
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedAsset.purchase_cost
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Purchase Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedAsset.purchase_date
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Method
                                    </span>

                                    <strong>
                                        {
                                            selectedAsset.depreciation_method
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Rate
                                    </span>

                                    <strong>
                                        {
                                            selectedAsset.depreciation_rate
                                        }%
                                    </strong>
                                </div>

                            </div>


                            <a
                                className="schedule-open-btn"
                                href={`/depreciation-schedule/${selectedAsset.id}`}
                            >
                                Open Depreciation Schedule →
                            </a>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}