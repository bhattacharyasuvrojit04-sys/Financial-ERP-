from datetime import datetime, date

from pydantic import BaseModel
from typing import Any, Dict, Optional

class TransactionCreate(BaseModel):
    description: str
    amount: float
    date: Optional[str] = None

class RuleCreate(BaseModel):
    keyword: str
    category: str

class CustomerCreate(BaseModel):
    name: str

class InvoiceCreate(BaseModel):
    customer_id: int
    amount: float

class DriverCreate(BaseModel):
    users: float
    user_growth: float
    arpu: float
    arpu_growth: float
    fixed_cost: float
    variable_cost_pct: float

class DCFIput(BaseModel):
    revenue: float
    revenue_growth: float
    ebitda_margin: float
    tax_rate: float
    capex_pct: float
    nwc_pct: float
    wacc: float
    terminal_growth: float
    years: int
    net_debt: float
    shares: float

class DCFOutput(BaseModel):
    enterprise_value: float
    equity_value: float
    price_per_share: float
    pv_fcf: float
    yearly_fcf: float
    
class BenchmarkInput(BaseModel):
    industry: str
    assumptions: Dict[str, Any]


class DepreciationRequest(BaseModel):
    asset_name: str
    amount: float

# ============================================================
# ACCOUNTING
# ============================================================

class AccountCreate(BaseModel):

    name: str

    group_name: str


class JournalLineCreate(BaseModel):

    account_id: int

    debit: float = 0

    credit: float = 0


class JournalEntryCreate(BaseModel):

    description: str

    date: Optional[str] = None

    lines: list[JournalLineCreate]

# ============================================================
# FIXED ASSETS / DEPRECIATION
# ============================================================

class FixedAssetCreate(BaseModel):
    asset_code: str
    asset_name: str
    purchase_cost: float
    purchase_date: str

    depreciation_method: str  # SLM / WDV
    depreciation_rate: float

    useful_life_months: Optional[int] = None
    salvage_value: float = 0


class FixedAssetResponse(BaseModel):
    id: int
    asset_code: str
    asset_name: str
    purchase_cost: float
    purchase_date: str
    depreciation_method: str
    depreciation_rate: float
    useful_life_months: Optional[int]
    salvage_value: float
    status: str


class DepreciationScheduleResponse(BaseModel):
    id: int
    period: str
    opening_wdv: float
    depreciation_amount: float
    closing_wdv: float
    status: str
    journal_entry_id: Optional[int] = None
    posted_at: Optional[str] = None

from pydantic import BaseModel, Field
from typing import Optional


class ProductCreate(BaseModel):

    sku: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    description: Optional[str] = None

    category: Optional[str] = None

    unit: str = Field(
        default="Nos",
        min_length=1,
        max_length=50
    )

    purchase_price: float = Field(
        default=0,
        ge=0
    )

    selling_price: float = Field(
        default=0,
        ge=0
    )

    tax_rate: float = Field(
        default=0,
        ge=0,
        le=100
    )

    inventory_account_id: Optional[int] = None

    purchase_account_id: Optional[int] = None

    sales_account_id: Optional[int] = None

    costing_method: str = Field(
        default="WEIGHTED_AVERAGE"
    )

    reorder_level: float = Field(
        default=0,
        ge=0
    )


class ProductUpdate(BaseModel):

    name: Optional[str] = None

    description: Optional[str] = None

    category: Optional[str] = None

    unit: Optional[str] = None

    purchase_price: Optional[float] = Field(
        default=None,
        ge=0
    )

    selling_price: Optional[float] = Field(
        default=None,
        ge=0
    )

    tax_rate: Optional[float] = Field(
        default=None,
        ge=0,
        le=100
    )

    inventory_account_id: Optional[int] = None

    purchase_account_id: Optional[int] = None

    sales_account_id: Optional[int] = None

    costing_method: Optional[str] = None

    reorder_level: Optional[float] = Field(
        default=None,
        ge=0
    )

    is_active: Optional[bool] = None

