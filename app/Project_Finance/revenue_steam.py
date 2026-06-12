from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.db import Base

class RevenueStream(Base):
    __tablename__ = "revenue_streams"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer)
    year = Column(Integer)
    revenue = Column(Float)