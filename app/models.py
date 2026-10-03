from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .db import Base
from sqlalchemy import DateTime
from datetime import datetime, timezone

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    # asset / liability / equity / income / expense
    type = Column(
        String,
        nullable=False
    )

    # Tally-style group
    group_name = Column(
        String,
        nullable=True
    )

    # debit / credit
    normal_balance = Column(
        String,
        nullable=True
    )

    is_system = Column(
        Boolean,
        default=False
    )

    journal_lines = relationship(
        "JournalLine",
        back_populates="account"
    )
    

class JournalEntry(Base):
    __tablename__ = "journal_entry"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    lines = relationship("JournalLine", back_populates="entry")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class JournalLine(Base):
    __tablename__ = "journal_line"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entry.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))

    debit = Column(Float, default=0)
    credit = Column(Float, default=0)

    entry = relationship("JournalEntry", back_populates="lines")

    account = relationship(
    "Account",
    back_populates="journal_lines"
)

class AccountingFixedAsset(Base):
    __tablename__ = "accounting_fixed_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String, unique=True, nullable=False)
    asset_name = Column(String, nullable=False)
    purchase_cost = Column(Float, nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    depreciation_method = Column(String, nullable=False)
    depreciation_rate = Column(Float, nullable=False)
    useful_life_months = Column(Integer, nullable=True)
    salvage_value = Column(Float, default=0)
    status = Column(String, default="active")
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    depreciation_schedule = relationship(
        "DepreciationSchedule",
        back_populates="asset",
        cascade="all, delete-orphan"
    )

class DepreciationSchedule(Base):
    __tablename__ = "accounting_depreciation_schedule"

    id = Column(Integer, primary_key=True, index=True)

    asset_id = Column(
        Integer,
        ForeignKey("accounting_fixed_assets.id"),
        nullable=False
    )

    period = Column(DateTime, nullable=False)
    opening_wdv = Column(Float, nullable=False)
    depreciation_amount = Column(Float, nullable=False)
    closing_wdv = Column(Float, nullable=False)
    status = Column(String, default="due")
    journal_entry_id = Column(
        Integer,
        ForeignKey("journal_entry.id"),
        nullable=True
    )
    posted_at = Column(DateTime, nullable=True)

    asset = relationship(
        "AccountingFixedAsset",
        back_populates="depreciation_schedule"
    )

    journal_entry = relationship("JournalEntry")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    sku = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    category = Column(
        String,
        nullable=True
    )

    unit = Column(
        String,
        nullable=False,
        default="Nos"
    )

    purchase_price = Column(
        Float,
        nullable=False,
        default=0
    )

    selling_price = Column(
        Float,
        nullable=False,
        default=0
    )

    tax_rate = Column(
        Float,
        nullable=False,
        default=0
    )

    inventory_account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=True
    )

    purchase_account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=True
    )

    sales_account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=True
    )

    costing_method = Column(
        String,
        nullable=False,
        default="WEIGHTED_AVERAGE"
    )

    reorder_level = Column(
        Float,
        nullable=False,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    inventory_account = relationship(
        "Account",
        foreign_keys=[inventory_account_id]
    )

    purchase_account = relationship(
        "Account",
        foreign_keys=[purchase_account_id]
    )

    sales_account = relationship(
        "Account",
        foreign_keys=[sales_account_id]
    )

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    customer_code = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    contact_person = Column(String, nullable=True)

    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    billing_address = Column(String, nullable=True)
    shipping_address = Column(String, nullable=True)

    gstin = Column(String, nullable=True)
    state = Column(String, nullable=True)
    state_code = Column(String, nullable=True)
    pan = Column(String, nullable=True)

    payment_terms = Column(
        Integer,
        nullable=False,
        default=0
    )

    credit_limit = Column(
        Float,
        nullable=False,
        default=0
    )

    opening_balance = Column(
        Float,
        nullable=False,
        default=0
    )

    opening_balance_type = Column(
        String,
        nullable=False,
        default="DEBIT"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    supplier_code = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    contact_person = Column(String, nullable=True)

    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    address = Column(String, nullable=True)

    gstin = Column(String, nullable=True)
    state = Column(String, nullable=True)
    state_code = Column(String, nullable=True)
    pan = Column(String, nullable=True)

    payment_terms = Column(
        Integer,
        nullable=False,
        default=0
    )

    credit_limit = Column(
        Float,
        nullable=False,
        default=0
    )

    opening_balance = Column(
        Float,
        nullable=False,
        default=0
    )

    opening_balance_type = Column(
        String,
        nullable=False,
        default="CREDIT"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    amount = Column(Float)
    status = Column(String, default="unpaid")
    customer = relationship("Customer")

class Rule(Base):   
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String)
    category = Column(String)  # revenue / expense

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True)
    users = Column(Float)
    user_growth = Column(Float)
    arpu = Column(Float)
    arpu_growth = Column(Float)
    fixed_cost = Column(Float)
    variable_cost_pct = Column(Float)

# ============================================================
# INVENTORY / STOCK MOVEMENT
# ============================================================

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    movement_type = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Float,
        nullable=False
    )

    unit_cost = Column(
        Float,
        nullable=False,
        default=0
    )

    reference_type = Column(
        String,
        nullable=True
    )

    reference_id = Column(
        Integer,
        nullable=True
    )

    movement_date = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    notes = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    product = relationship(
        "Product"
    )

# ==========================================================
# REORDER REQUEST
# ==========================================================

class ReorderRequest(Base):
    __tablename__ = "inventory_reorder_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    request_number = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    # Stock position when reorder was requested
    stock_quantity = Column(
        Float,
        nullable=False,
        default=0
    )

    reorder_level = Column(
        Float,
        nullable=False,
        default=0
    )

    # Quantity actually requested for replenishment
    requested_quantity = Column(
        Float,
        nullable=False
    )

    unit = Column(
        String,
        nullable=False,
        default="Nos"
    )

    priority = Column(
        String,
        nullable=False,
        default="NORMAL"
    )

    status = Column(
        String,
        nullable=False,
        default="DRAFT"
    )

    notes = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    product = relationship(
        "Product"
    )



