import os
from sqlmodel import create_engine, Session

# Récupérer l'URL de la base de données depuis les variables d'environnement
DATABASE_URL = os.getenv("DATABASE_URL")

# Créer le moteur de base de données
# connect_args est nécessaire pour SQLite, mais peut être utile pour d'autres configurations
engine = create_engine(DATABASE_URL, echo=True) # echo=True pour voir les requêtes SQL en dev

def get_session():
    """
    Dépendance FastAPI pour obtenir une session de base de données.
    """
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    """
    Fonction utilitaire pour créer toutes les tables au démarrage de l'application.
    (Sera appelée dans app/main.py)
    """
    from sqlmodel import SQLModel
    # Importer tous les modèles ici pour qu'ils soient enregistrés par SQLModel
    from app.models.base import User, Company, Product, Sale, PredictionJob
    
    print("Creating database and tables...")
    SQLModel.metadata.create_all(engine)
    print("Database and tables created successfully.")