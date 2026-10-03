import { useEffect, useState } from "react";

import {
    createProduct,
    updateProduct
} from "../../api/mastersApi";

import "./CustomerDrawer.css";


const emptyProduct = {
    sku: "",
    name: "",
    description: "",
    category: "",
    unit: "Nos",
    purchase_price: 0,
    selling_price: 0,
    tax_rate: 0,
    inventory_account_id: "",
    purchase_account_id: "",
    sales_account_id: "",
    costing_method: "WEIGHTED_AVERAGE",
    reorder_level: 0
};


export default function ProductDrawer({
    isOpen,
    onClose,
    product = null,
    onSaved
}) {

    const [form, setForm] = useState(emptyProduct);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const isEdit = Boolean(product);


    // =========================================================
    // LOAD PRODUCT INTO FORM
    // =========================================================

    useEffect(() => {

        if (product) {

            setForm({

                sku: product.sku || "",

                name: product.name || "",

                description: product.description || "",

                category: product.category || "",

                unit: product.unit || "Nos",

                purchase_price:
                    product.purchase_price ?? 0,

                selling_price:
                    product.selling_price ?? 0,

                tax_rate:
                    product.tax_rate ?? 0,

                inventory_account_id:
                    product.inventory_account_id ?? "",

                purchase_account_id:
                    product.purchase_account_id ?? "",

                sales_account_id:
                    product.sales_account_id ?? "",

                /*
                 * Important:
                 * When editing an existing product,
                 * load its existing costing method.
                 *
                 * If older products don't have one,
                 * default to Weighted Average.
                 */
                costing_method:
                    product.costing_method || "WEIGHTED_AVERAGE",

                reorder_level:
                    product.reorder_level ?? 0

            });

        } else {

            setForm({
                ...emptyProduct
            });

        }

        setError("");

    }, [product, isOpen]);


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        // =====================================================
        // VALIDATION
        // =====================================================

        if (!form.sku.trim()) {

            setError("SKU is required.");

            return;

        }


        if (!form.name.trim()) {

            setError("Product name is required.");

            return;

        }


        if (Number(form.purchase_price) < 0) {

            setError("Purchase price cannot be negative.");

            return;

        }


        if (Number(form.selling_price) < 0) {

            setError("Selling price cannot be negative.");

            return;

        }


        if (
            Number(form.tax_rate) < 0 ||
            Number(form.tax_rate) > 100
        ) {

            setError("Tax rate must be between 0 and 100.");

            return;

        }


        if (Number(form.reorder_level) < 0) {

            setError("Reorder level cannot be negative.");

            return;

        }


        // =====================================================
        // COSTING METHOD VALIDATION
        // =====================================================

        const allowedCostingMethods = [
            "WEIGHTED_AVERAGE",
            "FIFO"
        ];

        if (
            !allowedCostingMethods.includes(
                form.costing_method
            )
        ) {

            setError(
                "Costing method must be Weighted Average or FIFO."
            );

            return;

        }


        try {

            setSaving(true);


            // =================================================
            // BUILD PAYLOAD
            // =================================================

            const payload = {

                sku:
                    form.sku.trim(),

                name:
                    form.name.trim(),

                description:
                    form.description.trim() || null,

                category:
                    form.category.trim() || null,

                unit:
                    form.unit.trim() || "Nos",

                purchase_price:
                    Number(form.purchase_price),

                selling_price:
                    Number(form.selling_price),

                tax_rate:
                    Number(form.tax_rate),

                inventory_account_id:
                    form.inventory_account_id
                        ? Number(form.inventory_account_id)
                        : null,

                purchase_account_id:
                    form.purchase_account_id
                        ? Number(form.purchase_account_id)
                        : null,

                sales_account_id:
                    form.sales_account_id
                        ? Number(form.sales_account_id)
                        : null,

                /*
                 * This is the important field.
                 *
                 * FIFO
                 * OR
                 * WEIGHTED_AVERAGE
                 */
                costing_method:
                    form.costing_method,

                reorder_level:
                    Number(form.reorder_level)

            };


            let response;


            // =================================================
            // CREATE / UPDATE
            // =================================================

            if (isEdit) {

                response = await updateProduct(
                    product.id,
                    payload
                );

            } else {

                response = await createProduct(
                    payload
                );

            }


            // =================================================
            // SUCCESS
            // =================================================

            if (onSaved) {

                onSaved(response);

            }

            onClose();


        } catch (err) {

            setError(
                err.message ||
                "Something went wrong."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // RENDER
    // =========================================================

    if (!isOpen) {

        return null;

    }


    return (

        <div className="drawer-overlay">


            <div className="customer-drawer">


                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="drawer-header">

                    <div>

                        <span className="drawer-eyebrow">

                            PRODUCT MASTER

                        </span>

                        <h2>

                            {isEdit
                                ? "Edit Product"
                                : "Add Product"
                            }

                        </h2>

                        <p>

                            {isEdit
                                ? "Update product information"
                                : "Create a new product or stock item"
                            }

                        </p>

                    </div>


                    <button
                        className="drawer-close"
                        onClick={onClose}
                        type="button"
                    >

                        ×

                    </button>

                </div>


                {/* =================================================
                    FORM
                ================================================== */}

                <form
                    className="customer-form"
                    onSubmit={handleSubmit}
                >


                    {/* =================================================
                        BASIC INFORMATION
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Basic Information

                        </div>


                        <div className="form-grid">


                            {/* SKU */}

                            <div className="form-field">

                                <label>

                                    SKU
                                    <span>*</span>

                                </label>

                                <input
                                    name="sku"
                                    value={form.sku}
                                    onChange={handleChange}
                                    disabled={isEdit}
                                    placeholder="LAP-DELL-5450"
                                />

                            </div>


                            {/* PRODUCT NAME */}

                            <div className="form-field">

                                <label>

                                    Product Name
                                    <span>*</span>

                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Dell Latitude 5450"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-field full">

                                <label>

                                    Description

                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="3"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        PRODUCT DETAILS
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Product Details

                        </div>


                        <div className="form-grid">


                            {/* CATEGORY */}

                            <div className="form-field">

                                <label>

                                    Category

                                </label>

                                <input
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="Electronics"
                                />

                            </div>


                            {/* UNIT */}

                            <div className="form-field">

                                <label>

                                    Unit

                                </label>

                                <select
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                >

                                    <option value="Nos">
                                        Nos
                                    </option>

                                    <option value="Kg">
                                        Kg
                                    </option>

                                    <option value="Gram">
                                        Gram
                                    </option>

                                    <option value="Litre">
                                        Litre
                                    </option>

                                    <option value="Meter">
                                        Meter
                                    </option>

                                    <option value="Box">
                                        Box
                                    </option>

                                    <option value="Pack">
                                        Pack
                                    </option>

                                    <option value="Set">
                                        Set
                                    </option>

                                </select>

                            </div>


                            {/* PURCHASE PRICE */}

                            <div className="form-field">

                                <label>

                                    Purchase Price

                                </label>

                                <div className="input-with-prefix">

                                    <span>₹</span>

                                    <input
                                        type="number"
                                        min="0"
                                        name="purchase_price"
                                        value={form.purchase_price}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            {/* SELLING PRICE */}

                            <div className="form-field">

                                <label>

                                    Selling Price

                                </label>

                                <div className="input-with-prefix">

                                    <span>₹</span>

                                    <input
                                        type="number"
                                        min="0"
                                        name="selling_price"
                                        value={form.selling_price}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            {/* TAX */}

                            <div className="form-field">

                                <label>

                                    Tax Rate

                                </label>

                                <div className="input-with-suffix">

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        name="tax_rate"
                                        value={form.tax_rate}
                                        onChange={handleChange}
                                    />

                                    <span>%</span>

                                </div>

                            </div>


                            {/* REORDER LEVEL */}

                            <div className="form-field">

                                <label>

                                    Reorder Level

                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="reorder_level"
                                    value={form.reorder_level}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        INVENTORY SETTINGS
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Inventory Settings

                        </div>


                        <div className="form-grid">


                            {/* =================================================
                                COSTING METHOD
                            ================================================== */}

                            <div className="form-field full">

                                <label>

                                    Costing Method

                                </label>


                                <select
                                    name="costing_method"
                                    value={form.costing_method}
                                    onChange={handleChange}
                                >

                                    <option value="WEIGHTED_AVERAGE">

                                        Weighted Average

                                    </option>

                                    <option value="FIFO">

                                        FIFO

                                    </option>

                                </select>


                                {/* METHOD DESCRIPTION */}

                                <div
                                    style={{
                                        marginTop: "8px",
                                        fontSize: "12px",
                                        color: "#6b7280",
                                        lineHeight: "1.5"
                                    }}
                                >

                                    {form.costing_method === "FIFO"

                                        ? "FIFO values inventory using the cost of the earliest stock purchased first."

                                        : "Weighted Average calculates inventory value using the average cost of available stock."

                                    }

                                </div>

                            </div>


                        </div>

                    </div>


                    {/* =================================================
                        ACCOUNTING MAPPING
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Accounting Mapping

                        </div>


                        <div className="form-grid">


                            {/* INVENTORY ACCOUNT */}

                            <div className="form-field">

                                <label>

                                    Inventory Account ID

                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="inventory_account_id"
                                    value={form.inventory_account_id}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />

                            </div>


                            {/* PURCHASE ACCOUNT */}

                            <div className="form-field">

                                <label>

                                    Purchase Account ID

                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="purchase_account_id"
                                    value={form.purchase_account_id}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />

                            </div>


                            {/* SALES ACCOUNT */}

                            <div className="form-field full">

                                <label>

                                    Sales Account ID

                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="sales_account_id"
                                    value={form.sales_account_id}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />

                            </div>


                        </div>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="form-error">

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        FOOTER
                    ================================================== */}

                    <div className="drawer-footer">

                        <button
                            type="button"
                            className="drawer-cancel"
                            onClick={onClose}
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="drawer-save"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : isEdit
                                    ? "Save Changes"
                                    : "Create Product"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

}