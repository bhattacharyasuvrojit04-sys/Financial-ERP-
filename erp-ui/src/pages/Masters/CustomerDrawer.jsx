import { useEffect, useState } from "react";
import {
    createCustomer,
    updateCustomer
} from "../../api/mastersApi";

import "./CustomerDrawer.css";


const emptyCustomer = {
    customer_code: "",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    billing_address: "",
    shipping_address: "",
    gstin: "",
    state: "",
    state_code: "",
    pan: "",
    payment_terms: 0,
    credit_limit: 0,
    opening_balance: 0,
    opening_balance_type: "DEBIT"
};


export default function CustomerDrawer({
    isOpen,
    onClose,
    customer = null,
    onSaved
}) {

    const [form, setForm] = useState(emptyCustomer);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const isEdit = Boolean(customer);


    useEffect(() => {

        if (customer) {

            setForm({
                customer_code: customer.customer_code || "",
                name: customer.name || "",
                contact_person: customer.contact_person || "",
                phone: customer.phone || "",
                email: customer.email || "",
                billing_address: customer.billing_address || "",
                shipping_address: customer.shipping_address || "",
                gstin: customer.gstin || "",
                state: customer.state || "",
                state_code: customer.state_code || "",
                pan: customer.pan || "",
                payment_terms: customer.payment_terms ?? 0,
                credit_limit: customer.credit_limit ?? 0,
                opening_balance: customer.opening_balance ?? 0,
                opening_balance_type:
                    customer.opening_balance_type || "DEBIT"
            });

        } else {

            setForm(emptyCustomer);

        }

        setError("");

    }, [customer, isOpen]);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!form.customer_code.trim()) {
            setError("Customer code is required.");
            return;
        }

        if (!form.name.trim()) {
            setError("Customer name is required.");
            return;
        }


        try {

            setSaving(true);

            let response;

            if (isEdit) {

                response = await updateCustomer(
                    customer.id,
                    {
                        ...form,
                        payment_terms: Number(form.payment_terms),
                        credit_limit: Number(form.credit_limit),
                        opening_balance: Number(form.opening_balance)
                    }
                );

            } else {

                response = await createCustomer({
                    ...form,
                    payment_terms: Number(form.payment_terms),
                    credit_limit: Number(form.credit_limit),
                    opening_balance: Number(form.opening_balance)
                });

            }


            onSaved(response);

            onClose();

        } catch (err) {

            setError(
                err.message || "Something went wrong."
            );

        } finally {

            setSaving(false);

        }
    };


    if (!isOpen) {
        return null;
    }


    return (

        <div className="drawer-overlay">

            <div className="customer-drawer">


                {/* HEADER */}

                <div className="drawer-header">

                    <div>

                        <span className="drawer-eyebrow">
                            CUSTOMER MASTER
                        </span>

                        <h2>
                            {isEdit
                                ? "Edit Customer"
                                : "Add Customer"
                            }
                        </h2>

                        <p>
                            {isEdit
                                ? "Update customer information"
                                : "Create a new customer account"
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


                {/* FORM */}

                <form
                    className="customer-form"
                    onSubmit={handleSubmit}
                >


                    {/* BASIC INFORMATION */}

                    <div className="form-section">

                        <div className="form-section-title">
                            Basic Information
                        </div>


                        <div className="form-grid">

                            <div className="form-field">

                                <label>
                                    Customer Code
                                    <span>*</span>
                                </label>

                                <input
                                    name="customer_code"
                                    value={form.customer_code}
                                    onChange={handleChange}
                                    disabled={isEdit}
                                    placeholder="CUS-00001"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Customer Name
                                    <span>*</span>
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="ABC Technologies Pvt Ltd"
                                />

                            </div>


                            <div className="form-field full">

                                <label>
                                    Contact Person
                                </label>

                                <input
                                    name="contact_person"
                                    value={form.contact_person}
                                    onChange={handleChange}
                                    placeholder="Rahul Sharma"
                                />

                            </div>

                        </div>

                    </div>


                    {/* CONTACT */}

                    <div className="form-section">

                        <div className="form-section-title">
                            Contact Details
                        </div>


                        <div className="form-grid">

                            <div className="form-field">

                                <label>
                                    Phone
                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="accounts@company.com"
                                />

                            </div>

                        </div>

                    </div>


                    {/* TAX */}

                    <div className="form-section">

                        <div className="form-section-title">
                            Tax & Registration
                        </div>


                        <div className="form-grid">

                            <div className="form-field">

                                <label>
                                    GSTIN
                                </label>

                                <input
                                    name="gstin"
                                    value={form.gstin}
                                    onChange={handleChange}
                                    placeholder="27ABCDE1234F1Z5"
                                />

                            </div>


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


                            <div className="form-field">

                                <label>
                                    State
                                </label>

                                <input
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="Maharashtra"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    State Code
                                </label>

                                <input
                                    name="state_code"
                                    value={form.state_code}
                                    onChange={handleChange}
                                    placeholder="27"
                                />

                            </div>

                        </div>

                    </div>


                    {/* ADDRESS */}

                    <div className="form-section">

                        <div className="form-section-title">
                            Address
                        </div>


                        <div className="form-grid">


                            <div className="form-field full">

                                <label>
                                    Billing Address
                                </label>

                                <textarea
                                    name="billing_address"
                                    value={form.billing_address}
                                    onChange={handleChange}
                                    placeholder="Enter billing address"
                                    rows="3"
                                />

                            </div>


                            <div className="form-field full">

                                <label>
                                    Shipping Address
                                </label>

                                <textarea
                                    name="shipping_address"
                                    value={form.shipping_address}
                                    onChange={handleChange}
                                    placeholder="Enter shipping address"
                                    rows="3"
                                />

                            </div>

                        </div>

                    </div>


                    {/* FINANCIAL */}

                    <div className="form-section">

                        <div className="form-section-title">
                            Financial Settings
                        </div>


                        <div className="form-grid">

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


                            <div className="form-field">

                                <label>
                                    Balance Type
                                </label>

                                <select
                                    name="opening_balance_type"
                                    value={form.opening_balance_type}
                                    onChange={handleChange}
                                >
                                    <option value="DEBIT">
                                        Debit
                                    </option>

                                    <option value="CREDIT">
                                        Credit
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


                    {/* FOOTER */}

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
                                    : "Create Customer"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}