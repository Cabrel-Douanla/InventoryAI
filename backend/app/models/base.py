# Ce fichier sert de point d'entrée central pour tous les modèles de la BDD.
# Cela simplifie les importations et la gestion des dépendances.

from .inventory_models import Product, Sale, PredictionJob, JobStatus
from .user_models import User, Company, CompanyUserLink, UserRole
