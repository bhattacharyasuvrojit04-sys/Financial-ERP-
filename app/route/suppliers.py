from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db

from ..schemas import (
    SupplierCreate,
    SupplierUpdate
)

from ..services import (
    create_supplier,
    get_suppliers,
    get_supplier,
    update_supplier,
    deactivate_supplier
)


router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


@router.post("")
def create_supplier_route(
    data: SupplierCreate,
    db: Session = Depends(get_db)
):
    try:
        supplier = create_supplier(db, data)

        return {
            "message": "Supplier created successfully",
            "supplier": {
                "id": supplier.id,
                "supplier_code": supplier.supplier_code,
                "name": supplier.name,
                "is_active": supplier.is_active
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("")
def list_suppliers(
    search: str = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    return get_suppliers(
        db=db,
        search=search,
        active_only=active_only
    )


@router.get("/{supplier_id}")
def get_supplier_route(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    try:
        return get_supplier(
            db,
            supplier_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put("/{supplier_id}")
def update_supplier_route(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db)
):
    try:
        supplier = update_supplier(
            db,
            supplier_id,
            data
        )

        return {
            "message": "Supplier updated successfully",
            "supplier": {
                "id": supplier.id,
                "supplier_code": supplier.supplier_code,
                "name": supplier.name,
                "is_active": supplier.is_active
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.patch("/{supplier_id}/deactivate")
def deactivate_supplier_route(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    try:
        return deactivate_supplier(
            db,
            supplier_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )