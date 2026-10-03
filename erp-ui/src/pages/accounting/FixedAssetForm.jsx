import React, { useState } from "react";
import { createFixedAsset } from "../../services/api";

export default function FixedAssetForm({ onCreated, onCancel }) {

    const [form, setForm] = useState({
        asset_code: "",
        asset_name: "",
        purchase_cost: "",
        purchase_date: "",
        depreciation_method: "SLM",
        depreciation_rate: "",
        useful_life_months: "",
        salvage_value: "0",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!form.asset_code.trim()) {
            setError("Asset code is required.");
            return;
        }


        if (!form.asset_name.trim()) {
            setError("Asset name is required.");
            return;
        }


        if (Number(form.purchase_cost) <= 0) {
            setError("Purchase cost must be greater than zero.");
            return;
        }


        if (!form.purchase_date) {
            setError("Purchase date is required.");
            return;
        }


        if (Number(form.depreciation_rate) < 0) {
            setError("Depreciation rate cannot be negative.");
            return;
        }


        if (
            form.useful_life_months &&
            Number(form.useful_life_months) <= 0
        ) {
            setError("Useful life must be greater than zero.");
            return;
        }


        if (
            Number(form.salvage_value) < 0 ||
            Number(form.salvage_value) >= Number(form.purchase_cost)
        ) {
            setError(
                "Salvage value must be less than purchase cost."
            );
            return;
        }


        try {

            setLoading(true);

            const payload = {
                asset_code: form.asset_code.trim(),
                asset_name: form.asset_name.trim(),
                purchase_cost: Number(form.purchase_cost),
                purchase_date: form.purchase_date,
                depreciation_method: form.depreciation_method,
                depreciation_rate: Number(form.depreciation_rate),
                useful_life_months:
                    form.useful_life_months
                        ? Number(form.useful_life_months)
                        : null,
                salvage_value:
                    Number(form.salvage_value || 0),
            };


            const created =
                await createFixedAsset(payload);


            if (onCreated) {
                onCreated(created);
            }

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to create fixed asset."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="asset-form-card">

            <div className="asset-form-header">

                <div>

                    <div className="page-eyebrow">
                        ACCOUNTING
                    </div>

                    <h1>
                        Add Fixed Asset
                    </h1>

                    <p>
                        Create a fixed asset and generate its
                        depreciation schedule.
                    </p>

                </div>


                <button
                    type="button"
                    className="secondary-btn"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>

            </div>


            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            <form onSubmit={handleSubmit}>

                <div className="form-grid">


                    {/* ASSET CODE */}

                    <div className="form-group">

                        <label>
                            Asset Code
                        </label>

                        <input
                            type="text"
                            name="asset_code"
                            value={form.asset_code}
                            onChange={handleChange}
                            placeholder="FA-001"
                        />

                    </div>


                    {/* ASSET NAME */}

                    <div className="form-group">

                        <label>
                            Asset Name
                        </label>

                        <input
                            type="text"
                            name="asset_name"
                            value={form.asset_name}
                            onChange={handleChange}
                            placeholder="CNC Machine - Bay 2"
                        />

                    </div>


                    {/* PURCHASE COST */}

                    <div className="form-group">

                        <label>
                            Purchase Cost
                        </label>

                        <input
                            type="number"
                            name="purchase_cost"
                            value={form.purchase_cost}
                            onChange={handleChange}
                            placeholder="840000"
                            min="0"
                            step="0.01"
                        />

                    </div>


                    {/* PURCHASE DATE */}

                    <div className="form-group">

                        <label>
                            Purchase Date
                        </label>

                        <input
                            type="date"
                            name="purchase_date"
                            value={form.purchase_date}
                            onChange={handleChange}
                        />

                    </div>


                    {/* DEPRECIATION METHOD */}

                    <div className="form-group">

                        <label>
                            Depreciation Method
                        </label>

                        <select
                            name="depreciation_method"
                            value={form.depreciation_method}
                            onChange={handleChange}
                        >

                            <option value="SLM">
                                Straight Line Method
                            </option>

                            <option value="WDV">
                                Written Down Value
                            </option>

                        </select>

                    </div>


                    {/* RATE */}

                    <div className="form-group">

                        <label>
                            Depreciation Rate (%)
                        </label>

                        <input
                            type="number"
                            name="depreciation_rate"
                            value={form.depreciation_rate}
                            onChange={handleChange}
                            placeholder="15"
                            min="0"
                            step="0.01"
                        />

                    </div>


                    {/* USEFUL LIFE */}

                    <div className="form-group">

                        <label>
                            Useful Life (Months)
                        </label>

                        <input
                            type="number"
                            name="useful_life_months"
                            value={form.useful_life_months}
                            onChange={handleChange}
                            placeholder="120"
                            min="1"
                        />

                    </div>


                    {/* SALVAGE VALUE */}

                    <div className="form-group">

                        <label>
                            Salvage Value
                        </label>

                        <input
                            type="number"
                            name="salvage_value"
                            value={form.salvage_value}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />

                    </div>

                </div>


                <div className="asset-form-actions">

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating..."
                            : "Create Fixed Asset"}

                    </button>

                </div>

            </form>

        </div>
    );
}