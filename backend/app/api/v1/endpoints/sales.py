# Fichier : app/api/v1/endpoints/sales.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlmodel import Session
from typing import Any

from app.db.database import get_session
from app.models.base import User, Company, PredictionJob
from app.schemas.job_schemas import JobSubmission, JobStatusResponse
from app.api.deps import get_current_active_user, get_active_company_and_role
from tasks.data_processing import process_sales_csv # Importer la tâche Celery

router = APIRouter()

@router.post("/upload", response_model=JobSubmission, status_code=status.HTTP_202_ACCEPTED)
async def upload_sales_data(
    file: UploadFile = File(..., description="CSV file with sales data."),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    active_company_info: tuple = Depends(get_active_company_and_role)
) -> Any:
    """
    Upload a CSV file with historical sales data.
    This triggers an asynchronous background job to process the file.
    """
    active_company, _ = active_company_info

    # Vérifier que le fichier est bien un CSV
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a CSV file."
        )

    # Créer un enregistrement de job dans la BDD
    new_job = PredictionJob(user_id=current_user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Lire le contenu du fichier pour le passer à Celery
    file_content = await file.read()
    
    # Lancer la tâche Celery en arrière-plan
    process_sales_csv.delay(
        job_id=new_job.id, 
        file_content_str=file_content.decode("utf-8"), 
        company_id=active_company.id
    )

    return {
        "job_id": new_job.id,
        "status": new_job.status,
        "message": "Sales data upload has been scheduled. Check job status for progress."
    }


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(
    job_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Check the status of a previously submitted job (e.g., data upload).
    """
    job = db.get(PredictionJob, job_id)

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    
    # Sécurité : un utilisateur ne peut voir que ses propres jobs
    if job.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this job.")

    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
        result=job.result_data # Contient le message de succès ou l'erreur
    )