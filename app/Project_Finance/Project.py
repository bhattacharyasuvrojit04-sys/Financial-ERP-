from sqlalchemy import Column, Integer, String, Float, column
from app.db import Base

class Project(Base):

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    project_type = Column(String)
    capacity_mw = Column(Float)
    tariff = Column(Float)
    project_life = Column(Integer)
    capex = Column(Float)
    debt_amount = Column(Float)
    interest_rate = Column(Float)
    loan_tenor = Column(Integer)


    
