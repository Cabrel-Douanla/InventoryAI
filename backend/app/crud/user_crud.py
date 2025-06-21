from sqlmodel import Session, select
from app.models.base import User, Company, CompanyUserLink, UserRole
from app.schemas.user_schemas import UserRegister, UserInvite, CompanyCreate
from app.core.security import get_password_hash
from typing import List, Any
from sqlalchemy.orm import selectinload


def get_user_by_email(db: Session, email: str) -> User | None:
    """Récupère un utilisateur par son email."""
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def get_company_by_name(db: Session, name: str) -> Company | None:
    """Récupère une entreprise par son nom."""
    statement = select(User).where(User.email == name)
    return db.exec(statement).first()


# MODIFICATION : La fonction de création est maintenant beaucoup plus simple
def create_user(db: Session, user_in: UserRegister) -> User:
    """Crée un nouvel utilisateur dans le système, sans l'associer à une entreprise."""
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        is_active=True # L'utilisateur est actif dès son inscription
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# NOUVEAU : La fonction pour créer une entreprise par un utilisateur existant
def create_company_for_user(db: Session, company_in: CompanyCreate, user: User) -> Company:
    """Crée une nouvelle entreprise et en fait de l'utilisateur courant son premier admin."""
    # Créer l'entreprise
    db_company = Company(name=company_in.name)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    # Créer le lien entre l'entreprise et l'utilisateur avec le rôle ADMIN
    link = CompanyUserLink(company_id=db_company.id, user_id=user.id, role=UserRole.ADMIN)
    db.add(link)
    db.commit()
    db.refresh(link)
    
    return db_company

def create_first_admin_and_company(db: Session, user_in: UserRegister) -> User:
    """Crée une nouvelle entreprise et son premier utilisateur admin."""
    # Créer l'entreprise
    db_company = Company(name=user_in.company_name)
    db.add(db_company)
    
    # Créer l'utilisateur
    hashed_password = get_password_hash(user_in.password)
    db_user = User(email=user_in.email, hashed_password=hashed_password)
    db.add(db_user)

    # Commit pour obtenir les IDs
    db.commit()
    db.refresh(db_company)
    db.refresh(db_user)

    # Créer le lien entre les deux avec le rôle ADMIN
    link = CompanyUserLink(company_id=db_company.id, user_id=db_user.id, role=UserRole.ADMIN)
    db.add(link)
    db.commit()
    
    return db_user


def invite_user_to_company(db: Session, user_to_invite: UserInvite, company_id: int) -> User:
    """Invite un utilisateur (existant ou non) dans une entreprise."""
    # Vérifier si l'utilisateur existe déjà
    db_user = get_user_by_email(db, email=user_to_invite.email)
    if not db_user:
        # S'il n'existe pas, le créer (sans mot de passe)
        db_user = User(email=user_to_invite.email, is_active=False)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    # Vérifier si le lien n'existe pas déjà
    existing_link = db.get(CompanyUserLink, (company_id, db_user.id))
    if existing_link:
        raise ValueError("User is already a member of this company.")
        
    # Créer le lien
    link = CompanyUserLink(
        company_id=company_id, 
        user_id=db_user.id, 
        role=user_to_invite.role
    )
    db.add(link)
    db.commit()
    return db_user

def get_company_members(db: Session, company_id: int) -> List[User]:
    """Récupère tous les utilisateurs d'une entreprise, en pré-chargeant les liens."""
    statement = (
        select(User)
        .join(CompanyUserLink)
        .where(CompanyUserLink.company_id == company_id)
        .options(selectinload(User.company_links).selectinload(CompanyUserLink.company))
    )
    return db.exec(statement).unique().all()