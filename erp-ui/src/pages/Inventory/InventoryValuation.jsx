import { useEffect, useMemo, useState } from "react";

import {
    getInventoryValuation
} from "../../api/inventoryApi";

import "./InventoryValuation.css";


export default function InventoryValuation() {

    const [valuation, setValuation] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [expandedId, setExpandedId] =
        useState(null);


    /* ============================================================
       LOAD VALUATION
    ============================================================ */

    const loadValuation = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getInventoryValuation();

            /*
                Backend normally returns:

                [
                    {...},
                    {...}
                ]

                But this also handles:

                {
                    data: [...]
                }

                {
                    valuation: [...]
                }
            */

            const rows =
                Array.isArray(data)
                    ? data
                    : data?.valuation ||
                      data?.data ||
                      [];

            setValuation(rows);

        } catch (err) {

            console.error(
                "Inventory valuation error:",
                err
            );

            setError(
                err.message ||
                "Unable to load inventory valuation."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadValuation();

    }, []);


    /* ============================================================
       NORMALIZE VALUES
    ============================================================ */

    const getValue = (
        row,
        ...keys
    ) => {

        for (const key of keys) {

            if (
                row?.[key] !== undefined &&
                row?.[key] !== null
            ) {

                return row[key];

            }

        }

        return null;
    };


    /* ============================================================
       FORMATTING
    ============================================================ */

    const formatNumber = (
        value,
        decimals = 2
    ) => {

        if (
            value === null ||
            value === undefined ||
            Number.isNaN(Number(value))
        ) {

            return "—";

        }

        return Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits:
                    decimals,

                maximumFractionDigits:
                    decimals
            }
        );
    };


    const formatCurrency = (
        value
    ) => {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }

        return `₹ ${formatNumber(value)}`;

    };


    /* ============================================================
       FILTER
    ============================================================ */

    const filteredValuation =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {

                return valuation;

            }

            return valuation.filter(
                row => {

                    const sku =
                        String(
                            getValue(
                                row,
                                "sku",
                                "product_sku"
                            ) || ""
                        ).toLowerCase();

                    const name =
                        String(
                            getValue(
                                row,
                                "product_name",
                                "name"
                            ) || ""
                        ).toLowerCase();

                    const method =
                        String(
                            getValue(
                                row,
                                "costing_method",
                                "method"
                            ) || ""
                        ).toLowerCase();

                    return (
                        sku.includes(query) ||
                        name.includes(query) ||
                        method.includes(query)
                    );

                }
            );

        }, [valuation, search]);


    /* ============================================================
       SUMMARY
    ============================================================ */

    const totalInventoryValue =
        valuation.reduce(
            (sum, row) => {

                const value =
                    Number(
                        getValue(
                            row,
                            "inventory_value",
                            "stock_value",
                            "valuation"
                        ) || 0
                    );

                return sum + value;

            },
            0
        );


    const totalQuantity =
        valuation.reduce(
            (sum, row) => {

                const quantity =
                    Number(
                        getValue(
                            row,
                            "stock_quantity",
                            "quantity",
                            "closing_quantity"
                        ) || 0
                    );

                return sum + quantity;

            },
            0
        );


    const totalProducts =
        valuation.length;


    const totalCogs =
        valuation.reduce(
            (sum, row) => {

                return (
                    sum +
                    Number(
                        getValue(
                            row,
                            "cogs",
                            "cost_of_goods_sold"
                        ) || 0
                    )
                );

            },
            0
        );


    /* ============================================================
       TOGGLE
    ============================================================ */

    const toggleRow = (
        id
    ) => {

        setExpandedId(
            current =>
                current === id
                    ? null
                    : id
        );

    };


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div className="inventory-valuation-page">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="valuation-header">

                <div>

                    <div className="valuation-breadcrumb">
                        Inventory / Valuation
                    </div>

                    <h1>
                        Inventory Valuation
                    </h1>

                    <p>
                        Monitor inventory value and
                        stock costing across products.
                    </p>

                </div>


                <button
                    className="valuation-refresh-btn"
                    onClick={loadValuation}
                    disabled={loading}
                >

                    <span>
                        ↻
                    </span>

                    Refresh

                </button>

            </div>


            {/* ====================================================
                KPI CARDS
            ==================================================== */}

            <div className="valuation-kpi-grid">


                <div className="valuation-kpi-card">

                    <div className="valuation-kpi-icon">
                        ₹
                    </div>

                    <div>

                        <span>
                            Inventory Value
                        </span>

                        <strong>
                            {formatCurrency(
                                totalInventoryValue
                            )}
                        </strong>

                        <small>
                            Closing stock value
                        </small>

                    </div>

                </div>


                <div className="valuation-kpi-card">

                    <div className="valuation-kpi-icon">
                        #
                    </div>

                    <div>

                        <span>
                            Stock Quantity
                        </span>

                        <strong>
                            {formatNumber(
                                totalQuantity,
                                0
                            )}
                        </strong>

                        <small>
                            Total units in stock
                        </small>

                    </div>

                </div>


                <div className="valuation-kpi-card">

                    <div className="valuation-kpi-icon">
                        P
                    </div>

                    <div>

                        <span>
                            Products Valued
                        </span>

                        <strong>
                            {totalProducts}
                        </strong>

                        <small>
                            Active inventory items
                        </small>

                    </div>

                </div>


                <div className="valuation-kpi-card">

                    <div className="valuation-kpi-icon">
                        C
                    </div>

                    <div>

                        <span>
                            Cost of Goods Sold
                        </span>

                        <strong>
                            {formatCurrency(
                                totalCogs
                            )}
                        </strong>

                        <small>
                            Based on stock movements
                        </small>

                    </div>

                </div>

            </div>


            {/* ====================================================
                MAIN PANEL
            ==================================================== */}

            <div className="valuation-panel">


                {/* TOOLBAR */}

                <div className="valuation-toolbar">

                    <div>

                        <h2>
                            Product Valuation
                        </h2>

                        <span>
                            Inventory costing by product
                        </span>

                    </div>


                    <div className="valuation-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search SKU or product..."
                            value={search}
                            onChange={
                                e =>
                                    setSearch(
                                        e.target.value
                                    )
                            }
                        />

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="valuation-error">

                        <strong>
                            Unable to load valuation
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={loadValuation}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* LOADING */}

                {loading && (

                    <div className="valuation-loading">

                        <div className="valuation-spinner" />

                        <span>
                            Calculating inventory valuation...
                        </span>

                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                 !error &&
                 filteredValuation.length === 0 && (

                    <div className="valuation-empty">

                        <div className="valuation-empty-icon">
                            ▱
                        </div>

                        <h3>
                            No valuation data
                        </h3>

                        <p>
                            Create stock movements for
                            your products to calculate
                            inventory valuation.
                        </p>

                    </div>

                )}


                {/* TABLE */}

                {!loading &&
                 !error &&
                 filteredValuation.length > 0 && (

                    <div className="valuation-table-wrapper">

                        <table className="valuation-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Costing Method
                                    </th>

                                    <th className="text-right">
                                        Stock Qty
                                    </th>

                                    <th className="text-right">
                                        Average Cost
                                    </th>

                                    <th className="text-right">
                                        COGS
                                    </th>

                                    <th className="text-right">
                                        Inventory Value
                                    </th>

                                    <th>
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredValuation.map(
                                    (row, index) => {

                                        const id =
                                            getValue(
                                                row,
                                                "product_id",
                                                "id"
                                            ) ||
                                            index;


                                        const sku =
                                            getValue(
                                                row,
                                                "sku",
                                                "product_sku"
                                            );


                                        const productName =
                                            getValue(
                                                row,
                                                "product_name",
                                                "name"
                                            );


                                        const method =
                                            getValue(
                                                row,
                                                "costing_method",
                                                "method"
                                            ) ||
                                            "—";


                                        const quantity =
                                            getValue(
                                                row,
                                                "stock_quantity",
                                                "quantity",
                                                "closing_quantity"
                                            );


                                        const averageCost =
                                            getValue(
                                                row,
                                                "average_cost",
                                                "avg_cost",
                                                "unit_cost"
                                            );


                                        const cogs =
                                            getValue(
                                                row,
                                                "cogs",
                                                "cost_of_goods_sold"
                                            );


                                        const inventoryValue =
                                            getValue(
                                                row,
                                                "inventory_value",
                                                "stock_value",
                                                "valuation"
                                            );


                                        const expanded =
                                            expandedId === id;


                                        return (

                                            <>

                                                <tr
                                                    key={id}
                                                    className={
                                                        expanded
                                                            ? "valuation-row expanded"
                                                            : "valuation-row"
                                                    }
                                                    onClick={() =>
                                                        toggleRow(id)
                                                    }
                                                >

                                                    <td>

                                                        <div className="valuation-product">

                                                            <div className="valuation-product-icon">
                                                                {(productName ||
                                                                    "P")
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {productName ||
                                                                        "Unnamed Product"}
                                                                </strong>

                                                                <span>
                                                                    {sku ||
                                                                        "No SKU"}
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                method
                                                                    .toUpperCase()
                                                                    .includes(
                                                                        "FIFO"
                                                                    )
                                                                    ? "valuation-method fifo"
                                                                    : "valuation-method weighted"
                                                            }
                                                        >

                                                            {method
                                                                .replaceAll(
                                                                    "_",
                                                                    " "
                                                                )}

                                                        </span>

                                                    </td>


                                                    <td className="text-right">

                                                        {formatNumber(
                                                            quantity,
                                                            2
                                                        )}

                                                    </td>


                                                    <td className="text-right">

                                                        {formatCurrency(
                                                            averageCost
                                                        )}

                                                    </td>


                                                    <td className="text-right">

                                                        {formatCurrency(
                                                            cogs
                                                        )}

                                                    </td>


                                                    <td className="text-right">

                                                        <strong className="valuation-value">

                                                            {formatCurrency(
                                                                inventoryValue
                                                            )}

                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <button
                                                            className="valuation-expand-btn"
                                                            onClick={e => {

                                                                e.stopPropagation();

                                                                toggleRow(id);

                                                            }}
                                                        >

                                                            {expanded
                                                                ? "−"
                                                                : "+"}

                                                        </button>

                                                    </td>

                                                </tr>


                                                {expanded && (

                                                    <tr
                                                        key={`${id}-details`}
                                                        className="valuation-detail-row"
                                                    >

                                                        <td
                                                            colSpan="7"
                                                        >

                                                            <ValuationDetails
                                                                row={row}
                                                                formatCurrency={
                                                                    formatCurrency
                                                                }
                                                                formatNumber={
                                                                    formatNumber
                                                                }
                                                                getValue={
                                                                    getValue
                                                                }
                                                            />

                                                        </td>

                                                    </tr>

                                                )}

                                            </>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
}


/* ================================================================
   DETAIL COMPONENT
================================================================ */

function ValuationDetails({
    row,
    formatCurrency,
    formatNumber,
    getValue
}) {

    const method =
        getValue(
            row,
            "costing_method",
            "method"
        );


    const stockQuantity =
        getValue(
            row,
            "stock_quantity",
            "quantity",
            "closing_quantity"
        );


    const inventoryValue =
        getValue(
            row,
            "inventory_value",
            "stock_value",
            "valuation"
        );


    const cogs =
        getValue(
            row,
            "cogs",
            "cost_of_goods_sold"
        );


    const layers =
        getValue(
            row,
            "layers",
            "fifo_layers",
            "remaining_layers"
        );


    return (

        <div className="valuation-details">

            <div className="valuation-detail-header">

                <div>

                    <span>
                        VALUATION DETAILS
                    </span>

                    <h3>
                        {method || "Inventory Costing"}
                    </h3>

                </div>

            </div>


            <div className="valuation-detail-grid">


                <div className="valuation-detail-card">

                    <span>
                        Closing Quantity
                    </span>

                    <strong>
                        {formatNumber(
                            stockQuantity,
                            2
                        )}
                    </strong>

                </div>


                <div className="valuation-detail-card">

                    <span>
                        Cost of Goods Sold
                    </span>

                    <strong>
                        {formatCurrency(
                            cogs
                        )}
                    </strong>

                </div>


                <div className="valuation-detail-card">

                    <span>
                        Closing Inventory
                    </span>

                    <strong>
                        {formatCurrency(
                            inventoryValue
                        )}
                    </strong>

                </div>

            </div>


            {Array.isArray(layers) &&
             layers.length > 0 && (

                <div className="valuation-layers">

                    <div className="valuation-layers-title">

                        FIFO Inventory Layers

                    </div>


                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Layer
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Unit Cost
                                </th>

                                <th>
                                    Layer Value
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {layers.map(
                                (layer, index) => {

                                    const quantity =
                                        layer.quantity ??
                                        layer.remaining_quantity ??
                                        0;

                                    const unitCost =
                                        layer.unit_cost ??
                                        layer.cost ??
                                        0;

                                    const value =
                                        layer.value ??
                                        (
                                            Number(quantity) *
                                            Number(unitCost)
                                        );


                                    return (

                                        <tr
                                            key={index}
                                        >

                                            <td>
                                                Layer {index + 1}
                                            </td>

                                            <td>
                                                {formatNumber(
                                                    quantity,
                                                    2
                                                )}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    unitCost
                                                )}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    value
                                                )}
                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

            )}


        </div>

    );
}