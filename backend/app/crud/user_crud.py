from sqlmodel import Session, select
from app.models.base import User, Company
from app.schemas.user_schemas import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str) -> User | None:
    """Récupère un utilisateur par son email."""
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def get_company_by_name(db: Session, name: str) -> Company | None:
    """Récupère une entreprise par son nom."""
    statement = select(Company).where(Company.name == name)
    return db.exec(statement).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    """Crée un nouvel utilisateur et son entreprise si elle n'existe pas."""
    # Vérifier si l'entreprise existe déjà
    db_company = get_company_by_name(db, name=user_in.company_name)
    if not db_company:
        # Créer l'entreprise si elle n'existe pas
        db_company = Company(name=user_in.company_name)
        db.add(db_company)
        db.commit()
        db.refresh(db_company)

    # Créer l'objet utilisateur
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        company_id=db_company.id
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user