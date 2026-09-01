from pydantic import BaseModel
from typing import Optional

class RevenueItem(BaseModel):

    name: str

    revenue_type: str

    growth_rate: float = 0

    amount: float = 0

    # ---------- SOLAR ----------

    capacity_mw: float = 0

    operating_hours: float = 0

    cuf: float = 0

    tariff: float = 0

    tariff_escalation: float = 0

    degradation_rate: float = 0

    # ---------- HOTEL ----------

    rooms: int = 0

    occupancy_pct: float = 0

    adr: float = 0

    revenue_growth: float = 0

    food_revenue_pct: float = 0

    banquet_revenue_pct: float = 0

    spa_revenue_pct: float = 0

    other_revenue_pct: float = 0

class COGSItemInput(BaseModel):

    name: str

    cogs_industry: str = "generic"

    cogs_type: str

    amount: float = 0

    growth_rate: float = 0

    cost_per_kwh: float = 0

    cost_per_room: float = 0


class OpexItemInput(BaseModel):
    name: str
    amount: float
    escalation_rate: float


class FixedAssetBase(BaseModel):

    asset_name: str

    asset_category: str

    purchase_year: int

    purchase_cost: float

    useful_life: int

    depreciation_rate: float
    
    depreciation_method: str = "SLM"

    salvage_value: float = 0

    is_land: bool = False

    sale_year: Optional[int] = None

    sale_value: float = 0

    notes: Optional[str] = None


class FixedAssetCreate(FixedAssetBase):
    pass


class FixedAssetUpdate(FixedAssetBase):
    pass


class FixedAssetRead(FixedAssetBase):

    id: int

    project_id: int

    class Config:
        from_attributes = True

class AssetItem(BaseModel):
    name: str
    amount: float
    growth_rate: float = 0
    asset_type: str

class LiabilityItem(BaseModel):
    name: str
    amount: float
    growth_rate: float = 0

class EquityItem(BaseModel):
    name: str
    amount: float
    growth_rate: float


class WorkingCapitalInput(BaseModel):
    receivable_days: float
    payable_days: float
    inventory_days: float

    prepaid_expenses: float = 0
    prepaid_growth_rate: float = 0

    other_current_assets: float = 0
    other_current_assets_growth_rate: float = 0

    other_current_liabilities: float = 0
    other_current_liabilities_growth_rate: float = 0

class DebtDrawdown(BaseModel):

    year: int
    drawdown_amount: float
    drawdown_months: int



class ProjectInput(BaseModel):

    name: str

    project_type: str

    project_life: int

    tax_rate: float

    discount_rate: float

    debt_amount: float

    interest_rate: float

    loan_tenor: int

    depreciation_years: int

    revenue_items: list[RevenueItem]

    cogs_items: list[COGSItemInput] = []

    opex_items: list[OpexItemInput]

    fixed_assets: list[FixedAssetCreate]

    asset_items: list[AssetItem]

    liability_items: list[LiabilityItem]

    equity_items: list[EquityItem]

    working_capital: WorkingCapitalInput

    moratorium_months: int

    repayment_frequency: str = "Monthly"

    repayment_type: str = "Equal Principal"

    interest_type: str = "Fixed"

    interest_capitalized: bool = False

    debt_drawdowns: list[DebtDrawdown]

    construction_period_months: int = 12