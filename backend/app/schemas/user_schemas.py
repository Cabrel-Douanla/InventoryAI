from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.models.user_models import UserRole

# ==============================================================================
# SCHÉMAS DE BASE
# ==============================================================================

class UserBase(BaseModel):
    email: EmailStr

class CompanyBase(BaseModel):
    name: str

# ==============================================================================
# SCHÉMAS POUR LES ACTIONS (INPUT)
# ==============================================================================

class UserRegister(UserBase):
    password: str

class CompanyCreate(CompanyBase):
    pass

class UserInvite(UserBase):
    role: UserRole = UserRole.MEMBER

# ==============================================================================
# SCHÉMAS POUR LES RÉPONSES (OUTPUT)
# ==============================================================================

# NOUVEAU / CORRIGÉ : Représente une affiliation d'un utilisateur à une entreprise.
class UserCompany(CompanyBase):
    id: int
    role: UserRole

# MODIFICATION MAJEURE : UserInDB ne contient PLUS company_id ou role.
# Il représente un utilisateur et la liste de ses affiliations.
class UserInDB(UserBase):
    id: int
    is_active: bool
    companies: List[UserCompany] = [] # La liste de ses entreprises

    class Config:
        from_attributes = True

# MODIFICATION MAJEURE : CompanyMember est maintenant un schéma indépendant.
# Il représente un utilisateur tel qu'il apparaît dans la liste des membres d'une entreprise.
class CompanyMember(UserBase):
    id: int
    is_active: bool
    role: UserRole # Le rôle spécifique à cette entreprise

class CompanyDetails(CompanyBase):
    id: int
    members: List[CompanyMember]

# Schéma pour la réponse du login, utilisant le UserInDB corrigé
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserInDB

# --- Schémas pour les Tokens ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class SpecialTokenData(TokenData):
    purpose: str