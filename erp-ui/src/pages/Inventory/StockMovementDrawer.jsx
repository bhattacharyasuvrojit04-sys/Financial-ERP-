import { useState } from "react";
import { X, Package, Save } from "lucide-react";

import {
    createStockMovement,
} from "../../api/inventoryApi";

import "./StockMovementDrawer.css";


export default function StockMovementDrawer({
    products,
    onClose,
    onSaved,
}) {

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    const [form, setForm] = useState({

        product_id:
            products.length > 0
                ? products[0].id
                : "",

        movement_type: "PURCHASE",

        quantity: 1,

        unit_cost: 0,

        reference_type: "PURCHASE",

        reference_id: "",

        movement_date:
            new Date()
                .toISOString()
                .slice(0, 16),

        notes: "",

    });


    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setForm(prev => ({

            ...prev,

            [name]:

    name === "quantity"
        ? value === ""
            ? ""
            : parseInt(value, 10)

        : [
            "product_id",
            "unit_cost",
            "reference_id",
        ].includes(name)

            ? value === ""
                ? ""
                : Number(value)

            : value,

        }));

    };


    const handleTypeChange = (e) => {

        const type = e.target.value;

        let referenceType = "PURCHASE";

        if (
            type === "SALE" ||
            type === "OUTWARD" ||
            type === "OUT"
        ) {
            referenceType = "SALES_INVOICE";
        }

        if (type === "ADJUSTMENT") {
            referenceType = "ADJUSTMENT";
        }


        setForm(prev => ({

            ...prev,

            movement_type: type,

            reference_type: referenceType,

        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!form.product_id) {

            setError(
                "Please select a product."
            );

            return;
        }


        if (!form.quantity || form.quantity <= 0) {

            setError(
                "Quantity must be greater than zero."
            );

            return;
        }


        try {

            setSaving(true);


            const payload = {

                product_id:
                    Number(form.product_id),

                movement_type:
                    form.movement_type,

                quantity:
                    Number(form.quantity),

                unit_cost:
                    Number(form.unit_cost || 0),

                reference_type:
                    form.reference_type || null,

                reference_id:
                    form.reference_id
                        ? Number(form.reference_id)
                        : null,

                movement_date:
                    form.movement_date
                        ? new Date(
                            form.movement_date
                        ).toISOString()
                        : null,

                notes:
                    form.notes || null,

            };


            await createStockMovement(
                payload
            );


            onSaved();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to create stock movement."
            );

        } finally {

            setSaving(false);

        }

    };


    return (

        <div className="movement-overlay">

            <div className="movement-drawer">

                {/* HEADER */}

                <div className="movement-drawer-header">

                    <div>

                        <div className="movement-drawer-title">

                            <div className="movement-drawer-icon">
                                <Package size={20} />
                            </div>

                            <div>

                                <h2>
                                    Stock Movement
                                </h2>

                                <p>
                                    Record inventory movement
                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        className="movement-close-btn"
                        onClick={onClose}
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* FORM */}

                <form
                    className="movement-form"
                    onSubmit={handleSubmit}
                >

                    {error && (

                        <div className="movement-form-error">
                            {error}
                        </div>

                    )}


                    {/* MOVEMENT TYPE */}

                    <div className="movement-field">

                        <label>
                            Movement Type
                        </label>

                        <select
                            name="movement_type"
                            value={form.movement_type}
                            onChange={handleTypeChange}
                        >

                            <option value="PURCHASE">
                                Purchase / Inward
                            </option>

                            <option value="SALE">
                                Sale / Outward
                            </option>

                            <option value="ADJUSTMENT">
                                Adjustment
                            </option>

                        </select>

                    </div>


                    {/* PRODUCT */}

                    <div className="movement-field">

                        <label>
                            Product
                        </label>

                        <select
                            name="product_id"
                            value={form.product_id}
                            onChange={handleChange}
                        >

                            {products.length === 0 ? (

                                <option value="">
                                    No products available
                                </option>

                            ) : (

                                products.map(product => (

                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >

                                        {product.sku}
                                        {" — "}
                                        {product.name}

                                    </option>

                                ))

                            )}

                        </select>

                    </div>


                    {/* QUANTITY + COST */}

                    <div className="movement-two-column">

                        <div className="movement-field">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                step="1"
                                value={form.quantity}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="movement-field">

                            <label>
                                Unit Cost
                            </label>

                            <input
                                type="number"
                                name="unit_cost"
                                min="0"
                                step="0.01"
                                value={form.unit_cost}
                                onChange={handleChange}
                                placeholder="₹ 0.00"
                            />

                        </div>

                    </div>


                    {/* DATE */}

                    <div className="movement-field">

                        <label>
                            Movement Date
                        </label>

                        <input
                            type="datetime-local"
                            name="movement_date"
                            value={form.movement_date}
                            onChange={handleChange}
                        />

                    </div>


                    {/* REFERENCE */}

                    <div className="movement-two-column">

                        <div className="movement-field">

                            <label>
                                Reference Type
                            </label>

                            <input
                                type="text"
                                name="reference_type"
                                value={form.reference_type}
                                onChange={handleChange}
                                placeholder="PURCHASE"
                            />

                        </div>


                        <div className="movement-field">

                            <label>
                                Reference ID
                            </label>

                            <input
                                type="number"
                                name="reference_id"
                                value={form.reference_id}
                                onChange={handleChange}
                                placeholder="1001"
                            />

                        </div>

                    </div>


                    {/* NOTES */}

                    <div className="movement-field">

                        <label>
                            Notes
                        </label>

                        <textarea
                            name="notes"
                            rows="4"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Enter notes about this stock movement..."
                        />

                    </div>


                    {/* PREVIEW */}

                    <div className="movement-preview">

                        <div>

                            <span>
                                Quantity
                            </span>

                            <strong>
                                {Number(form.quantity || 0).toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Movement Value
                            </span>

                            <strong>
                                ₹
                                {(
                                    Number(form.quantity || 0) *
                                    Number(form.unit_cost || 0)
                                ).toLocaleString("en-IN")}
                            </strong>

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="movement-drawer-footer">

                        <button
                            type="button"
                            className="movement-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="movement-save-btn"
                            disabled={saving}
                        >

                            <Save size={17} />

                            {saving
                                ? "Saving..."
                                : "Save Movement"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}