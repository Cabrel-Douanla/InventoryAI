# Fichier : tasks/data_processing.py

import pandas as pd
import io
import datetime
from sqlmodel import Session
from sqlalchemy.exc import IntegrityError

from tasks.celery_app import celery
from app.db.database import engine # Importer le moteur, pas la session
from app.models.base import PredictionJob, JobStatus, Sale, Product

@celery.task(bind=True)
def process_sales_csv(self, job_id: int, file_content_str: str, company_id: int):
    """
    Tâche Celery pour traiter un fichier CSV de ventes et l'insérer en base de données.
    """
    # Utiliser une session de base de données propre à la tâche
    with Session(engine) as db:
        try:
            # Récupérer l'objet Job depuis la BDD
            job = db.get(PredictionJob, job_id)
            if not job:
                # Ne devrait jamais arriver, mais c'est une sécurité
                raise ValueError("Job not found")

            # Mettre à jour le statut du job à RUNNING
            job.status = JobStatus.RUNNING
            job.started_at = datetime.datetime.utcnow()
            db.add(job)
            db.commit()
            
            # Lire le contenu du fichier CSV en mémoire avec Pandas
            csv_file = io.StringIO(file_content_str)
            df = pd.read_csv(csv_file)

            # --- Validation du CSV ---
            required_columns = {"transaction_date", "sku", "quantity_sold", "unit_price"}
            if not required_columns.issubset(df.columns):
                raise ValueError(f"CSV file must contain the following columns: {required_columns}")

            # Récupérer tous les produits de l'entreprise en une seule fois pour optimiser
            products_in_company = db.query(Product).filter(Product.company_id == company_id).all()
            sku_to_product_id = {p.sku: p.id for p in products_in_company}

            sales_to_insert = []
            errors = []
            for index, row in df.iterrows():
                sku = row["sku"]
                if sku not in sku_to_product_id:
                    errors.append(f"Row {index+2}: SKU '{sku}' not found in your products.")
                    continue

                try:
                    sale = Sale(
                        product_id=sku_to_product_id[sku],
                        transaction_date=pd.to_datetime(row["transaction_date"]).date(),
                        quantity_sold=int(row["quantity_sold"]),
                        unit_price=float(row["unit_price"]),
                    )
                    sales_to_insert.append(sale)
                except Exception as e:
                    errors.append(f"Row {index+2}: Invalid data format - {e}")

            if errors:
                raise ValueError("Validation failed. Errors: " + "; ".join(errors))

            # Insertion en masse des données de vente
            db.add_all(sales_to_insert)
            db.commit()
            
            # Mettre à jour le job à SUCCESS
            job.status = JobStatus.SUCCESS
            job.completed_at = datetime.datetime.utcnow()
            job.result_data = f"{len(sales_to_insert)} sales records successfully imported."
            db.add(job)
            db.commit()

            return {"status": "SUCCESS", "records_imported": len(sales_to_insert)}

        except Exception as e:
            # Gérer les erreurs et mettre à jour le job à FAILED
            db.rollback() # Annuler les changements en cas d'erreur
            job = db.get(PredictionJob, job_id) # Récupérer à nouveau le job
            if job:
                job.status = JobStatus.FAILED
                job.completed_at = datetime.datetime.utcnow()
                job.result_data = str(e)
                db.add(job)
                db.commit()
            # Relancer l'exception pour que Celery la marque comme échouée
            raise e