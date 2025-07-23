# Fichier : app/api/v1/endpoints/predictions.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Any

from app.db.database import get_session
from app.models.base import User, Company, Product, PredictionJob
from app.schemas.job_schemas import JobSubmission
from app.api.deps import get_active_company_and_role
from tasks.model_inference import run_prediction_for_product # Importer la tâche

router = APIRouter()

@router.post("/product/{product_id}", response_model=JobSubmission, status_code=status.HTTP_202_ACCEPTED)
def trigger_product_prediction(
    product_id: int,
    db: Session = Depends(get_session),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> Any:
    """
    Triggers an asynchronous demand forecast prediction for a specific product.
    The product must belong to the active company (specified in X-Company-ID).
    """
    active_company, _ = active_company_info
    
    # Vérifier que le produit existe et appartient bien à l'entreprise active
    product = db.get(Product, product_id)
    if not product or product.company_id != active_company.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have access to it."
        )

    # Récupérer l'utilisateur pour lier le job
    # On pourrait aussi passer l'objet User via la dépendance si on le modifie
    user_id = next(link.user_id for link in active_company.user_links if link.user.is_active)

    # Créer un enregistrement de job dans la BDD
    new_job = PredictionJob(user_id=user_id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Lancer la tâche Celery en arrière-plan
    run_prediction_for_product.delay(
        job_id=new_job.id,
        product_id=product.id,
        company_id=active_company.id
    )

    return {
        "job_id": new_job.id,
        "status": new_job.status,
        "message": f"Prediction job for product SKU '{product.sku}' has been scheduled."
    }