from typing import Optional
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)

    description: Optional[str] = None
    category: Optional[str] = None

    unit: str = Field(
        default="Nos",
        min_length=1,
        max_length=50
    )

    purchase_price: float = Field(
        default=0,
        ge=0
    )

    selling_price: float = Field(
        default=0,
        ge=0
    )

    tax_rate: float = Field(
        default=0,
        ge=0,
        le=100
    )

    inventory_account_id: Optional[int] = None
    purchase_account_id: Optional[int] = None
    sales_account_id: Optional[int] = None

    costing_method: str = Field(
        default="WEIGHTED_AVERAGE"
    )

    reorder_level: float = Field(
        default=0,
        ge=0
    )


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None

    purchase_price: Optional[float] = Field(
        default=None,
        ge=0
    )

    selling_price: Optional[float] = Field(
        default=None,
        ge=0
    )

    tax_rate: Optional[float] = Field(
        default=None,
        ge=0,
        le=100
    )

    inventory_account_id: Optional[int] = None
    purchase_account_id: Optional[int] = None
    sales_account_id: Optional[int] = None

    costing_method: Optional[str] = None

    reorder_level: Optional[float] = Field(
        default=None,
        ge=0
    )

    is_active: Optional[bool] = None

class CustomerCreate(BaseModel):
    customer_code: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    contact_person: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None

    gstin: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pan: Optional[str] = None

    payment_terms: int = Field(
        default=0,
        ge=0
    )

    credit_limit: float = Field(
        default=0,
        ge=0
    )

    opening_balance: float = Field(
        default=0,
        ge=0
    )

    opening_balance_type: str = Field(
        default="DEBIT"
    )


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None

    gstin: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pan: Optional[str] = None

    payment_terms: Optional[int] = Field(
        default=None,
        ge=0
    )

    credit_limit: Optional[float] = Field(
        default=None,
        ge=0
    )

    opening_balance: Optional[float] = Field(
        default=None,
        ge=0
    )

    opening_balance_type: Optional[str] = None

    is_active: Optional[bool] = None


class SupplierCreate(BaseModel):
    supplier_code: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    contact_person: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None

    gstin: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pan: Optional[str] = None

    payment_terms: int = Field(
        default=0,
        ge=0
    )

    credit_limit: float = Field(
        default=0,
        ge=0
    )

    opening_balance: float = Field(
        default=0,
        ge=0
    )

    opening_balance_type: str = Field(
        default="CREDIT"
    )


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None

    gstin: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pan: Optional[str] = None

    payment_terms: Optional[int] = Field(
        default=None,
        ge=0
    )

    credit_limit: Optional[float] = Field(
        default=None,
        ge=0
    )

    opening_balance: Optional[float] = Field(
        default=None,
        ge=0
    )

    opening_balance_type: Optional[str] = None

    is_active: Optional[bool] = None


# ============================================================
# INVENTORY / STOCK MOVEMENT SCHEMAS
# ============================================================

class StockMovementCreate(BaseModel):

    product_id: int

    movement_type: str

    quantity: float = Field(
        ...,
        gt=0
    )

    unit_cost: float = Field(
        default=0,
        ge=0
    )

    reference_type: Optional[str] = None

    reference_id: Optional[int] = None

    movement_date: Optional[datetime] = None

    notes: Optional[str] = None

class StockMovementResponse(BaseModel):

    id: int

    product_id: int

    movement_type: str

    quantity: float

    unit_cost: float

    reference_type: Optional[str] = None

    reference_id: Optional[int] = None

    movement_date: datetime

    notes: Optional[str] = None

# ==========================================================
# REORDER REQUEST SCHEMAS
# ==========================================================

class ReorderRequestCreate(BaseModel):
    product_id: int

    requested_quantity: float = Field(
        ...,
        gt=0
    )

    priority: str = Field(
        default="NORMAL"
    )

    notes: Optional[str] = None


class ReorderRequestStatusUpdate(BaseModel):
    status: str