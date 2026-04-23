from sqlalchemy import Column, Integer, String, Float, ForeignKey, column
from sqlalchemy.orm import relationship
from .db import Base
from sqlalchemy import DateTime
from datetime import datetime, timezone

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # asset, liability, revenue, expense

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
    account = relationship("Account")

class Customer(Base):
    __tablename__ = "customers"
    id= Column(Integer, primary_key= True)
    name = Column(String)

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



