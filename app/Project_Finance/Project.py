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

    cogs_items = relationship(
    "COGSItem",
    back_populates="project",
    cascade="all, delete-orphan"
)

    opex_items = relationship(
        "OpexItem",
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

    fixed_assets = relationship(
    "FixedAsset",
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

    food_revenue_pct = Column(Float, default=0)
    banquet_revenue_pct = Column(Float, default=0)
    spa_revenue_pct = Column(Float, default=0)
    other_revenue_pct = Column(Float, default=0)

class COGSItem(Base):

    __tablename__ = "cogs_items"

    id = Column(Integer, primary_key=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id")
    )

    project = relationship(
        "Project",
        back_populates="cogs_items"
    )

    name = Column(String)

    cogs_type = Column(String)

    amount = Column(Float, default=0)

    growth_rate = Column(Float, default=0)

    # Solar specific
    cost_per_kwh = Column(Float, default=0)

    # Hotel specific
    cost_per_room = Column(Float, default=0)


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

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        unique=True
    )

    project = relationship(
        "Project",
        back_populates="working_capital"
    )

    receivable_days = Column(Float, default=30)

    inventory_days = Column(Float, default=0)

    payable_days = Column(Float, default=30)

    # ============================
    # Manual Current Assets
    # ============================

    prepaid_expenses = Column(Float, default=0)

    prepaid_growth_rate = Column(Float, default=0)

    other_current_assets = Column(Float, default=0)

    other_current_assets_growth_rate = Column(Float, default=0)

    # ============================
    # Manual Current Liabilities
    # ============================

    other_current_liabilities = Column(Float, default=0)

    other_current_liabilities_growth_rate = Column(Float, default=0)

    
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

class FixedAsset(Base):

    __tablename__ = "fixed_assets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    project = relationship(
        "Project",
        back_populates="fixed_assets"
    )

    # ======================================
    # MASTER ASSET INFORMATION
    # ======================================

    asset_name = Column(
        String,
        nullable=False
    )

    asset_category = Column(
        String,
        nullable=False
    )

    purchase_year = Column(
        Integer,
        nullable=False,
        default=1
    )

    purchase_cost = Column(
        Float,
        nullable=False,
        default=0
    )

    useful_life = Column(
        Integer,
        nullable=False
    )

    depreciation_method = Column(
        String,
        default="SLM"
    )

    salvage_value = Column(
        Float,
        default=0
    )

    # ======================================
    # OPTIONAL DISPOSAL
    # ======================================

    sale_year = Column(
        Integer,
        nullable=True
    )

    sale_value = Column(
        Float,
        default=0
    )

    # ======================================
    # FLAGS
    # ======================================

    is_land = Column(
        Boolean,
        default=False
    )

    notes = Column(
        String,
        nullable=True
    )