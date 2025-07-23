# Fichier : tasks/model_inference.py

import datetime
import json
import pandas as pd
from sqlmodel import Session, select

from tasks.celery_app import celery
from app.db.database import engine
from app.models.base import PredictionJob, JobStatus, Sale, Product
from app.core.prediction_logic import run_prediction_pipeline

@celery.task(bind=True)
def run_prediction_for_product(self, job_id: int, product_id: int, company_id: int):
    """
    Tâche Celery pour lancer une prédiction de demande pour un produit spécifique.
    Les opérations de BDD sont séparées des calculs longs pour éviter les deadlocks.
    """
    
    # --- Transaction 1 : Démarrer le job et récupérer les données ---
    print(f"Job {job_id}: Démarrage et récupération des données.")
    sales_df = None
    product_sku = "unknown"
    
    with Session(engine) as db:
        job = db.get(PredictionJob, job_id)
        if not job:
            print(f"Job {job_id}: ERREUR - Job non trouvé.")
            # La tâche échouera mais il n'y a pas d'objet job à mettre à jour.
            raise ValueError("Job not found")

        job.status = JobStatus.RUNNING
        job.started_at = datetime.datetime.utcnow()
        db.add(job)
        db.commit()

        product = db.get(Product, product_id)
        if not product or product.company_id != company_id:
            raise ValueError("Product not found or access denied.")
        product_sku = product.sku # Sauvegarder pour les logs

        sales_records = db.exec(select(Sale).where(Sale.product_id == product_id).order_by(Sale.transaction_date)).all()

        if len(sales_records) < 30:
            raise ValueError(f"Not enough sales data for product {product.sku}. At least 30 data points are required.")

        sales_df = pd.DataFrame(
            [{"ds": s.transaction_date, "y": s.quantity_sold} for s in sales_records]
        )
        sales_df['ds'] = pd.to_datetime(sales_df['ds'])
    
    # À ce stade, la transaction 1 est terminée et la session est fermée.
    # La ligne du job n'est plus verrouillée.
    
    # --- Partie Calcul (Hors transaction) ---
    prediction_results = None
    try:
        print(f"Job {job_id}: Démarrage du pipeline de prédiction pour le produit {product_sku}.")
        prediction_results = run_prediction_pipeline(sales_df)
        print(f"Job {job_id}: Pipeline de prédiction terminé.")
        
        # --- Transaction 2 : Sauvegarder les résultats ---
        print(f"Job {job_id}: Sauvegarde des résultats...")
        with Session(engine) as db:
            job = db.get(PredictionJob, job_id) # Récupérer à nouveau l'objet job
            if job:
                job.status = JobStatus.SUCCESS
                job.completed_at = datetime.datetime.utcnow()
                job.result_data = json.dumps(prediction_results, indent=4)
                db.add(job)
                db.commit()
                print(f"Job {job_id}: Résultats sauvegardés avec succès.")
        
        return {"status": "SUCCESS", "product_sku": product_sku, "results_preview": list(prediction_results.keys())}

    except Exception as e:
        # --- Transaction d'Erreur : Sauvegarder l'échec ---
        print(f"Job {job_id}: ERREUR pendant le pipeline - {e}")
        with Session(engine) as db:
            job = db.get(PredictionJob, job_id)
            if job:
                job.status = JobStatus.FAILED
                job.completed_at = datetime.datetime.utcnow()
                job.result_data = str(e)
                db.add(job)
                db.commit()
                print(f"Job {job_id}: Statut d'erreur sauvegardé.")
        
        # Relancer l'exception pour que Celery marque la tâche comme FAILED
        raise e