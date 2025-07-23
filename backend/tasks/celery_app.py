# Fichier : tasks/celery_app.py

import os
from celery import Celery
from dotenv import load_dotenv

# Charger les variables d'environnement pour que Celery connaisse son broker
load_dotenv(".env")

# Initialiser l'instance de Celery
# Le premier argument 'tasks' est le nom du module courant
# Le broker et le backend sont lus depuis les variables d'environnement
celery = Celery(
    "tasks",
    broker=os.getenv("CELERY_BROKER_URL"),
    backend=os.getenv("CELERY_RESULT_BACKEND"),
    # AJOUTER LA NOUVELLE TÂCHE
    include=["tasks.data_processing", "tasks.model_inference"]
)

# Configuration optionnelle pour une meilleure gestion
celery.conf.update(
    task_track_started=True,
)