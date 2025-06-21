# Fichier : app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import Any

from app.db.database import get_session
from app.crud import user_crud
from app.schemas.user_schemas import (
    UserRegister, 
    UserInDB, 
    LoginResponse, 
    UserCompany
)
from app.models.base import User
from app.core.security import create_access_token, verify_password
from app.api.deps import get_current_active_user

router = APIRouter()


@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register_new_user(user_in: UserRegister, db: Session = Depends(get_session)) -> Any:
    """
    Crée un nouveau compte utilisateur. 
    Ce compte n'est initialement lié à aucune entreprise.
    """
    user = user_crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    new_user = user_crud.create_user(db, user_in=user_in)
    
    # La liste des entreprises sera vide au début
    return UserInDB(
        id=new_user.id,
        email=new_user.email,
        is_active=new_user.is_active,
        companies=[], # Vide à l'inscription !
    )


@router.post("/login/token", response_model=LoginResponse)
def login_for_access_token(
    db: Session = Depends(get_session), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login.
    Un utilisateur fournit son email (username) et son mot de passe.
    En retour, il reçoit un token d'accès et la liste de ses entreprises.
    """
    user = user_crud.get_user_by_email(db, email=form_data.username)
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    access_token = create_access_token(data={"sub": user.email})
    
    # Construire la liste des entreprises et des rôles de l'utilisateur
    user_companies = [
        UserCompany(id=link.company.id, name=link.company.name, role=link.role)
        for link in user.company_links
    ]
    
    user_info = UserInDB(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        companies=user_companies
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user_info}


@router.get("/users/me", response_model=UserInDB)
def read_users_me(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Récupère les informations complètes de l'utilisateur actuellement authentifié.
    Utile pour rafraîchir les informations de l'utilisateur dans le frontend.
    """
    # Construire la réponse complète, y compris les affiliations aux entreprises
    user_companies = [
        UserCompany(id=link.company.id, name=link.company.name, role=link.role)
        for link in current_user.company_links
    ]

    return UserInDB(
        id=current_user.id,
        email=current_user.email,
        is_active=current_user.is_active,
        companies=user_companies,
    )