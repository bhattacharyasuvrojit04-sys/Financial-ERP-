from pydantic import BaseModel
from typing import Optional

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
    
    