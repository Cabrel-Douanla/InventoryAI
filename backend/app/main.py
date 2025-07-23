# Fichier : app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# NOUVEL IMPORT : Le middleware pour gérer CORS
from fastapi.middleware.cors import CORSMiddleware

# Importer les modules de base de données et les routeurs de l'API
from app.db.database import create_db_and_tables
from app.api.v1.endpoints import auth, company
from app.api.v1.endpoints import auth, company, products
from app.api.v1.endpoints import auth, company, products, sales # Ajouter sales
from app.api.v1.endpoints import auth, company, products, sales, predictions # Ajouter predictions



# Charger les variables d'environnement depuis le fichier .env
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestionnaire du cycle de vie de l'application.
    """
    print("Application startup... Awaiting connections.")
    create_db_and_tables()
    yield
    print("Application shutdown... Cleaning up.")


# Initialiser l'instance de l'application FastAPI
app = FastAPI(
    title="InventoryAI Enterprise API",
    description="Backend for the AI-powered stock management platform.",
    version="0.2.0",
    lifespan=lifespan,
    contact={
        "name": "Projet de Master Recherche - Université de Dschang",
        "url": "http://www.univ-dschang.org/",
    },
)

# ==============================================================================
# CONFIGURATION DE CORS (Cross-Origin Resource Sharing)
# ==============================================================================
# Cette section est cruciale pour permettre à votre frontend (ou à la doc Swagger)
# de communiquer avec votre API depuis une origine différente.

# Liste des origines autorisées à faire des requêtes.
# Pour le développement, on peut être permissif.
# En production, vous devriez restreindre cela à l'URL de votre frontend.
origins = [
    "http://localhost",
    "http://localhost:3000", # Pour un frontend React/Vue/Svelte en dev
    "http://localhost:8080", # Pour un autre frontend en dev
    "http://localhost:5173", # Pour Vite.js en dev
    # Ajoutez ici l'URL de votre frontend de production, par ex: "https://votre-app.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Autorise les origines spécifiques listées ci-dessus
    allow_credentials=True, # Autorise les cookies et les en-têtes d'authentification
    allow_methods=["*"],    # Autorise toutes les méthodes (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Autorise tous les en-têtes
)


# ==============================================================================
# INCLUSION DES ROUTEURS DE L'API
# ==============================================================================

app.include_router(
    auth.router, 
    prefix="/api/v1",
    tags=["Authentication & User Management"]
)

app.include_router(
    company.router,
    prefix="/api/v1/company",
    tags=["Company Management"]
)

# Inclure le routeur pour la gestion des produits
app.include_router(
    products.router,
    prefix="/api/v1/products", # Les routes seront /api/v1/products/...
    tags=["Product Management"]
)

app.include_router(
    sales.router,
    prefix="/api/v1/sales",
    tags=["Sales Data Management"]
)

app.include_router(
    predictions.router,
    prefix="/api/v1/predictions",
    tags=["AI Predictions"]
)

# ==============================================================================
# ENDPOINT RACINE
# ==============================================================================

@app.get("/", tags=["Root"])
def read_root():
    """
    A simple root endpoint to check if the API is running and healthy.
    """
    return {
        "status": "ok",
        "message": "Welcome to InventoryAI API! Navigate to /docs for the API documentation."
    }