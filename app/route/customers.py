from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db

from ..schemas import (
    CustomerCreate,
    CustomerUpdate
)

from ..services import (
    create_customer,
    get_customers,
    get_customer,
    update_customer,
    deactivate_customer
)


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("")
def create_customer_route(
    data: CustomerCreate,
    db: Session = Depends(get_db)
):
    try:
        customer = create_customer(db, data)

        return {
            "message": "Customer created successfully",
            "customer": {
                "id": customer.id,
                "customer_code": customer.customer_code,
                "name": customer.name,
                "is_active": customer.is_active
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("")
def list_customers(
    search: str = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    return get_customers(
        db=db,
        search=search,
        active_only=active_only
    )


@router.get("/{customer_id}")
def get_customer_route(
    customer_id: int,
    db: Session = Depends(get_db)
):
    try:
        return get_customer(
            db,
            customer_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put("/{customer_id}")
def update_customer_route(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    try:
        customer = update_customer(
            db,
            customer_id,
            data
        )

        return {
            "message": "Customer updated successfully",
            "customer": {
                "id": customer.id,
                "customer_code": customer.customer_code,
                "name": customer.name,
                "is_active": customer.is_active
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.patch("/{customer_id}/deactivate")
def deactivate_customer_route(
    customer_id: int,
    db: Session = Depends(get_db)
):
    try:
        return deactivate_customer(
            db,
            customer_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )