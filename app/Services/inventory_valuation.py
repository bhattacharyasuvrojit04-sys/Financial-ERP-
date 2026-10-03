from sqlalchemy.orm import Session

from ..models import Product, StockMovement


INWARD_TYPES = {
    "PURCHASE",
    "INWARD",
    "IN",
}

OUTWARD_TYPES = {
    "SALE",
    "OUTWARD",
    "OUT",
}


def normalize_movement_type(movement_type):
    return str(
        movement_type or ""
    ).strip().upper()


def get_product_or_raise(
    db: Session,
    product_id: int
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise ValueError(
            f"Product {product_id} not found"
        )

    return product


def get_product_movements(
    db: Session,
    product_id: int
):
    movements = (
        db.query(StockMovement)
        .filter(
            StockMovement.product_id == product_id
        )
        .order_by(
            StockMovement.movement_date.asc(),
            StockMovement.id.asc()
        )
        .all()
    )

    return movements


# ============================================================
# WEIGHTED AVERAGE
# ============================================================

def calculate_weighted_average_valuation(
    db: Session,
    product_id: int
):

    product = get_product_or_raise(
        db,
        product_id
    )

    movements = get_product_movements(
        db,
        product_id
    )

    stock_quantity = 0.0
    inventory_value = 0.0

    total_inward = 0.0
    total_outward = 0.0

    total_purchase_value = 0.0

    ledger = []


    for movement in movements:

        movement_type = normalize_movement_type(
            movement.movement_type
        )

        quantity = float(
            movement.quantity or 0
        )

        unit_cost = float(
            movement.unit_cost or 0
        )


        # ----------------------------------------------------
        # INWARD
        # ----------------------------------------------------

        if movement_type in INWARD_TYPES:

            movement_value = (
                quantity *
                unit_cost
            )

            stock_quantity += quantity

            inventory_value += movement_value

            total_inward += quantity

            total_purchase_value += movement_value


        # ----------------------------------------------------
        # OUTWARD
        # ----------------------------------------------------

        elif movement_type in OUTWARD_TYPES:

            if quantity > stock_quantity:

                raise ValueError(
                    f"Insufficient stock for product "
                    f"{product_id}. "
                    f"Available: {stock_quantity}, "
                    f"Requested: {quantity}"
                )


            average_cost = (
                inventory_value / stock_quantity
                if stock_quantity > 0
                else 0
            )


            cogs = (
                quantity *
                average_cost
            )

            stock_quantity -= quantity

            inventory_value -= cogs

            total_outward += quantity


        else:

            # Ignore unknown movement types
            # for valuation purposes.

            continue


        average_cost = (
            inventory_value / stock_quantity
            if stock_quantity > 0
            else 0
        )


        ledger.append({

            "movement_id":
                movement.id,

            "movement_date":
                movement.movement_date,

            "movement_type":
                movement_type,

            "quantity":
                quantity,

            "unit_cost":
                round(unit_cost, 2),

            "stock_quantity":
                round(stock_quantity, 4),

            "inventory_value":
                round(
                    inventory_value,
                    2
                ),

            "average_cost":
                round(
                    average_cost,
                    2
                ),

        })


    average_cost = (
        inventory_value / stock_quantity
        if stock_quantity > 0
        else 0
    )


    return {

        "product_id":
            product.id,

        "sku":
            product.sku,

        "product_name":
            product.name,

        "costing_method":
            "WEIGHTED_AVERAGE",

        "unit":
            product.unit,

        "stock_quantity":
            round(
                stock_quantity,
                4
            ),

        "total_inward":
            round(
                total_inward,
                4
            ),

        "total_outward":
            round(
                total_outward,
                4
            ),

        "average_cost":
            round(
                average_cost,
                2
            ),

        "inventory_value":
            round(
                inventory_value,
                2
            ),

        "ledger":
            ledger,

    }


# ============================================================
# FIFO
# ============================================================

def calculate_fifo_valuation(
    db: Session,
    product_id: int
):

    product = get_product_or_raise(
        db,
        product_id
    )

    movements = get_product_movements(
        db,
        product_id
    )


    # Each item represents an inventory layer:
    #
    # {
    #     quantity: 5,
    #     unit_cost: 52000
    # }

    layers = []


    total_inward = 0.0
    total_outward = 0.0
    total_cogs = 0.0

    ledger = []


    for movement in movements:

        movement_type = normalize_movement_type(
            movement.movement_type
        )

        quantity = float(
            movement.quantity or 0
        )

        unit_cost = float(
            movement.unit_cost or 0
        )


        # ----------------------------------------------------
        # INWARD
        # ----------------------------------------------------

        if movement_type in INWARD_TYPES:

            layers.append({

                "quantity":
                    quantity,

                "unit_cost":
                    unit_cost,

                "movement_id":
                    movement.id,

                "movement_date":
                    movement.movement_date,

            })

            total_inward += quantity


        # ----------------------------------------------------
        # OUTWARD
        # ----------------------------------------------------

        elif movement_type in OUTWARD_TYPES:

            remaining_to_issue = quantity

            total_outward += quantity


            while remaining_to_issue > 0:

                if not layers:

                    raise ValueError(
                        f"Insufficient stock for product "
                        f"{product_id}"
                    )


                oldest_layer = layers[0]

                available = oldest_layer["quantity"]


                quantity_from_layer = min(
                    remaining_to_issue,
                    available
                )


                cogs = (
                    quantity_from_layer *
                    oldest_layer["unit_cost"]
                )


                total_cogs += cogs

                oldest_layer["quantity"] -= (
                    quantity_from_layer
                )

                remaining_to_issue -= (
                    quantity_from_layer
                )


                if oldest_layer["quantity"] <= 0:

                    layers.pop(0)


        else:

            continue


        current_quantity = sum(
            layer["quantity"]
            for layer in layers
        )


        current_value = sum(
            layer["quantity"] *
            layer["unit_cost"]
            for layer in layers
        )


        ledger.append({

            "movement_id":
                movement.id,

            "movement_date":
                movement.movement_date,

            "movement_type":
                movement_type,

            "quantity":
                quantity,

            "unit_cost":
                round(
                    unit_cost,
                    2
                ),

            "stock_quantity":
                round(
                    current_quantity,
                    4
                ),

            "inventory_value":
                round(
                    current_value,
                    2
                ),

        })


    stock_quantity = sum(
        layer["quantity"]
        for layer in layers
    )


    inventory_value = sum(
        layer["quantity"] *
        layer["unit_cost"]
        for layer in layers
    )


    average_cost = (
        inventory_value /
        stock_quantity
        if stock_quantity > 0
        else 0
    )


    remaining_layers = [

        {

            "movement_id":
                layer["movement_id"],

            "movement_date":
                layer["movement_date"],

            "quantity":
                round(
                    layer["quantity"],
                    4
                ),

            "unit_cost":
                round(
                    layer["unit_cost"],
                    2
                ),

            "value":
                round(
                    layer["quantity"] *
                    layer["unit_cost"],
                    2
                ),

        }

        for layer in layers

        if layer["quantity"] > 0

    ]


    return {

        "product_id":
            product.id,

        "sku":
            product.sku,

        "product_name":
            product.name,

        "costing_method":
            "FIFO",

        "unit":
            product.unit,

        "stock_quantity":
            round(
                stock_quantity,
                4
            ),

        "total_inward":
            round(
                total_inward,
                4
            ),

        "total_outward":
            round(
                total_outward,
                4
            ),

        "cogs":
            round(
                total_cogs,
                2
            ),

        "average_cost":
            round(
                average_cost,
                2
            ),

        "inventory_value":
            round(
                inventory_value,
                2
            ),

        "remaining_layers":
            remaining_layers,

        "ledger":
            ledger,

    }


# ============================================================
# MAIN VALUATION FUNCTION
# ============================================================

def calculate_inventory_valuation(
    db: Session,
    product_id: int
):

    product = get_product_or_raise(
        db,
        product_id
    )


    costing_method = (
        product.costing_method or
        "WEIGHTED_AVERAGE"
    ).strip().upper()


    if costing_method == "FIFO":

        return calculate_fifo_valuation(
            db,
            product_id
        )


    if costing_method == "WEIGHTED_AVERAGE":

        return calculate_weighted_average_valuation(
            db,
            product_id
        )


    raise ValueError(
        "Unsupported costing method. "
        "Use FIFO or WEIGHTED_AVERAGE."
    )