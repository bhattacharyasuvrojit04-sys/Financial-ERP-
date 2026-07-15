from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey
from app.db import Base
from sqlalchemy.orm import relationship

class Project(Base):

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)

    name = Column(String)
    project_type = Column(String)

    project_life = Column(Integer)

    tax_rate = Column(Float)
    discount_rate = Column(Float)

    debt_amount = Column(Float)
    interest_rate = Column(Float)
    loan_tenor = Column(Integer)

    construction_period_months = Column(Integer,default=12)

    moratorium_months = Column(Integer, default=0)
    repayment_frequency = Column(String, default="Monthly")

    repayment_type = Column(String, default="Equal Principal")

    interest_type = Column(String, default="Fixed")

    interest_capitalized = Column(Boolean, default=False)

    depreciation_years = Column(Integer)

    revenue_items = relationship(
        "RevenueItem",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    opex_items = relationship(
        "OpexItem",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    capex_items = relationship(
        "CapexItem",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    asset_items = relationship(
        "AssetItem",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    liability_items = relationship(
        "LiabilityItem",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    equity_items = relationship(
        "EquityItem",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    working_capital = relationship(
        "WorkingCapital",
        uselist=False,
        back_populates="project",
        cascade="all, delete-orphan"
    )

    debt_drawdowns = relationship(
        "DebtDrawdown",
        back_populates="project",
        cascade="all, delete-orphan"
    )


class RevenueItem(Base):

    __tablename__ = "revenue_items"

    id = Column(Integer, primary_key=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    project = relationship("Project", back_populates = "revenue_items")

    name = Column(String)

    revenue_type = Column(String)

    growth_rate = Column(Float)

    amount = Column(Float)

    capacity_mw = Column(Float)

    operating_hours = Column(Float)

    cuf = Column(Float)

    tariff = Column(Float)

    tariff_escalation = Column(Float)

    degradation_rate = Column(Float)

    rooms = Column(Integer)

    occupancy_pct = Column(Float)

    adr = Column(Float)


class OpexItem(Base):

    __tablename__ = "opex_items"

    id = Column(Integer, primary_key=True)

    project = relationship("Project", back_populates = "opex_items")

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    name = Column(String)

    amount = Column(Float)

    escalation_rate = Column(Float)


class CapexItem(Base):

    __tablename__ = "capex_items"

    id = Column(Integer, primary_key=True)

    project = relationship("Project", back_populates = "capex_items")

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    name = Column(String)

    amount = Column(Float)

class AssetItem(Base):

    __tablename__ = "asset_items"

    id = Column(Integer, primary_key=True)

    project = relationship("Project", back_populates = "asset_items")

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    name = Column(String)

    amount = Column(Float)

    growth_rate = Column(Float)

    asset_type = Column(String)

class LiabilityItem(Base):

    __tablename__ = "liability_items"

    id = Column(Integer, primary_key=True)

    project = relationship("Project", back_populates = "liability_items")

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    name = Column(String)

    amount = Column(Float)

    growth_rate = Column(Float)

class EquityItem(Base):

    __tablename__ = "equity_items"

    id = Column(Integer, primary_key=True)

    project = relationship("Project", back_populates = "equity_items")

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    name = Column(String)

    amount = Column(Float)

    growth_rate = Column(Float)
    

class WorkingCapital(Base):

    __tablename__ = "working_capital"

    id = Column(Integer, primary_key=True)

    project = relationship("Project", back_populates = "working_capital")

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        unique=True
    )

    receivable_days = Column(Float)

    payable_days = Column(Float)

    inventory_days = Column(Float)

class DebtDrawdown(Base):

    __tablename__ = "debt_drawdowns"

    id = Column(
        Integer,
        primary_key=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    year = Column(Integer)

    drawdown_amount = Column(Float)
    drawdown_months = Column(Integer, default=1)
    project = relationship(
        "Project",
        back_populates=
        "debt_drawdowns"
    )
