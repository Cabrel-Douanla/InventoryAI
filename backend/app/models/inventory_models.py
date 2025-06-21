import datetime
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sku: str = Field(index=True)  # Stock Keeping Unit
    name: str
    description: Optional[str] = None
    
    # Clé étrangère vers l'entreprise
    company_id: int = Field(foreign_key="company.id")
    
    # Relation : Un produit appartient à une entreprise
    company: "Company" = Relationship(back_populates="products")
    
    # Relation : Un produit a plusieurs enregistrements de vente
    sales: List["Sale"] = Relationship(back_populates="product")


class Sale(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    transaction_date: datetime.date
    quantity_sold: int
    unit_price: float
    
    # Clé étrangère vers le produit
    product_id: int = Field(foreign_key="product.id")
    
    # Relation : Une vente concerne un produit
    product: Product = Relationship(back_populates="sales")


class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class PredictionJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: JobStatus = Field(default=JobStatus.PENDING)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    started_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
    result_data: Optional[str] = None # Pourrait stocker un JSON de résultats ou un chemin de fichier
    
    # Clé étrangère vers l'utilisateur qui a lancé la tâche
    user_id: int = Field(foreign_key="user.id")
    
    # Relation : Une tâche a été lancée par un utilisateur
    user: "User" = Relationship(back_populates="prediction_jobs")