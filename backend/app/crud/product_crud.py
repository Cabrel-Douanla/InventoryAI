# Fichier : app/crud/product_crud.py

from sqlmodel import Session, select
from typing import List, Optional

from app.models.base import Product
from app.schemas.product_schemas import ProductCreate, ProductUpdate

def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    """Récupère un produit par son ID."""
    return db.get(Product, product_id)

def get_product_by_sku_for_company(db: Session, sku: str, company_id: int) -> Optional[Product]:
    """Récupère un produit par son SKU pour une entreprise spécifique."""
    statement = select(Product).where(Product.sku == sku, Product.company_id == company_id)
    return db.exec(statement).first()

def get_products_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
    """Récupère une liste paginée de produits pour une entreprise spécifique."""
    statement = select(Product).where(Product.company_id == company_id).offset(skip).limit(limit)
    return db.exec(statement).all()

def create_product(db: Session, product_in: ProductCreate, company_id: int) -> Product:
    """Crée un nouveau produit pour une entreprise."""
    # Convertir le schéma Pydantic en modèle de BDD
    db_product = Product.model_validate(product_in)
    db_product.company_id = company_id
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, db_product: Product, product_in: ProductUpdate) -> Product:
    """Met à jour un produit existant."""
    # Récupérer les données du schéma Pydantic qui ne sont pas None
    update_data = product_in.model_dump(exclude_unset=True)
    
    # Mettre à jour les champs de l'objet de BDD
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, db_product: Product) -> None:
    """Supprime un produit."""
    db.delete(db_product)
    db.commit()
    return