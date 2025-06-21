from pydantic import BaseModel, EmailStr
from typing import Optional

# ==============================================================================
# SCHÉMAS POUR LES UTILISATEURS
# ==============================================================================

# Schéma de base pour un utilisateur, avec les champs partagés
class UserBase(BaseModel):
    email: EmailStr

# Schéma pour la création d'un utilisateur (ce que l'API reçoit)
class UserCreate(UserBase):
    password: str
    company_name: str # On crée l'entreprise en même temps que le premier utilisateur

# Schéma pour la mise à jour d'un utilisateur
class UserUpdate(UserBase):
    password: Optional[str] = None
    is_active: Optional[bool] = None

# Schéma pour la lecture d'un utilisateur (ce que l'API renvoie)
# Important : NE JAMAIS renvoyer le mot de passe haché !
class UserInDB(UserBase):
    id: int
    company_id: int
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True # Anciennement orm_mode = True

# ==============================================================================
# SCHÉMAS POUR L'AUTHENTIFICATION (TOKEN)
# ==============================================================================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None