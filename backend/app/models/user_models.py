from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class Company(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    
    # Relation : Une entreprise peut avoir plusieurs utilisateurs et produits
    users: List["User"] = Relationship(back_populates="company")
    products: List["Product"] = Relationship(back_populates="company")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    
    # Clé étrangère vers l'entreprise
    company_id: Optional[int] = Field(default=None, foreign_key="company.id")
    
    # Relation : Un utilisateur appartient à une entreprise
    company: Optional[Company] = Relationship(back_populates="users")
    
    # Relation : Un utilisateur peut lancer plusieurs tâches de prédiction
    prediction_jobs: List["PredictionJob"] = Relationship(back_populates="user")