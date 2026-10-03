import { useEffect, useState } from "react";

import CustomerDrawer from "../Masters/CustomerDrawer";
import ProductDrawer from "../Masters/ProductDrawer";
import SupplierDrawer from "../Masters/SupplierDrawer";

import {
    getProducts,
    getCustomers,
    getSuppliers
} from "../../api/mastersApi";

import "./Masters.css";


export default function Masters() {

    // =========================================================
    // STATE
    // =========================================================

    const [activeTab, setActiveTab] = useState("products");

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");


    // =========================================================
    // CUSTOMER DRAWER
    // =========================================================

    const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);


    // =========================================================
    // PRODUCT DRAWER
    // =========================================================

    const [productDrawerOpen, setProductDrawerOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);


    // =========================================================
    // SUPPLIER DRAWER
    // =========================================================

    const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState(null);


    // =========================================================
    // SUCCESS NOTIFICATION
    // =========================================================

    const [successMessage, setSuccessMessage] = useState("");


    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);

            if (activeTab === "products") {

                const data = await getProducts({
                    search
                });

                setProducts(data);

            } else if (activeTab === "customers") {

                const data = await getCustomers({
                    search
                });

                setCustomers(data);

            } else if (activeTab === "suppliers") {

                const data = await getSuppliers({
                    search
                });

                setSuppliers(data);

            }

        } catch (error) {

            console.error(
                "Failed to load master data:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // LOAD DATA WHEN TAB CHANGES
    // =========================================================

    useEffect(() => {

        loadData();

    }, [activeTab]);


    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearch = async (value) => {

        setSearch(value);

        try {

            if (activeTab === "products") {

                const data = await getProducts({
                    search: value
                });

                setProducts(data);

            } else if (activeTab === "customers") {

                const data = await getCustomers({
                    search: value
                });

                setCustomers(data);

            } else {

                const data = await getSuppliers({
                    search: value
                });

                setSuppliers(data);

            }

        } catch (error) {

            console.error(
                "Search failed:",
                error
            );

        }

    };


    // =========================================================
    // TAB CHANGE
    // =========================================================

    const handleTabChange = (tab) => {

        setActiveTab(tab);

        setSearch("");

    };


    // =========================================================
    // ADD PRODUCT
    // =========================================================

    const handleAddProduct = () => {

        setSelectedProduct(null);

        setProductDrawerOpen(true);

    };


    // =========================================================
    // EDIT PRODUCT
    // =========================================================

    const handleEditProduct = (product) => {

        setSelectedProduct(product);

        setProductDrawerOpen(true);

    };


    // =========================================================
    // CLOSE PRODUCT DRAWER
    // =========================================================

    const handleCloseProductDrawer = () => {

        setProductDrawerOpen(false);

        setSelectedProduct(null);

    };


    // =========================================================
    // PRODUCT SAVED
    // =========================================================

    const handleProductSaved = () => {

        const message = selectedProduct
            ? "Product updated successfully."
            : "Product created successfully.";

        setSuccessMessage(message);

        loadData();

        setProductDrawerOpen(false);

        setSelectedProduct(null);

        setTimeout(() => {

            setSuccessMessage("");

        }, 3000);

    };


    // =========================================================
    // ADD CUSTOMER
    // =========================================================

    const handleAddCustomer = () => {

        setSelectedCustomer(null);

        setCustomerDrawerOpen(true);

    };


    // =========================================================
    // EDIT CUSTOMER
    // =========================================================

    const handleEditCustomer = (customer) => {

        setSelectedCustomer(customer);

        setCustomerDrawerOpen(true);

    };


    // =========================================================
    // CLOSE CUSTOMER DRAWER
    // =========================================================

    const handleCloseCustomerDrawer = () => {

        setCustomerDrawerOpen(false);

        setSelectedCustomer(null);

    };


    // =========================================================
    // CUSTOMER SAVED
    // =========================================================

    const handleCustomerSaved = () => {

        const message = selectedCustomer
            ? "Customer updated successfully."
            : "Customer created successfully.";

        setSuccessMessage(message);

        loadData();

        setCustomerDrawerOpen(false);

        setSelectedCustomer(null);

        setTimeout(() => {

            setSuccessMessage("");

        }, 3000);

    };


    // =========================================================
    // ADD SUPPLIER
    // =========================================================

    const handleAddSupplier = () => {

        setSelectedSupplier(null);

        setSupplierDrawerOpen(true);

    };


    // =========================================================
    // EDIT SUPPLIER
    // =========================================================

    const handleEditSupplier = (supplier) => {

        setSelectedSupplier(supplier);

        setSupplierDrawerOpen(true);

    };


    // =========================================================
    // CLOSE SUPPLIER DRAWER
    // =========================================================

    const handleCloseSupplierDrawer = () => {

        setSupplierDrawerOpen(false);

        setSelectedSupplier(null);

    };


    // =========================================================
    // SUPPLIER SAVED
    // =========================================================

    const handleSupplierSaved = () => {

        const message = selectedSupplier
            ? "Supplier updated successfully."
            : "Supplier created successfully.";

        setSuccessMessage(message);

        loadData();

        setSupplierDrawerOpen(false);

        setSelectedSupplier(null);

        setTimeout(() => {

            setSuccessMessage("");

        }, 3000);

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="masters-page">


            {/* =====================================================
                SUCCESS NOTIFICATION
            ====================================================== */}

            {successMessage && (

                <div className="master-success">

                    <span>✓</span>

                    {successMessage}

                </div>

            )}


            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="masters-header">

                <div>

                    <div className="masters-breadcrumb">

                        Accounting / Masters

                    </div>

                    <h1>

                        Masters

                    </h1>

                    <p>

                        Manage products, customers and suppliers

                    </p>

                </div>

            </div>


            {/* =====================================================
                STAT CARDS
            ====================================================== */}

            <div className="masters-stats">


                {/* PRODUCTS */}

                <div className="master-stat-card">

                    <div className="master-stat-icon product-icon">

                        P

                    </div>

                    <div>

                        <span>

                            Products

                        </span>

                        <strong>

                            {products.length}

                        </strong>

                        <small>

                            Stock items

                        </small>

                    </div>

                </div>


                {/* CUSTOMERS */}

                <div className="master-stat-card">

                    <div className="master-stat-icon customer-icon">

                        C

                    </div>

                    <div>

                        <span>

                            Customers

                        </span>

                        <strong>

                            {customers.length}

                        </strong>

                        <small>

                            Active customers

                        </small>

                    </div>

                </div>


                {/* SUPPLIERS */}

                <div className="master-stat-card">

                    <div className="master-stat-icon supplier-icon">

                        S

                    </div>

                    <div>

                        <span>

                            Suppliers

                        </span>

                        <strong>

                            {suppliers.length}

                        </strong>

                        <small>

                            Active suppliers

                        </small>

                    </div>

                </div>

            </div>


            {/* =====================================================
                MASTER PANEL
            ====================================================== */}

            <div className="masters-panel">


                {/* =================================================
                    TABS
                ================================================== */}

                <div className="master-tabs">


                    <button
                        className={
                            activeTab === "products"
                                ? "master-tab active"
                                : "master-tab"
                        }
                        onClick={() =>
                            handleTabChange("products")
                        }
                    >

                        Products

                    </button>


                    <button
                        className={
                            activeTab === "customers"
                                ? "master-tab active"
                                : "master-tab"
                        }
                        onClick={() =>
                            handleTabChange("customers")
                        }
                    >

                        Customers

                    </button>


                    <button
                        className={
                            activeTab === "suppliers"
                                ? "master-tab active"
                                : "master-tab"
                        }
                        onClick={() =>
                            handleTabChange("suppliers")
                        }
                    >

                        Suppliers

                    </button>


                </div>


                {/* =================================================
                    TOOLBAR
                ================================================== */}

                <div className="master-toolbar">


                    {/* SEARCH */}

                    <div className="master-search">

                        <span>

                            ⌕

                        </span>

                        <input
                            type="text"
                            placeholder={
                                `Search ${activeTab}...`
                            }
                            value={search}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                        />

                    </div>


                    {/* ADD BUTTON */}

                    <button
                        className="add-master-btn"
                        onClick={() => {

                            if (activeTab === "products") {

                                handleAddProduct();

                            } else if (activeTab === "customers") {

                                handleAddCustomer();

                            } else if (activeTab === "suppliers") {

                                handleAddSupplier();

                            }

                        }}
                    >

                        <span>

                            +

                        </span>

                        Add {

                            activeTab === "products"
                                ? "Product"
                                : activeTab === "customers"
                                    ? "Customer"
                                    : "Supplier"

                        }

                    </button>


                </div>


                {/* =================================================
                    TABLE CONTENT
                ================================================== */}

                <div className="master-table-wrapper">


                    {loading ? (

                        <div className="master-loading">

                            Loading...

                        </div>


                    ) : activeTab === "products" ? (

                        <ProductTable
                            products={products}
                            onEdit={handleEditProduct}
                        />


                    ) : activeTab === "customers" ? (

                        <CustomerTable
                            customers={customers}
                            onEdit={handleEditCustomer}
                        />


                    ) : (

                        <SupplierTable
                            suppliers={suppliers}
                            onEdit={handleEditSupplier}
                        />

                    )}


                </div>


            </div>


            {/* =====================================================
                PRODUCT DRAWER
            ====================================================== */}

            <ProductDrawer

                isOpen={productDrawerOpen}

                product={selectedProduct}

                onClose={handleCloseProductDrawer}

                onSaved={handleProductSaved}

            />


            {/* =====================================================
                CUSTOMER DRAWER
            ====================================================== */}

            <CustomerDrawer

                isOpen={customerDrawerOpen}

                customer={selectedCustomer}

                onClose={handleCloseCustomerDrawer}

                onSaved={handleCustomerSaved}

            />


            {/* =====================================================
                SUPPLIER DRAWER
            ====================================================== */}

            <SupplierDrawer

                isOpen={supplierDrawerOpen}

                supplier={selectedSupplier}

                onClose={handleCloseSupplierDrawer}

                onSaved={handleSupplierSaved}

            />


        </div>

    );

}


// =================================================================
// PRODUCT TABLE
// =================================================================

function ProductTable({
    products,
    onEdit
}) {

    return (

        <table className="master-table">

            <thead>

                <tr>

                    <th>SKU</th>

                    <th>Product</th>

                    <th>Category</th>

                    <th>Unit</th>

                    <th>Purchase Price</th>

                    <th>Selling Price</th>

                    <th>Tax</th>

                    <th>Status</th>

                    <th></th>

                </tr>

            </thead>


            <tbody>

                {products.length === 0 ? (

                    <tr>

                        <td
                            colSpan="9"
                            className="master-empty"
                        >

                            No products found.

                        </td>

                    </tr>

                ) : (

                    products.map(product => (

                        <tr key={product.id}>


                            <td>

                                <strong>

                                    {product.sku}

                                </strong>

                            </td>


                            <td>

                                {product.name}

                            </td>


                            <td>

                                {product.category || "—"}

                            </td>


                            <td>

                                {product.unit}

                            </td>


                            <td>

                                ₹ {Number(
                                    product.purchase_price
                                ).toLocaleString("en-IN")}

                            </td>


                            <td>

                                ₹ {Number(
                                    product.selling_price
                                ).toLocaleString("en-IN")}

                            </td>


                            <td>

                                {product.tax_rate}%

                            </td>


                            <td>

                                <span className="status-badge active">

                                    Active

                                </span>

                            </td>


                            <td>

                                <button
                                    className="row-action"
                                    type="button"
                                    onClick={() =>
                                        onEdit(product)
                                    }
                                >

                                    ⋮

                                </button>

                            </td>


                        </tr>

                    ))

                )}

            </tbody>

        </table>

    );

}


// =================================================================
// CUSTOMER TABLE
// =================================================================

function CustomerTable({
    customers,
    onEdit
}) {

    return (

        <table className="master-table">

            <thead>

                <tr>

                    <th>Code</th>

                    <th>Customer</th>

                    <th>Contact</th>

                    <th>Phone</th>

                    <th>GSTIN</th>

                    <th>Payment Terms</th>

                    <th>Credit Limit</th>

                    <th>Status</th>

                    <th></th>

                </tr>

            </thead>


            <tbody>

                {customers.length === 0 ? (

                    <tr>

                        <td
                            colSpan="9"
                            className="master-empty"
                        >

                            No customers found.

                        </td>

                    </tr>

                ) : (

                    customers.map(customer => (

                        <tr key={customer.id}>


                            <td>

                                <strong>

                                    {customer.customer_code}

                                </strong>

                            </td>


                            <td>

                                {customer.name}

                            </td>


                            <td>

                                {customer.contact_person || "—"}

                            </td>


                            <td>

                                {customer.phone || "—"}

                            </td>


                            <td>

                                {customer.gstin || "—"}

                            </td>


                            <td>

                                {customer.payment_terms} Days

                            </td>


                            <td>

                                ₹ {Number(
                                    customer.credit_limit
                                ).toLocaleString("en-IN")}

                            </td>


                            <td>

                                <span
                                    className={
                                        customer.is_active
                                            ? "status-badge active"
                                            : "status-badge inactive"
                                    }
                                >

                                    {customer.is_active
                                        ? "Active"
                                        : "Inactive"
                                    }

                                </span>

                            </td>


                            <td>

                                <button
                                    className="row-action"
                                    type="button"
                                    onClick={() =>
                                        onEdit(customer)
                                    }
                                >

                                    ⋮

                                </button>

                            </td>


                        </tr>

                    ))

                )}

            </tbody>

        </table>

    );

}


// =================================================================
// SUPPLIER TABLE
// =================================================================

function SupplierTable({
    suppliers,
    onEdit
}) {

    return (

        <table className="master-table">

            <thead>

                <tr>

                    <th>Code</th>

                    <th>Supplier</th>

                    <th>Contact</th>

                    <th>Phone</th>

                    <th>GSTIN</th>

                    <th>Payment Terms</th>

                    <th>Credit Limit</th>

                    <th>Status</th>

                    <th></th>

                </tr>

            </thead>


            <tbody>

                {suppliers.length === 0 ? (

                    <tr>

                        <td
                            colSpan="9"
                            className="master-empty"
                        >

                            No suppliers found.

                        </td>

                    </tr>

                ) : (

                    suppliers.map(supplier => (

                        <tr key={supplier.id}>


                            <td>

                                <strong>

                                    {supplier.supplier_code}

                                </strong>

                            </td>


                            <td>

                                {supplier.name}

                            </td>


                            <td>

                                {supplier.contact_person || "—"}

                            </td>


                            <td>

                                {supplier.phone || "—"}

                            </td>


                            <td>

                                {supplier.gstin || "—"}

                            </td>


                            <td>

                                {supplier.payment_terms} Days

                            </td>


                            <td>

                                ₹ {Number(
                                    supplier.credit_limit
                                ).toLocaleString("en-IN")}

                            </td>


                            <td>

                                <span
                                    className={
                                        supplier.is_active
                                            ? "status-badge active"
                                            : "status-badge inactive"
                                    }
                                >

                                    {supplier.is_active
                                        ? "Active"
                                        : "Inactive"
                                    }

                                </span>

                            </td>


                            <td>

                                <button
                                    className="row-action"
                                    type="button"
                                    onClick={() =>
                                        onEdit(supplier)
                                    }
                                >

                                    ⋮

                                </button>

                            </td>


                        </tr>

                    ))

                )}

            </tbody>

        </table>

    );

}