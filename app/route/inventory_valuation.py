from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db

from ..Services.inventory_valuation import (
    calculate_inventory_valuation,
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory Valuation"]
)


# ============================================================
# PRODUCT VALUATION
# ============================================================

@router.get("/valuation/{product_id}")
def get_inventory_valuation(
    product_id: int,
    db: Session = Depends(get_db)
):

    try:

        return calculate_inventory_valuation(
            db,
            product_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# INVENTORY VALUATION SUMMARY
# ============================================================

@router.get("/valuation")
def get_inventory_valuation_summary(
    db: Session = Depends(get_db)
):

    from ..models import Product

    products = (
        db.query(Product)
        .filter(
            Product.is_active == True
        )
        .all()
    )


    results = []

    total_inventory_value = 0
    total_stock_quantity = 0


    for product in products:

        try:

            valuation = calculate_inventory_valuation(
                    db,
                    product.id
                )

        except ValueError:

            # Product may have an invalid
            # movement history.

            continue


        total_inventory_value += (
            valuation["inventory_value"]
        )

        total_stock_quantity += (
            valuation["stock_quantity"]
        )


        results.append(
            valuation
        )


    return {

        "products":
            results,

        "total_products":
            len(results),

        "total_stock_quantity":
            round(
                total_stock_quantity,
                4
            ),

        "total_inventory_value":
            round(
                total_inventory_value,
                2
            ),

    }