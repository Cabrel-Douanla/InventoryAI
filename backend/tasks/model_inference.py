# Fichier : tasks/model_inference.py

import datetime
import json
import time
import random
import pandas as pd
from sqlmodel import Session, select

from tasks.celery_app import celery
from app.db.database import engine
from app.models.base import PredictionJob, JobStatus, Sale, Product
from app.core.prediction_logic import run_prediction_pipeline # On créera ce module juste après

@celery.task(bind=True)
def run_prediction_for_product(self, job_id: int, product_id: int, company_id: int):
    """
    Tâche Celery pour lancer une prédiction de demande pour un produit spécifique.
    """
    with Session(engine) as db:
        try:
            # Récupérer et mettre à jour le job
            job = db.get(PredictionJob, job_id)
            if not job:
                raise ValueError("Job not found")
            job.status = JobStatus.RUNNING
            job.started_at = datetime.datetime.utcnow()
            db.add(job)
            db.commit()

            # 1. Récupérer le produit pour valider l'accès
            product = db.get(Product, product_id)
            if not product or product.company_id != company_id:
                raise ValueError("Product not found or access denied.")

            # 2. Récupérer l'historique des ventes pour ce produit
            statement = select(Sale).where(Sale.product_id == product_id).order_by(Sale.transaction_date)
            sales_records = db.exec(statement).all()

            if len(sales_records) < 30: # Seuil minimum de données pour une prédiction
                raise ValueError(f"Not enough sales data for product {product.sku}. At least 30 data points are required.")

            # Créer un DataFrame Pandas à partir des données de vente
            sales_df = pd.DataFrame(
                [{"ds": s.transaction_date, "y": s.quantity_sold} for s in sales_records]
            )

            # 3. Lancer le pipeline de prédiction (logique métier)
            # Cette fonction contient la logique de l'IA (chargement du modèle, prédiction, optimisation)
            prediction_results = run_prediction_pipeline(sales_df)

            # 4. Sauvegarder les résultats
            job.status = JobStatus.SUCCESS
            job.completed_at = datetime.datetime.utcnow()
            # Stocker les résultats au format JSON dans la base de données
            job.result_data = json.dumps(prediction_results, indent=4)
            db.add(job)
            db.commit()

            return {"status": "SUCCESS", "product_sku": product.sku, "results": prediction_results}

        except Exception as e:
            # Gérer les erreurs
            db.rollback()
            job = db.get(PredictionJob, job_id)
            if job:
                job.status = JobStatus.FAILED
                job.completed_at = datetime.datetime.utcnow()
                job.result_data = str(e)
                db.add(job)
                db.commit()
            raise e