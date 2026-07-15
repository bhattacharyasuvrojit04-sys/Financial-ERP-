from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class PFProject(Base):
    __tablename__ = "pf_projects"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    project_type = Column(String)
    project_life = Column(String)
    tax_rate = Column(Float)
    discount_rate = Column(Float)
    debt_amount = Column(Float)
    interest_rate = Column(Float)
    loan_tenor = Column(Integer)
    depreciation_years = Column(Integer)


class PFRevenueItem(Base):
    __tablename__ = "pf_revenue_items"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer)
    name = Column(String)
    year1_amount = Column(Float)
    growth_rate = Column(Float)

class PFOpexItem(Base):
    __tablename__ = "pf_opex_items"

    id = Column(Integer, primary_key=True)

    project_id = Column(Integer)

    name = Column(String)

    year1_amount = Column(Float)

    escalation_rate = Column(Float)


class PFCapexItem(Base):
    __tablename__ = "pf_capex_items"

    id = Column(Integer, primary_key=True)

    project_id = Column(Integer)

    name = Column(String)

    amount = Column(Float)

class PFWorkingCapital(Base):
    __tablename__ = "pf_working_capital"

    id = Column(Integer, primary_key=True)

    project_id = Column(Integer)

    receivable_days = Column(Float)

    payable_days = Column(Float)

    inventory_days = Column(Float)



