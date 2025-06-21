from typing import List, Optional
from app.models.inventory_models import PredictionJob, Product
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class CompanyUserLink(SQLModel, table=True):
    company_id: Optional[int] = Field(
        default=None, foreign_key="company.id", primary_key=True
    )
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", primary_key=True
    )
    role: UserRole = Field(default=UserRole.MEMBER)
    
    # AJOUT : Définir les relations inverses
    company: "Company" = Relationship(back_populates="user_links")
    user: "User" = Relationship(back_populates="company_links")


class Company(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    
    # La relation est correcte ici
    user_links: List["CompanyUserLink"] = Relationship(back_populates="company")
    products: List["Product"] = Relationship(back_populates="company")


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    
    # La relation est correcte ici
    company_links: List["CompanyUserLink"] = Relationship(back_populates="user")
    prediction_jobs: List["PredictionJob"] = Relationship(back_populates="user")