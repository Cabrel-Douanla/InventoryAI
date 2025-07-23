# Fichier: app/api/v1/endpoints/dashboard.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.database import get_session
from app.crud import product_crud, dashboard_crud
from app.schemas.dashboard_schemas import ProductDashboardData
from app.api.deps import get_active_company_and_role
from app.models.base import Company

router = APIRouter()


@router.get("/product/{product_id}", response_model=ProductDashboardData)
def get_product_dashboard(
    product_id: int,
    db: Session = Depends(get_session),
    active_company_info: tuple = Depends(get_active_company_and_role)
):
    """
    Récupère toutes les données nécessaires pour le tableau de bord d'un produit spécifique,
    y compris les KPIs, les données du graphique et les facteurs d'influence.
    """
    active_company, _ = active_company_info
    
    # 1. Vérifier que le produit appartient bien à l'entreprise active
    product = product_crud.get_product_by_id(db, product_id=product_id)
    if not product or product.company_id != active_company.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have access to it.",
        )
    
    # 2. Appeler la fonction métier pour calculer toutes les données
    dashboard_data = dashboard_crud.get_dashboard_data_for_product(db, product)
    
    if not dashboard_data.get("chart_data"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough historical data to generate a dashboard for this product.",
        )
        
    # 3. Formater la réponse selon le schéma Pydantic
    return ProductDashboardData(
        product_id=product.id,
        product_sku=product.sku,
        product_name=product.name,
        kpis=dashboard_data["kpis"],
        chart_data=dashboard_data["chart_data"],
        influencing_factors=dashboard_data["influencing_factors"],
    )