from pydantic import BaseModel

class ProjectInput(BaseModel):

    name: str

    project_type: str

    capacity_mw: float

    operating_hours: float

    cuf: float

    tariff: float

    tariff_escalation: float

    degradation_rate: float

    opex_pct: float

    opex_escalation: float

    project_life: int

    capex: float

    debt_amount: float

    interest_rate: float

    loan_tenor: int

    discount_rate: float