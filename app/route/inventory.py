from fastapi import (
    APIRouter,
    Depends,
    HTTPException, Query
)

from sqlalchemy.orm import Session

from ..db import get_db

from datetime import date

from ..schemas import (
    StockMovementCreate,
     ReorderRequestCreate,
    ReorderRequestStatusUpdate
)

from ..services import (
    create_stock_movement,
    get_product_stock,
    get_stock_ledger,
    get_inventory_summary,
    get_stock_movement_report,
    get_stock_movements,
    get_inventory_alerts,
    create_reorder_request,
    get_reorder_requests,
    get_reorder_request,
    update_reorder_request_status,
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)
# ============================================================
# GET ALL STOCK MOVEMENTS
# ============================================================

@router.get("/movements")
def all_stock_movements(
    db: Session = Depends(get_db)
):

    return get_stock_movements(db)


# ============================================================
# CREATE STOCK MOVEMENT
# ============================================================

@router.post("/movements")
def create_inventory_movement(
    data: StockMovementCreate,
    db: Session = Depends(get_db)
):

    try:

        movement = create_stock_movement(
            db,
            data
        )

        return {

            "message":
                "Stock movement created successfully",

            "movement": {

                "id":
                    movement.id,

                "product_id":
                    movement.product_id,

                "movement_type":
                    movement.movement_type,

                "quantity":
                    movement.quantity,

                "unit_cost":
                    movement.unit_cost,

                "reference_type":
                    movement.reference_type,

                "reference_id":
                    movement.reference_id,

                "movement_date":
                    movement.movement_date.isoformat(),

                "notes":
                    movement.notes

            }

        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# PRODUCT STOCK
# ============================================================

@router.get("/products/{product_id}/stock")
def product_stock(
    product_id: int,
    db: Session = Depends(get_db)
):

    try:

        return get_product_stock(
            db,
            product_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ============================================================
# PRODUCT STOCK LEDGER
# ============================================================

@router.get("/products/{product_id}/ledger")
def product_stock_ledger(
    product_id: int,
    db: Session = Depends(get_db)
):

    try:

        return get_stock_ledger(
            db,
            product_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ============================================================
# INVENTORY SUMMARY
# ============================================================

@router.get("/summary")
def inventory_summary(
    db: Session = Depends(get_db)
):

    return get_inventory_summary(db)

@router.get("/alerts")
def inventory_alerts(
    db: Session = Depends(get_db)
):
    return get_inventory_alerts(db)

# ==========================================================
# REORDER REQUESTS
# ==========================================================


@router.get("/reorder-requests")
def list_reorder_requests(
    db: Session = Depends(get_db)
):
    return get_reorder_requests(db)


@router.get("/reorder-requests/{request_id}")
def reorder_request_detail(
    request_id: int,
    db: Session = Depends(get_db)
):

    try:

        return get_reorder_request(
            db,
            request_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.post("/reorder-requests")
def create_inventory_reorder_request(
    data: ReorderRequestCreate,
    db: Session = Depends(get_db)
):

    try:

        request = create_reorder_request(
            db,
            data
        )

        return {

            "message":
                "Reorder request created successfully",

            "request":
                get_reorder_request(
                    db,
                    request.id
                ),

        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.patch(
    "/reorder-requests/{request_id}/status"
)
def change_reorder_request_status(
    request_id: int,
    data: ReorderRequestStatusUpdate,
    db: Session = Depends(get_db)
):

    try:

        request = update_reorder_request_status(
            db,
            request_id,
            data.status
        )

        return {

            "message":
                "Reorder request status updated successfully",

            "request":
                get_reorder_request(
                    db,
                    request.id
                ),

        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# INVENTORY REPORT — STOCK MOVEMENTS
# ============================================================

@router.get("/reports/stock-movements")
def stock_movement_report(
    start_date: date = None,
    end_date: date = None,
    product_id: int = Query(None, gt=0),
    movement_type: str = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        return get_stock_movement_report(
            db=db,
            start_date=start_date,
            end_date=end_date,
            product_id=product_id,
            movement_type=movement_type,
            limit=limit,
            offset=offset,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )