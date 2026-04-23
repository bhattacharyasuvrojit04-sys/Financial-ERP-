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