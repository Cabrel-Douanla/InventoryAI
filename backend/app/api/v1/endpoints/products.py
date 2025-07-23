# Fichier : app/api/v1/endpoints/products.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Any

from app.db.database import get_session
from app.crud import product_crud
from app.schemas.product_schemas import ProductCreate, ProductUpdate, ProductInDB
from app.models.base import Company, UserRole
from app.api.deps import get_active_company_and_role

router = APIRouter()

@router.post("/", response_model=ProductInDB, status_code=status.HTTP_201_CREATED)
def create_new_product(
    product_in: ProductCreate,
    db: Session = Depends(get_session),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> Any:
    """
    Crée un nouveau produit pour l'entreprise active (spécifiée dans X-Company-ID).
    """
    active_company, user_role = active_company_info
    
    # Vérifier que le SKU n'est pas déjà utilisé pour cette entreprise
    existing_product = product_crud.get_product_by_sku_for_company(
        db, sku=product_in.sku, company_id=active_company.id
    )
    if active_company.id:
        product_in.company_id = active_company.id

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{product_in.sku}' already exists in this company.",
        )
    
    return product_crud.create_product(db, product_in=product_in, company_id=active_company.id)

@router.get("/", response_model=List[ProductInDB])
def list_products(
    db: Session = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> Any:
    """
    Liste tous les produits de l'entreprise active. La pagination est supportée.
    """
    active_company, _ = active_company_info
    return product_crud.get_products_by_company(db, company_id=active_company.id, skip=skip, limit=limit)

@router.get("/{product_id}", response_model=ProductInDB)
def get_product_details(
    product_id: int,
    db: Session = Depends(get_session),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> Any:
    """
    Récupère les détails d'un produit spécifique.
    """
    active_company, _ = active_company_info
    product = product_crud.get_product_by_id(db, product_id=product_id)
    
    if not product or product.company_id != active_company.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have access to it.",
        )
    return product

@router.put("/{product_id}", response_model=ProductInDB)
def update_existing_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_session),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> Any:
    """
    Met à jour un produit existant.
    """
    active_company, user_role = active_company_info
    
    # Admins et membres peuvent modifier, on pourrait ajouter une logique de rôle plus fine ici si besoin
    
    db_product = product_crud.get_product_by_id(db, product_id=product_id)
    if not db_product or db_product.company_id != active_company.id:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    # Si le SKU est modifié, vérifier qu'il n'entre pas en conflit avec un autre produit
    if product_in.sku and product_in.sku != db_product.sku:
        existing_product = product_crud.get_product_by_sku_for_company(
            db, sku=product_in.sku, company_id=active_company.id
        )
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Another product with SKU '{product_in.sku}' already exists.",
            )

    return product_crud.update_product(db, db_product=db_product, product_in=product_in)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_product(
    product_id: int,
    db: Session = Depends(get_session),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> None:
    """
    Supprime un produit. Seuls les admins de l'entreprise peuvent le faire.
    """
    active_company, user_role = active_company_info
    
    # Vérification des permissions
    if user_role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete products.",
        )
        
    db_product = product_crud.get_product_by_id(db, product_id=product_id)
    if not db_product or db_product.company_id != active_company.id:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    product_crud.delete_product(db, db_product=db_product)
    return