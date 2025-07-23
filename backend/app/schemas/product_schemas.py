# Fichier : app/schemas/product_schemas.py

from pydantic import BaseModel
from typing import Optional

# Schéma de base avec les champs partagés
class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None

# Schéma pour la création d'un produit (ce que l'API reçoit)
class ProductCreate(ProductBase):
    company_id: Optional[str] = None

# Schéma pour la mise à jour d'un produit (tous les champs sont optionnels)
class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None

# Schéma pour la lecture d'un produit (ce que l'API renvoie)
# Inclut les champs générés par la base de données comme l'ID
class ProductInDB(ProductBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True # Permet de créer le schéma à partir d'un objet de BDD