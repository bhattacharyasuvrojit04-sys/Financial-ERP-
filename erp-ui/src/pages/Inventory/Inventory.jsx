import { useEffect, useMemo, useState } from "react";

import {
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    IndianRupee,
    Plus,
    Search,
    RefreshCw,
    Boxes,
    AlertTriangle,
    X,
} from "lucide-react";

import {
    getStockMovements,
    getInventoryAlerts,
    createReorderRequest,
} from "../../api/inventoryApi";

import {
    getProducts,
} from "../../api/mastersApi";

import StockMovementDrawer from "./StockMovementDrawer";
import StockLedger from "./StockLedger";
import InventoryValuation from "./InventoryValuation";

import "./Inventory.css";


// ==================================================
// FORMAT QUANTITY
// ==================================================

const formatQuantity = (value) => {
    const number = Number(value) || 0;

    if (Number.isInteger(number)) {
        return number.toLocaleString("en-IN");
    }

    return number
        .toFixed(4)
        .replace(/\.?0+$/, "");
};


// ==================================================
// FORMAT CURRENCY
// ==================================================

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};


// ==================================================
// INVENTORY
// ==================================================

export default function Inventory() {
    const [activeTab, setActiveTab] = useState("overview");

    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Inventory alerts
    const [alerts, setAlerts] = useState({
        total_alerts: 0,
        out_of_stock_count: 0,
        low_stock_count: 0,
        alerts: [],
    });

    // Reorder request modal
    const [reorderModal, setReorderModal] = useState({
        open: false,
        alert: null,
    });

    const [reorderQuantity, setReorderQuantity] = useState("");
    const [reorderPriority, setReorderPriority] = useState("NORMAL");
    const [reorderNotes, setReorderNotes] = useState("");
    const [reorderSubmitting, setReorderSubmitting] = useState(false);


    // ==================================================
    // LOAD DATA
    // ==================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                movementData,
                productData,
                alertsData,
            ] = await Promise.all([
                getStockMovements(),
                getProducts(),
                getInventoryAlerts(),
            ]);

            setMovements(
                Array.isArray(movementData)
                    ? movementData
                    : movementData?.movements || []
            );

            setProducts(
                Array.isArray(productData)
                    ? productData
                    : productData?.products || []
            );

            setAlerts({
                total_alerts: Number(alertsData?.total_alerts) || 0,
                out_of_stock_count:
                    Number(alertsData?.out_of_stock_count) || 0,
                low_stock_count:
                    Number(alertsData?.low_stock_count) || 0,
                alerts: Array.isArray(alertsData?.alerts)
                    ? alertsData.alerts
                    : [],
            });
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to load inventory data"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // ==================================================
    // CLEAR SUCCESS MESSAGE
    // ==================================================

    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);


    // ==================================================
    // PRODUCT STOCK CALCULATION
    // ==================================================

    const inventoryRows = useMemo(() => {
        const map = {};

        // Initialize products
        products.forEach((product) => {
            map[product.id] = {
                product_id: product.id,
                sku: product.sku,
                name: product.name,
                unit: product.unit || "Nos",
                inward: 0,
                outward: 0,
                stock: 0,
                stockValue: 0,
            };
        });

        // Process stock movements
        movements.forEach((movement) => {
            const productId = movement.product_id;

            if (productId == null) {
                return;
            }

            if (!map[productId]) {
                map[productId] = {
                    product_id: productId,
                    sku: movement.sku || "-",
                    name: movement.product_name || "Unknown Product",
                    unit: movement.unit || "Nos",
                    inward: 0,
                    outward: 0,
                    stock: 0,
                    stockValue: 0,
                };
            }

            const quantity = Number(movement.quantity) || 0;
            const unitCost = Number(movement.unit_cost) || 0;

            const movementType = String(
                movement.movement_type || ""
            ).toUpperCase();

            // Inward movements
            if (
                [
                    "OPENING",
                    "PURCHASE",
                    "SALES_RETURN",
                    "ADJUSTMENT_IN",
                    "INWARD",
                    "IN",
                ].includes(movementType)
            ) {
                map[productId].inward += quantity;
                map[productId].stockValue += quantity * unitCost;
            }

            // Outward movements
            if (
                [
                    "SALE",
                    "PURCHASE_RETURN",
                    "ADJUSTMENT_OUT",
                    "OUTWARD",
                    "OUT",
                ].includes(movementType)
            ) {
                map[productId].outward += quantity;
                map[productId].stockValue -= quantity * unitCost;
            }
        });

        // Calculate closing stock
        Object.values(map).forEach((row) => {
            row.stock = row.inward - row.outward;

            row.stockValue = Math.max(row.stockValue, 0);
        });

        return Object.values(map);
    }, [products, movements]);


    // ==================================================
    // SEARCH
    // ==================================================

    const filteredRows = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return inventoryRows;
        }

        return inventoryRows.filter((row) =>
            row.name?.toLowerCase().includes(term) ||
            row.sku?.toLowerCase().includes(term)
        );
    }, [inventoryRows, search]);


    // ==================================================
    // SUMMARY
    // ==================================================

    const summary = useMemo(() => {
        return {
            totalItems: inventoryRows.length,

            totalQuantity: inventoryRows.reduce(
                (sum, row) => sum + row.stock,
                0
            ),

            totalInward: inventoryRows.reduce(
                (sum, row) => sum + row.inward,
                0
            ),

            totalOutward: inventoryRows.reduce(
                (sum, row) => sum + row.outward,
                0
            ),

            totalValue: inventoryRows.reduce(
                (sum, row) => sum + row.stockValue,
                0
            ),
        };
    }, [inventoryRows]);


    // ==================================================
    // ADD MOVEMENT
    // ==================================================

    const handleAddMovement = () => {
        setError("");
        setDrawerOpen(true);
    };


    // ==================================================
    // MOVEMENT SAVED
    // ==================================================

    const handleMovementSaved = async () => {
        setDrawerOpen(false);

        setSuccessMessage(
            "Stock movement recorded successfully."
        );

        await loadData();
    };


    // ==================================================
    // OPEN ALERT PRODUCT LEDGER
    // ==================================================

    const handleAlertProduct = (alert) => {
        const product = inventoryRows.find(
            (row) =>
                Number(row.product_id) === Number(alert.product_id)
        );

        if (product) {
            setSelectedProduct(product);
            setActiveTab("ledger");
        }
    };


    // ==================================================
    // OPEN REORDER MODAL
    // ==================================================

    const handleOpenReorder = (alert) => {
        const shortage = Number(alert.shortage_quantity) || 0;

        setError("");

        setReorderQuantity(
            String(shortage > 0 ? shortage : 1)
        );

        setReorderPriority(
            alert.stock_status === "OUT_OF_STOCK"
                ? "HIGH"
                : "NORMAL"
        );

        setReorderNotes("");

        setReorderModal({
            open: true,
            alert,
        });
    };


    // ==================================================
    // CLOSE REORDER MODAL
    // ==================================================

    const handleCloseReorder = () => {
        if (reorderSubmitting) {
            return;
        }

        setReorderModal({
            open: false,
            alert: null,
        });

        setReorderQuantity("");
        setReorderPriority("NORMAL");
        setReorderNotes("");
    };


    // ==================================================
    // CREATE REORDER REQUEST
    // ==================================================

    const handleCreateReorder = async (event) => {
        event.preventDefault();

        const alert = reorderModal.alert;

        if (!alert) {
            return;
        }

        const quantity = Number(reorderQuantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            setError(
                "Reorder quantity must be greater than zero."
            );
            return;
        }

        try {
            setReorderSubmitting(true);
            setError("");

            await createReorderRequest({
                product_id: alert.product_id,
                requested_quantity: quantity,
                priority: reorderPriority,
                notes: reorderNotes.trim() || null,
            });

            setReorderModal({
                open: false,
                alert: null,
            });

            setReorderQuantity("");
            setReorderPriority("NORMAL");
            setReorderNotes("");

            setSuccessMessage(
                "Reorder request created successfully."
            );

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.message || "Failed to create reorder request"
            );
        } finally {
            setReorderSubmitting(false);
        }
    };


    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="inventory-page">

            {/* HEADER */}

            <div className="inventory-header">
                <div className="inventory-title-row">
                    <div className="inventory-title-icon">
                        <Boxes size={22} />
                    </div>

                    <div>
                        <h1>Inventory</h1>
                        <p>
                            Manage stock, movements and inventory position
                        </p>
                    </div>
                </div>

                <div className="inventory-header-actions">
                    <button
                        type="button"
                        className="inventory-refresh-btn"
                        onClick={loadData}
                        title="Refresh"
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                    </button>

                    <button
                        type="button"
                        className="inventory-primary-btn"
                        onClick={handleAddMovement}
                    >
                        <Plus size={18} />
                        Stock Movement
                    </button>
                </div>
            </div>


            {/* SUCCESS */}

            {successMessage && (
                <div className="inventory-success">
                    {successMessage}
                </div>
            )}


            {/* ERROR */}

            {error && (
                <div className="inventory-error">
                    <AlertTriangle size={18} />
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}


            {/* SUMMARY CARDS */}

            <div className="inventory-summary-grid">
                <SummaryCard
                    icon={<Package size={20} />}
                    title="Products"
                    value={summary.totalItems}
                    subtitle="Active inventory items"
                />

                <SummaryCard
                    icon={<Boxes size={20} />}
                    title="Current Stock"
                    value={formatQuantity(summary.totalQuantity)}
                    subtitle="Total quantity"
                />

                <SummaryCard
                    icon={<ArrowDownToLine size={20} />}
                    title="Total Inward"
                    value={formatQuantity(summary.totalInward)}
                    subtitle="Units received"
                />

                <SummaryCard
                    icon={<ArrowUpFromLine size={20} />}
                    title="Total Outward"
                    value={formatQuantity(summary.totalOutward)}
                    subtitle="Units issued"
                />

                <SummaryCard
                    icon={<IndianRupee size={20} />}
                    title="Stock Value"
                    value={formatCurrency(summary.totalValue)}
                    subtitle="Current estimated value"
                />
            </div>


            {/* TABS */}

            <div className="inventory-tabs">
                <button
                    type="button"
                    className={
                        activeTab === "overview"
                            ? "inventory-tab active"
                            : "inventory-tab"
                    }
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "ledger"
                            ? "inventory-tab active"
                            : "inventory-tab"
                    }
                    onClick={() => setActiveTab("ledger")}
                >
                    Stock Ledger
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "movements"
                            ? "inventory-tab active"
                            : "inventory-tab"
                    }
                    onClick={() => setActiveTab("movements")}
                >
                    Movements
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "valuation"
                            ? "inventory-tab active"
                            : "inventory-tab"
                    }
                    onClick={() => setActiveTab("valuation")}
                >
                    Valuation
                </button>
            </div>


            {/* OVERVIEW */}

            {activeTab === "overview" && (
                <>
                    {/* SEARCH */}

                    <div className="inventory-toolbar">
                        <div className="inventory-search">
                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search SKU or product..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>


                    {/* INVENTORY ALERTS */}

                    <div className="inventory-alerts-section">
                        <div className="section-header">
                            <div>
                                <h3>Inventory Alerts</h3>
                                <p>
                                    Products requiring attention
                                </p>
                            </div>

                            <div className="alert-summary">
                                <span className="alert-count">
                                    {alerts.total_alerts}{" "}
                                    {alerts.total_alerts === 1
                                        ? "Alert"
                                        : "Alerts"}
                                </span>
                            </div>
                        </div>


                        {/* ALERT SUMMARY */}

                        <div className="alert-stat-row">
                            <div className="alert-stat-card low">
                                <div className="alert-stat-label">
                                    Low Stock
                                </div>

                                <div className="alert-stat-value">
                                    {alerts.low_stock_count}
                                </div>

                                <div className="alert-stat-description">
                                    Below reorder level
                                </div>
                            </div>

                            <div className="alert-stat-card out">
                                <div className="alert-stat-label">
                                    Out of Stock
                                </div>

                                <div className="alert-stat-value">
                                    {alerts.out_of_stock_count}
                                </div>

                                <div className="alert-stat-description">
                                    No stock available
                                </div>
                            </div>
                        </div>


                        {/* ALERT TABLE */}

                        {loading ? (
                            <div className="inventory-empty">
                                Loading inventory alerts...
                            </div>
                        ) : alerts.alerts.length === 0 ? (
                            <div className="no-alerts">
                                <div className="no-alerts-title">
                                    Inventory is healthy
                                </div>

                                <div className="no-alerts-text">
                                    No products require immediate attention.
                                </div>
                            </div>
                        ) : (
                            <div className="alerts-table-wrapper">
                                <table className="inventory-alerts-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Stock</th>
                                            <th>Reorder Level</th>
                                            <th>Shortage</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {alerts.alerts.map((alert) => (
                                            <tr
                                                key={alert.product_id}
                                                className="inventory-alert-row"
                                            >
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="inventory-alert-product-link"
                                                        onClick={() =>
                                                            handleAlertProduct(alert)
                                                        }
                                                    >
                                                        {alert.product_name}
                                                    </button>

                                                    <div className="alert-product-category">
                                                        {alert.category ||
                                                            "Uncategorized"}
                                                    </div>
                                                </td>

                                                <td>{alert.sku}</td>

                                                <td>
                                                    {formatQuantity(
                                                        alert.stock_quantity
                                                    )}{" "}
                                                    {alert.unit}
                                                </td>

                                                <td>
                                                    {formatQuantity(
                                                        alert.reorder_level
                                                    )}{" "}
                                                    {alert.unit}
                                                </td>

                                                <td>
                                                    {formatQuantity(
                                                        alert.shortage_quantity
                                                    )}{" "}
                                                    {alert.unit}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            `inventory-alert-badge ${
                                                                alert.stock_status ===
                                                                "OUT_OF_STOCK"
                                                                    ? "out"
                                                                    : "low"
                                                            }`
                                                        }
                                                    >
                                                        {alert.stock_status ===
                                                        "OUT_OF_STOCK"
                                                            ? "Out of Stock"
                                                            : "Low Stock"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="inventory-reorder-btn"
                                                        onClick={() =>
                                                            handleOpenReorder(alert)
                                                        }
                                                    >
                                                        <Plus size={15} />
                                                        Create Reorder
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>


                    {/* STOCK POSITION */}

                    <div className="inventory-table-card">
                        <div className="inventory-table-header">
                            <div>
                                <h2>Stock Position</h2>
                                <span>
                                    Current inventory by product
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="inventory-empty">
                                Loading inventory...
                            </div>
                        ) : filteredRows.length === 0 ? (
                            <div className="inventory-empty">
                                <Package size={30} />
                                <h3>No inventory found</h3>
                                <p>
                                    Add a stock movement to begin tracking inventory.
                                </p>
                            </div>
                        ) : (
                            <div className="inventory-table-wrapper">
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product</th>
                                            <th>Unit</th>
                                            <th className="number">Inward</th>
                                            <th className="number">Outward</th>
                                            <th className="number">Stock</th>
                                            <th className="number">Value</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredRows.map((row) => (
                                            <tr
                                                key={row.product_id}
                                                onClick={() => {
                                                    setSelectedProduct(row);
                                                    setActiveTab("ledger");
                                                }}
                                                className="inventory-clickable-row"
                                            >
                                                <td>
                                                    <span className="inventory-sku">
                                                        {row.sku}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="inventory-product-name">
                                                        <strong>{row.name}</strong>
                                                    </div>
                                                </td>

                                                <td>{row.unit}</td>

                                                <td className="number positive">
                                                    {formatQuantity(row.inward)}
                                                </td>

                                                <td className="number negative">
                                                    {formatQuantity(row.outward)}
                                                </td>

                                                <td className="number">
                                                    <strong>
                                                        {formatQuantity(row.stock)}
                                                    </strong>
                                                </td>

                                                <td className="number">
                                                    <strong>
                                                        {formatCurrency(row.stockValue)}
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}


            {/* STOCK LEDGER */}

            {activeTab === "ledger" && (
                <StockLedger
                    products={products}
                    selectedProduct={selectedProduct}
                />
            )}


            {/* MOVEMENTS */}

            {activeTab === "movements" && (
                <MovementsTable
                    movements={movements}
                    loading={loading}
                />
            )}


            {/* VALUATION */}

            {activeTab === "valuation" && (
                <InventoryValuation />
            )}


            {/* STOCK MOVEMENT DRAWER */}

            {drawerOpen && (
                <StockMovementDrawer
                    products={products}
                    onClose={() => setDrawerOpen(false)}
                    onSaved={handleMovementSaved}
                />
            )}


            {/* REORDER REQUEST MODAL */}

            {reorderModal.open && reorderModal.alert && (
                <div
                    className="inventory-modal-overlay"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !reorderSubmitting
                        ) {
                            handleCloseReorder();
                        }
                    }}
                >
                    <form
                        className="inventory-reorder-modal"
                        onSubmit={handleCreateReorder}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="inventory-reorder-modal-header">
                            <div>
                                <h2>Create Reorder Request</h2>
                                <p>
                                    Request stock replenishment for this product.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inventory-modal-close"
                                onClick={handleCloseReorder}
                                disabled={reorderSubmitting}
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="inventory-reorder-product">
                            <span>Product</span>

                            <strong>
                                {reorderModal.alert.product_name}
                            </strong>

                            <small>
                                SKU: {reorderModal.alert.sku || "-"}
                            </small>
                        </div>

                        <div className="inventory-reorder-stock-grid">
                            <div>
                                <span>Current Stock</span>
                                <strong>
                                    {formatQuantity(
                                        reorderModal.alert.stock_quantity
                                    )}{" "}
                                    {reorderModal.alert.unit}
                                </strong>
                            </div>

                            <div>
                                <span>Reorder Level</span>
                                <strong>
                                    {formatQuantity(
                                        reorderModal.alert.reorder_level
                                    )}{" "}
                                    {reorderModal.alert.unit}
                                </strong>
                            </div>

                            <div>
                                <span>Shortage</span>
                                <strong>
                                    {formatQuantity(
                                        reorderModal.alert.shortage_quantity
                                    )}{" "}
                                    {reorderModal.alert.unit}
                                </strong>
                            </div>
                        </div>

                        <div className="inventory-form-field">
                            <label htmlFor="reorder-quantity">
                                Requested Quantity *
                            </label>

                            <input
                                id="reorder-quantity"
                                type="number"
                                min="0.0001"
                                step="any"
                                required
                                value={reorderQuantity}
                                onChange={(event) =>
                                    setReorderQuantity(event.target.value)
                                }
                            />
                        </div>

                        <div className="inventory-form-field">
                            <label htmlFor="reorder-priority">
                                Priority
                            </label>

                            <select
                                id="reorder-priority"
                                value={reorderPriority}
                                onChange={(event) =>
                                    setReorderPriority(event.target.value)
                                }
                            >
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div className="inventory-form-field">
                            <label htmlFor="reorder-notes">
                                Notes
                            </label>

                            <textarea
                                id="reorder-notes"
                                rows={3}
                                value={reorderNotes}
                                onChange={(event) =>
                                    setReorderNotes(event.target.value)
                                }
                                placeholder="Additional instructions..."
                            />
                        </div>

                        <div className="inventory-reorder-modal-actions">
                            <button
                                type="button"
                                className="inventory-modal-cancel"
                                onClick={handleCloseReorder}
                                disabled={reorderSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="inventory-primary-btn"
                                disabled={reorderSubmitting}
                            >
                                {reorderSubmitting
                                    ? "Creating..."
                                    : "Create Request"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}


// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
    icon,
    title,
    value,
    subtitle,
}) {
    return (
        <div className="inventory-summary-card">
            <div className="inventory-summary-icon">
                {icon}
            </div>

            <div className="inventory-summary-content">
                <span className="inventory-summary-title">
                    {title}
                </span>

                <strong className="inventory-summary-value">
                    {value}
                </strong>

                <span className="inventory-summary-subtitle">
                    {subtitle}
                </span>
            </div>
        </div>
    );
}


// ==================================================
// MOVEMENTS TABLE
// ==================================================

function MovementsTable({
    movements,
    loading,
}) {
    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN");
    };

    if (loading) {
        return (
            <div className="inventory-table-card">
                <div className="inventory-empty">
                    Loading movements...
                </div>
            </div>
        );
    }

    if (movements.length === 0) {
        return (
            <div className="inventory-table-card">
                <div className="inventory-empty">
                    No stock movements found.
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-table-card">
            <div className="inventory-table-header">
                <div>
                    <h2>Stock Movements</h2>
                    <span>
                        Complete inventory movement history
                    </span>
                </div>
            </div>

            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th className="number">Quantity</th>
                            <th className="number">Unit Cost</th>
                            <th>Reference</th>
                            <th>Notes</th>
                        </tr>
                    </thead>

                    <tbody>
                        {movements.map((movement, index) => {
                            const type = String(
                                movement.movement_type || ""
                            ).toUpperCase();

                            const isInward = [
                                "PURCHASE",
                                "INWARD",
                                "IN",
                                "OPENING",
                                "SALES_RETURN",
                                "ADJUSTMENT_IN",
                            ].includes(type);

                            return (
                                <tr key={movement.id || index}>
                                    <td>
                                        {formatDate(
                                            movement.movement_date
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            {movement.product_name ||
                                                movement.name ||
                                                `Product #${movement.product_id}`}
                                        </strong>
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                isInward
                                                    ? "movement-badge inward"
                                                    : "movement-badge outward"
                                            }
                                        >
                                            {type || "-"}
                                        </span>
                                    </td>

                                    <td className="number">
                                        {formatQuantity(movement.quantity)}
                                    </td>

                                    <td className="number">
                                        {formatCurrency(movement.unit_cost)}
                                    </td>

                                    <td>
                                        {movement.reference_type
                                            ? `${movement.reference_type} #${movement.reference_id || ""}`
                                            : "-"}
                                    </td>

                                    <td>
                                        {movement.notes || "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}