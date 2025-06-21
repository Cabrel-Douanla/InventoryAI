from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.database import create_db_and_tables
from app.api.v1.endpoints import auth # Importez le module auth
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup...")
    create_db_and_tables()
    yield
    print("Application shutdown...")

app = FastAPI(
    title="InventoryAI Enterprise API",
    description="Backend for the AI-powered stock management platform.",
    version="0.1.0",
    lifespan=lifespan
)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to InventoryAI API! Database and tables are ready."}

# Inclure le routeur de l'API
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])