# app/db/models.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    # Plus tard, nous ajouterons ici une clé étrangère vers Company
    # company_id = Column(Integer, ForeignKey("companies.id"))
    # company = relationship("Company", back_populates="users")