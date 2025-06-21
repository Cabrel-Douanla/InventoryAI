from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import Any

from app.db.database import get_session
from app.crud import user_crud
from app.schemas.user_schemas import UserCreate, UserInDB, Token
from app.core.security import create_access_token, verify_password
from app.api.deps import get_current_active_user # On créera ce fichier juste après

router = APIRouter()

@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register_new_user(user_in: UserCreate, db: Session = Depends(get_session)) -> Any:
    """
    Crée un nouvel utilisateur et son entreprise.
    """
    user = user_crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    company = user_crud.get_company_by_name(db, name=user_in.company_name)
    if company:
        raise HTTPException(
            status_code=400,
            detail="A company with this name already exists. Please choose another name.",
        )
    new_user = user_crud.create_user(db, user_in=user_in)
    return new_user

@router.post("/login/token", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_session), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = user_crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserInDB)
def read_users_me(current_user: UserInDB = Depends(get_current_active_user)) -> Any:
    """
    Get current user.
    """
    return current_user