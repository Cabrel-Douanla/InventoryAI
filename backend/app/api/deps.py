from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlmodel import Session

from app.db.database import get_session
from app.crud import user_crud
from app.models.base import User, Company, UserRole
from app.schemas.user_schemas import TokenData
from app.core.security import SECRET_KEY, ALGORITHM
from fastapi import Header


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/token")

def get_current_user(
    db: Session = Depends(get_session), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenData(email=payload.get("sub"))
        if token_data.email is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user = user_crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dépendance pour vérifier si l'utilisateur courant est un admin.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_active_company_and_role(
    # L'ID de l'entreprise vient UNIQUEMENT du header.
    active_company_id: int = Header(..., alias="X-Company-ID", description="ID de l'entreprise active pour la session"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session) # Ajout de la session db pour récupérer l'objet Company
) -> tuple[Company, UserRole]:
    """
    Dépendance qui récupère l'ID de l'entreprise depuis les headers,
    vérifie que l'utilisateur courant est bien membre de cette entreprise,
    et retourne l'objet Company et le rôle de l'utilisateur.
    """
    # Chercher le lien dans les associations de l'utilisateur
    link = next((link for link in current_user.company_links if link.company_id == active_company_id), None)
    
    if not link:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this company.",
        )
    
    # Récupérer l'objet Company complet
    company = db.get(Company, active_company_id)
    if not company:
        # Cas très rare où le lien existe mais l'entreprise a été supprimée
        raise HTTPException(status_code=404, detail="Company not found.")

    return company, link.role

# On peut aussi créer une dépendance spécifique pour les admins de l'entreprise active
def get_active_company_admin(
    company_and_role: tuple[Company, UserRole] = Depends(get_active_company_and_role)
) -> Company:
    company, role = company_and_role
    if role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="The user doesn't have admin privileges for this company"
        )
    return company

def get_company_from_path_and_verify_access(
    company_id: int, # L'ID vient maintenant du path parameter
    current_user: User = Depends(get_current_active_user)
) -> tuple[Company, UserRole]:
    """
    Dépendance qui récupère l'ID de l'entreprise depuis le chemin de l'URL,
    vérifie que l'utilisateur courant est bien membre de cette entreprise,
    et retourne l'objet Company et le rôle de l'utilisateur dans celle-ci.
    """
    # Chercher le lien dans les associations de l'utilisateur
    link = next((link for link in current_user.company_links if link.company_id == company_id), None)
    
    if not link:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to the requested company.",
        )
    
    # La relation 'company' devrait être chargée ici
    if not link.company:
        raise HTTPException(status_code=404, detail="Company not found or relationship not loaded.")
        
    return link.company, link.role

# On peut aussi créer une dépendance pour les admins qui utilise la précédente
def get_admin_for_company_in_path(
    company_and_role: tuple[Company, UserRole] = Depends(get_company_from_path_and_verify_access)
) -> Company:
    company, role = company_and_role
    if role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="The user doesn't have admin privileges for this company."
        )
    return company