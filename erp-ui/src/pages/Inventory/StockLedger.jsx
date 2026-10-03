import { useEffect, useState } from "react";
import {
    Search,
    ArrowDownToLine,
    ArrowUpFromLine,
} from "lucide-react";

import {
    getProductStockMovements,
} from "../../api/inventoryApi";

import "./StockLedger.css";


export default function StockLedger({
    products,
    selectedProduct,
}) {

    const [productId, setProductId] =
        useState(
            selectedProduct?.product_id ||
            products[0]?.id ||
            ""
        );

    const [movements, setMovements] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (selectedProduct?.product_id) {

            setProductId(
                selectedProduct.product_id
            );

        }

    }, [selectedProduct]);


    useEffect(() => {

        if (!productId) return;

        loadLedger(productId);

    }, [productId]);


    const loadLedger = async (id) => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getProductStockMovements(id);

            setMovements(
                Array.isArray(data)
                    ? data
                    : data?.movements || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to load stock ledger"
            );

        } finally {

            setLoading(false);

        }

    };


    const selected =
        products.find(
            p => Number(p.id) === Number(productId)
        );


    let runningStock = 0;

    let totalInward = 0;

    let totalOutward = 0;

    let stockValue = 0;


    const rows = movements.map(
        movement => {

            const quantity =
                Number(movement.quantity) || 0;

            const unitCost =
                Number(movement.unit_cost) || 0;

            const type =
                String(
                    movement.movement_type || ""
                ).toUpperCase();


            const inward =
                [
                    "PURCHASE",
                    "INWARD",
                    "IN",
                ].includes(type);


            if (inward) {

                runningStock += quantity;

                totalInward += quantity;

                stockValue +=
                    quantity * unitCost;

            } else {

                runningStock -= quantity;

                totalOutward += quantity;

                stockValue -=
                    quantity * unitCost;

            }


            return {

                ...movement,

                runningStock,

            };

        }
    );


    const formatCurrency = (value) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value || 0);

    };


    return (

        <div className="ledger-page">

            <div className="ledger-toolbar">

                <div>

                    <h2>
                        Stock Ledger
                    </h2>

                    <p>
                        Track every inventory movement for a product.
                    </p>

                </div>


                <select
                    className="ledger-product-select"
                    value={productId}
                    onChange={(e) =>
                        setProductId(
                            Number(e.target.value)
                        )
                    }
                >

                    {products.map(product => (

                        <option
                            key={product.id}
                            value={product.id}
                        >

                            {product.sku}
                            {" — "}
                            {product.name}

                        </option>

                    ))}

                </select>

            </div>


            {selected && (

                <div className="ledger-product-card">

                    <div>

                        <span>
                            Product
                        </span>

                        <strong>
                            {selected.name}
                        </strong>

                        <small>
                            {selected.sku}
                        </small>

                    </div>


                    <div>

                        <span>
                            Current Stock
                        </span>

                        <strong>
                            {runningStock}
                            {" "}
                            {selected.unit || "Nos"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Inward
                        </span>

                        <strong className="ledger-positive">
                            {totalInward}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Outward
                        </span>

                        <strong className="ledger-negative">
                            {totalOutward}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Estimated Value
                        </span>

                        <strong>
                            {formatCurrency(
                                Math.max(stockValue, 0)
                            )}
                        </strong>

                    </div>

                </div>

            )}


            {error && (

                <div className="ledger-error">
                    {error}
                </div>

            )}


            <div className="ledger-table-card">

                {loading ? (

                    <div className="ledger-empty">
                        Loading ledger...
                    </div>

                ) : rows.length === 0 ? (

                    <div className="ledger-empty">

                        <Search size={28} />

                        <h3>
                            No movements
                        </h3>

                        <p>
                            This product does not have any stock movements yet.
                        </p>

                    </div>

                ) : (

                    <div className="ledger-table-wrapper">

                        <table className="ledger-table">

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Reference
                                    </th>

                                    <th className="ledger-number">
                                        Inward
                                    </th>

                                    <th className="ledger-number">
                                        Outward
                                    </th>

                                    <th className="ledger-number">
                                        Unit Cost
                                    </th>

                                    <th className="ledger-number">
                                        Balance
                                    </th>

                                    <th className="ledger-number">
                                        Value
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {rows.map(
                                    (movement, index) => {

                                        const type =
                                            String(
                                                movement.movement_type || ""
                                            ).toUpperCase();

                                        const inward =
                                            [
                                                "PURCHASE",
                                                "INWARD",
                                                "IN",
                                            ].includes(type);


                                        return (

                                            <tr
                                                key={
                                                    movement.id ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        movement.movement_date
                                                            ? new Date(
                                                                movement.movement_date
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )
                                                            : "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            inward
                                                                ? "ledger-type inward"
                                                                : "ledger-type outward"
                                                        }
                                                    >

                                                        {inward
                                                            ? <ArrowDownToLine size={14} />
                                                            : <ArrowUpFromLine size={14} />
                                                        }

                                                        {type}

                                                    </span>

                                                </td>


                                                <td>

                                                    {movement.reference_type
                                                        ? `${movement.reference_type} #${movement.reference_id || ""}`
                                                        : "-"
                                                    }

                                                </td>


                                                <td className="ledger-number ledger-positive">

                                                    {inward
                                                        ? movement.quantity
                                                        : "-"
                                                    }

                                                </td>


                                                <td className="ledger-number ledger-negative">

                                                    {!inward
                                                        ? movement.quantity
                                                        : "-"
                                                    }

                                                </td>


                                                <td className="ledger-number">

                                                    {formatCurrency(
                                                        movement.unit_cost
                                                    )}

                                                </td>


                                                <td className="ledger-number">

                                                    <strong>
                                                        {movement.runningStock}
                                                    </strong>

                                                </td>


                                                <td className="ledger-number">

                                                    {formatCurrency(
                                                        (
                                                            Number(
                                                                movement.quantity
                                                            ) || 0
                                                        ) *
                                                        (
                                                            Number(
                                                                movement.unit_cost
                                                            ) || 0
                                                        )
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

        </div>

    );
}