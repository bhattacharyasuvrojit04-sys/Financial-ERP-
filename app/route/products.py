from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas import (
    ProductCreate,
    ProductUpdate
)

from ..services import (
    create_product,
    get_products,
    get_product,
    update_product,
    deactivate_product
)


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post("")
def create_product_route(
    data: ProductCreate,
    db: Session = Depends(get_db)
):

    try:

        product = create_product(
            db,
            data
        )

        return {
            "message":
                "Product created successfully",

            "product": {
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "category": product.category,
                "unit": product.unit,
                "purchase_price":
                    product.purchase_price,
                "selling_price":
                    product.selling_price,
                "tax_rate":
                    product.tax_rate,
                "costing_method":
                    product.costing_method,
                "reorder_level":
                    product.reorder_level,
                "is_active":
                    product.is_active
            }
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# LIST PRODUCTS
# ============================================================

@router.get("")
def list_products(
    search: str = None,
    category: str = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):

    return get_products(
        db=db,
        search=search,
        category=category,
        active_only=active_only
    )


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@router.get("/{product_id}")
def get_product_route(
    product_id: int,
    db: Session = Depends(get_db)
):

    try:

        return get_product(
            db,
            product_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put("/{product_id}")
def update_product_route(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db)
):

    try:

        product = update_product(
            db,
            product_id,
            data
        )

        return {
            "message":
                "Product updated successfully",

            "product": {
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "category": product.category,
                "unit": product.unit,
                "purchase_price":
                    product.purchase_price,
                "selling_price":
                    product.selling_price,
                "tax_rate":
                    product.tax_rate,
                "costing_method":
                    product.costing_method,
                "reorder_level":
                    product.reorder_level,
                "is_active":
                    product.is_active
            }
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# DEACTIVATE PRODUCT
# ============================================================

@router.patch("/{product_id}/deactivate")
def deactivate_product_route(
    product_id: int,
    db: Session = Depends(get_db)
):

    try:

        return deactivate_product(
            db,
            product_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )