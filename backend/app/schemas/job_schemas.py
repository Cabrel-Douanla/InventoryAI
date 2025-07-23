# Fichier : app/schemas/job_schemas.py

from pydantic import BaseModel
from typing import Optional, Any
import datetime
from app.models.base import JobStatus

# Schéma pour la réponse de soumission d'un job
class JobSubmission(BaseModel):
    job_id: int
    status: JobStatus
    message: str

# Schéma pour la réponse de statut d'un job
class JobStatusResponse(BaseModel):
    job_id: int
    status: JobStatus
    created_at: datetime.datetime
    started_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
    result: Optional[Any] = None # Pourra contenir des erreurs ou des résultats