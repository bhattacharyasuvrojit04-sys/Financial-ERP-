import { useEffect, useState } from "react";

import {
    createSupplier,
    updateSupplier
} from "../../api/mastersApi";

import "./CustomerDrawer.css";


const emptySupplier = {
    supplier_code: "",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    state: "",
    state_code: "",
    pan: "",
    payment_terms: 0,
    credit_limit: 0,
    opening_balance: 0,
    opening_balance_type: "CREDIT"
};


export default function SupplierDrawer({
    isOpen,
    onClose,
    supplier = null,
    onSaved
}) {

    const [form, setForm] = useState(emptySupplier);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const isEdit = Boolean(supplier);


    // =========================================================
    // LOAD SUPPLIER INTO FORM
    // =========================================================

    useEffect(() => {

        if (supplier) {

            setForm({

                supplier_code:
                    supplier.supplier_code || "",

                name:
                    supplier.name || "",

                contact_person:
                    supplier.contact_person || "",

                phone:
                    supplier.phone || "",

                email:
                    supplier.email || "",

                address:
                    supplier.address || "",

                gstin:
                    supplier.gstin || "",

                state:
                    supplier.state || "",

                state_code:
                    supplier.state_code || "",

                pan:
                    supplier.pan || "",

                payment_terms:
                    supplier.payment_terms ?? 0,

                credit_limit:
                    supplier.credit_limit ?? 0,

                opening_balance:
                    supplier.opening_balance ?? 0,

                opening_balance_type:
                    supplier.opening_balance_type || "CREDIT"

            });

        } else {

            setForm({
                ...emptySupplier
            });

        }

        setError("");

    }, [supplier, isOpen]);


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


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!form.supplier_code.trim()) {

            setError("Supplier code is required.");

            return;

        }


        if (!form.name.trim()) {

            setError("Supplier name is required.");

            return;

        }


        if (Number(form.payment_terms) < 0) {

            setError("Payment terms cannot be negative.");

            return;

        }


        if (Number(form.credit_limit) < 0) {

            setError("Credit limit cannot be negative.");

            return;

        }


        if (Number(form.opening_balance) < 0) {

            setError("Opening balance cannot be negative.");

            return;

        }


        try {

            setSaving(true);


            const payload = {

                supplier_code:
                    form.supplier_code.trim(),

                name:
                    form.name.trim(),

                contact_person:
                    form.contact_person.trim() || null,

                phone:
                    form.phone.trim() || null,

                email:
                    form.email.trim() || null,

                address:
                    form.address.trim() || null,

                gstin:
                    form.gstin.trim() || null,

                state:
                    form.state.trim() || null,

                state_code:
                    form.state_code.trim() || null,

                pan:
                    form.pan.trim() || null,

                payment_terms:
                    Number(form.payment_terms),

                credit_limit:
                    Number(form.credit_limit),

                opening_balance:
                    Number(form.opening_balance),

                opening_balance_type:
                    form.opening_balance_type

            };


            let response;


            if (isEdit) {

                response = await updateSupplier(
                    supplier.id,
                    payload
                );

            } else {

                response = await createSupplier(
                    payload
                );

            }


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

                            SUPPLIER MASTER

                        </span>

                        <h2>

                            {isEdit
                                ? "Edit Supplier"
                                : "Add Supplier"
                            }

                        </h2>

                        <p>

                            {isEdit
                                ? "Update supplier information"
                                : "Create a new supplier account"
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


                            {/* SUPPLIER CODE */}

                            <div className="form-field">

                                <label>

                                    Supplier Code
                                    <span>*</span>

                                </label>

                                <input
                                    name="supplier_code"
                                    value={form.supplier_code}
                                    onChange={handleChange}
                                    disabled={isEdit}
                                    placeholder="SUP-00001"
                                />

                            </div>


                            {/* SUPPLIER NAME */}

                            <div className="form-field">

                                <label>

                                    Supplier Name
                                    <span>*</span>

                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Dell Technologies India"
                                />

                            </div>


                            {/* CONTACT PERSON */}

                            <div className="form-field full">

                                <label>

                                    Contact Person

                                </label>

                                <input
                                    name="contact_person"
                                    value={form.contact_person}
                                    onChange={handleChange}
                                    placeholder="Amit Kumar"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CONTACT DETAILS
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Contact Details

                        </div>


                        <div className="form-grid">


                            {/* PHONE */}

                            <div className="form-field">

                                <label>

                                    Phone

                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="9876501234"
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="form-field">

                                <label>

                                    Email

                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="accounts@supplier.com"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        TAX & REGISTRATION
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Tax & Registration

                        </div>


                        <div className="form-grid">


                            {/* GSTIN */}

                            <div className="form-field">

                                <label>

                                    GSTIN

                                </label>

                                <input
                                    name="gstin"
                                    value={form.gstin}
                                    onChange={handleChange}
                                    placeholder="29ABCDE1234F1Z5"
                                />

                            </div>


                            {/* PAN */}

                            <div className="form-field">

                                <label>

                                    PAN

                                </label>

                                <input
                                    name="pan"
                                    value={form.pan}
                                    onChange={handleChange}
                                    placeholder="ABCDE1234F"
                                />

                            </div>


                            {/* STATE */}

                            <div className="form-field">

                                <label>

                                    State

                                </label>

                                <input
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="Karnataka"
                                />

                            </div>


                            {/* STATE CODE */}

                            <div className="form-field">

                                <label>

                                    State Code

                                </label>

                                <input
                                    name="state_code"
                                    value={form.state_code}
                                    onChange={handleChange}
                                    placeholder="29"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ADDRESS
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Address

                        </div>


                        <div className="form-grid">


                            <div className="form-field full">

                                <label>

                                    Address

                                </label>

                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter supplier address"
                                    rows="4"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        FINANCIAL SETTINGS
                    ================================================== */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Financial Settings

                        </div>


                        <div className="form-grid">


                            {/* PAYMENT TERMS */}

                            <div className="form-field">

                                <label>

                                    Payment Terms

                                </label>

                                <div className="input-with-suffix">

                                    <input
                                        type="number"
                                        min="0"
                                        name="payment_terms"
                                        value={form.payment_terms}
                                        onChange={handleChange}
                                    />

                                    <span>

                                        Days

                                    </span>

                                </div>

                            </div>


                            {/* CREDIT LIMIT */}

                            <div className="form-field">

                                <label>

                                    Credit Limit

                                </label>

                                <div className="input-with-prefix">

                                    <span>

                                        ₹

                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        name="credit_limit"
                                        value={form.credit_limit}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            {/* OPENING BALANCE */}

                            <div className="form-field">

                                <label>

                                    Opening Balance

                                </label>

                                <div className="input-with-prefix">

                                    <span>

                                        ₹

                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        name="opening_balance"
                                        value={form.opening_balance}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            {/* BALANCE TYPE */}

                            <div className="form-field">

                                <label>

                                    Balance Type

                                </label>

                                <select
                                    name="opening_balance_type"
                                    value={form.opening_balance_type}
                                    onChange={handleChange}
                                >

                                    <option value="CREDIT">

                                        Credit

                                    </option>

                                    <option value="DEBIT">

                                        Debit

                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* ERROR */}

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
                                    : "Create Supplier"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

}