from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Any

from app.db.database import get_session
from app.crud import user_crud
from app.schemas.user_schemas import (
    CompanyCreate,
    CompanyDetails,
    CompanyMember,
    UserInvite,
    UserInDB,
    UserCompany,
)
from app.models.base import User, Company, UserRole
from app.api.deps import (
    get_current_active_user,
    get_company_from_path_and_verify_access,
    get_admin_for_company_in_path,
)

router = APIRouter()


@router.post("/", response_model=CompanyDetails, status_code=status.HTTP_201_CREATED)
def create_new_company(
    company_in: CompanyCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    [Utilisateur authentifié] Crée une nouvelle entreprise.
    L'utilisateur qui la crée en devient automatiquement le premier administrateur.
    """
    # Vérifier que le nom de l'entreprise n'est pas déjà pris
    company = user_crud.get_company_by_name(db, name=company_in.name)
    if company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A company with this name already exists.",
        )

    new_company = user_crud.create_company_for_user(
        db, company_in=company_in, user=current_user
    )

    # Construire la réponse CompanyDetails pour la nouvelle entreprise
    admin_member = CompanyMember(
        id=current_user.id,
        email=current_user.email,
        is_active=current_user.is_active,
        role=UserRole.ADMIN,
    )

    return CompanyDetails(
        id=new_company.id, name=new_company.name, members=[admin_member]
    )


@router.get("/{company_id}", response_model=CompanyDetails)
def read_company_details(
    company_id: int,  # L'ID de la ressource vient directement du chemin de l'URL
    db: Session = Depends(get_session),
    # La dépendance vérifie que l'utilisateur a accès à l'entreprise demandée dans l'URL
    company_and_role_info: tuple = Depends(get_company_from_path_and_verify_access),
) -> Any:
    """
    Récupère les détails d'une entreprise spécifique (identifiée par son ID dans l'URL),
    y compris la liste de tous ses membres.
    L'accès est accordé uniquement si l'utilisateur authentifié est membre de cette entreprise.
    """
    company, user_role = company_and_role_info

    # Récupérer tous les membres de cette entreprise
    members_db = user_crud.get_company_members(db, company_id=company.id)

    # Mapper les objets User de la BDD vers le schéma CompanyMember
    members_schema = [
        CompanyMember(
            id=member.id,
            email=member.email,
            is_active=member.is_active,
            # Le rôle est extrait du lien spécifique à cette entreprise
            role=next(
                link.role
                for link in member.company_links
                if link.company_id == company.id
            ),
        )
        for member in members_db
    ]

    company_details = CompanyDetails(
        id=company.id, name=company.name, members=members_schema
    )
    return company_details


@router.post("/{company_id}/invite", response_model=UserInDB)
def invite_new_user(
    company_id: int,  # L'ID de l'entreprise cible est dans l'URL
    user_to_invite: UserInvite,
    db: Session = Depends(get_session),
    # La dépendance vérifie que l'utilisateur est bien un admin de l'entreprise demandée dans l'URL
    active_company: Company = Depends(get_admin_for_company_in_path),
) -> Any:
    """
    [Admin] Invite un nouvel utilisateur dans l'entreprise spécifiée dans l'URL.
    Crée un compte pour l'utilisateur s'il n'existe pas, ou l'ajoute à l'entreprise
    s'il existe déjà dans le système.
    """
    # Note: dans une vraie application, on enverrait un email avec un token d'invitation unique
    # pour que l'utilisateur puisse définir son mot de passe.
    print(f"INFO: Simulating sending invitation email to {user_to_invite.email}")

    try:
        invited_user = user_crud.invite_user_to_company(
            db, user_to_invite=user_to_invite, company_id=active_company.id
        )
    except ValueError as e:
        # Gérer le cas où l'utilisateur est déjà dans l'entreprise
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Construire la réponse UserInDB pour l'utilisateur invité, montrant toutes ses affiliations
    user_companies = [
        UserCompany(id=link.company.id, name=link.company.name, role=link.role)
        for link in invited_user.company_links
    ]

    return UserInDB(
        id=invited_user.id,
        email=invited_user.email,
        is_active=invited_user.is_active,
        companies=user_companies,
    )