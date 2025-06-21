# **InventoryAI Enterprise - Backend API**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=for-the-badge&logo=docker&logoColor=white)

API RESTful robuste et scalable pour la plateforme de gestion de stock intelligente **InventoryAI Enterprise**. Ce projet constitue le cœur backend de l'application, gérant l'authentification, la gestion des entreprises, le traitement des données de vente et, à terme, l'exécution des modèles de prédiction par intelligence artificielle.

Ce projet est développé dans le cadre du Master Recherche en Intelligence Artificielle de l'Université de Dschang.

## **Table des Matières**

- [**InventoryAI Enterprise - Backend API**](#inventoryai-enterprise---backend-api)
  - [**Table des Matières**](#table-des-matières)
  - [**Introduction**](#introduction)
  - [**Fonctionnalités Clés**](#fonctionnalités-clés)
  - [**Architecture et Stack Technologique**](#architecture-et-stack-technologique)
  - [**Prérequis**](#prérequis)
  - [**Installation et Lancement (via Docker)**](#installation-et-lancement-via-docker)
  - [**Structure du Projet**](#structure-du-projet)
  - [**Configuration de l'Environnement**](#configuration-de-lenvironnement)
  - [**Utilisation de l'API**](#utilisation-de-lapi)
    - [**Documentation Interactive (Swagger UI)**](#documentation-interactive-swagger-ui)
    - [**Flux d'Authentification**](#flux-dauthentification)
    - [**Gestion des Entreprises**](#gestion-des-entreprises)
  - [**Tests**](#tests)
  - [**Prochaines Étapes (Roadmap)**](#prochaines-étapes-roadmap)

---

## **Introduction**

InventoryAI Enterprise a pour ambition de révolutionner la gestion des stocks pour les PME et ETI en Afrique et au-delà. Ce backend fournit l'infrastructure nécessaire pour :
*   Gérer de manière sécurisée les comptes utilisateurs et les organisations (entreprises).
*   Permettre aux utilisateurs d'appartenir à plusieurs entreprises avec des rôles distincts (Admin, Membre).
*   Ingérer et stocker les données de produits et de ventes.
*   Exposer des endpoints pour déclencher des analyses prédictives et récupérer des recommandations optimisées.

## **Fonctionnalités Clés**

-   **Authentification Robuste :** Basée sur JWT (JSON Web Tokens) avec le flux OAuth2 Password.
-   **Gestion Multi-Entreprise :** Un utilisateur peut créer, rejoindre et naviguer entre plusieurs entreprises.
-   **Gestion des Rôles :** Système de permissions simple (Admin/Membre) au sein de chaque entreprise.
-   **API RESTful :** Architecture claire et conforme aux standards REST.
-   **Tâches Asynchrones :** Infrastructure prête (avec Celery) pour gérer les traitements longs (imports de données, entraînements de modèles) sans bloquer l'API.
-   **Documentation Automatique :** Documentation interactive et testable générée automatiquement via OpenAPI (Swagger UI).
-   **Prêt pour la Conteneurisation :** Entièrement conteneurisé avec Docker pour un déploiement facile et reproductible.

## **Architecture et Stack Technologique**

-   **Langage :** Python 3.10+
-   **Framework API :** [FastAPI](https://fastapi.tiangolo.com/) (pour sa haute performance et sa simplicité)
-   **Base de Données :** [PostgreSQL](https://www.postgresql.org/) (pour sa robustesse et sa scalabilité)
-   **ORM & Validation :** [SQLModel](https://sqlmodel.tiangolo.com/) (combine la puissance de SQLAlchemy et la validation de Pydantic)
-   **Tâches Asynchrones :** [Celery](https://docs.celeryq.dev/en/stable/) & [Redis](https://redis.io/)
-   **Authentification :** JWT, OAuth2, Passlib (pour le hachage de mots de passe)
-   **Conteneurisation :** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## **Prérequis**

Pour lancer ce projet en local, vous avez uniquement besoin de :
-   [Docker](https://www.docker.com/products/docker-desktop/) (Docker Desktop pour Windows/Mac ou Docker Engine pour Linux)
-   [Docker Compose](https://docs.docker.com/compose/install/) (généralement inclus avec Docker Desktop)
-   Un client Git pour cloner le projet.

## **Installation et Lancement (via Docker)**

L'utilisation de Docker rend l'installation extrêmement simple.

1.  **Clonez le dépôt :**
    ```bash
    git clone [URL_DE_VOTRE_DEPOT]
    cd backend
    ```

2.  **Créez le fichier de configuration :**
    Copiez le fichier d'exemple `.env.example` (que vous devriez créer) en `.env`.
    ```bash
    cp .env.example .env
    ```
    Ouvrez le fichier `.env` et ajustez les variables si nécessaire (notamment `SECRET_KEY`).

3.  **Lancez l'ensemble de l'application :**
    Cette commande va construire l'image Docker de l'API, télécharger les images de PostgreSQL et Redis, et démarrer tous les services.
    ```bash
    docker-compose up --build
    ```
    L'API sera accessible sur [`http://localhost:8000`](http://localhost:8000).

4.  **Pour arrêter l'application :**
    Appuyez sur `Ctrl + C` dans le terminal où docker-compose est lancé, puis exécutez :
    ```bash
    docker-compose down
    ```

## **Structure du Projet**

Le projet suit une structure modulaire pour une meilleure organisation et maintenabilité :
```
inventory-ai-backend/
├── app/                  # Coeur de l'application FastAPI
│   ├── api/              # Logique des endpoints API (organisée par version)
│   ├── core/             # Configuration, sécurité, etc.
│   ├── crud/             # Fonctions d'interaction avec la BDD (CRUD)
│   ├── db/               # Configuration de la BDD
│   ├── models/           # Modèles de la BDD (tables SQLModel)
│   ├── schemas/          # Schémas Pydantic pour la validation des données
│   └── main.py           # Point d'entrée de l'application
├── tasks/                # Tâches asynchrones (Celery)
├── .env                  # Fichier de configuration local (ignoré par Git)
├── Dockerfile            # Recette pour construire l'image de l'API
└── docker-compose.yml    # Fichier d'orchestration pour tous les services
```

## **Configuration de l'Environnement**

La configuration est gérée via des variables d'environnement dans le fichier `.env`. Les variables clés incluent :
-   `DATABASE_URL`: L'URL de connexion à la base de données PostgreSQL.
-   `SECRET_KEY`: Une clé secrète longue et aléatoire pour signer les JWT.
-   `ALGORITHM`: L'algorithme de signature des JWT (ex: HS256).
-   `ACCESS_TOKEN_EXPIRE_MINUTES`: La durée de validité d'un token d'accès.

## **Utilisation de l'API**

### **Documentation Interactive (Swagger UI)**

Une fois l'application lancée, la documentation complète et interactive de l'API est disponible à l'adresse :
-   **[`http://localhost:8000/docs`](http://localhost:8000/docs)**

Cette interface vous permet de visualiser tous les endpoints, leurs paramètres, leurs réponses possibles, et de les tester directement depuis votre navigateur.

### **Flux d'Authentification**

1.  **Inscription :** Un nouvel utilisateur crée son compte personnel via `POST /api/v1/register`.
2.  **Création d'entreprise :** L'utilisateur authentifié peut créer sa première entreprise via `POST /api/v1/company/`.
3.  **Connexion :** L'utilisateur se connecte avec `POST /api/v1/login/token`. Il reçoit un `access_token` et la liste de ses entreprises.
4.  **Autorisation :** Pour accéder aux endpoints protégés, le `access_token` doit être inclus dans le header `Authorization` de chaque requête, sous la forme `bearer <votre_token>`.

### **Gestion des Entreprises**

-   Après la connexion, le frontend doit permettre à l'utilisateur de choisir une "entreprise active".
-   Pour toutes les actions contextuelles à une entreprise (inviter un membre, créer un produit, etc.), l'ID de cette entreprise active doit être passé dans le header `X-Company-ID`.
-   **Lister les membres :** `GET /api/v1/company/{company_id}`
-   **Inviter un membre :** `POST /api/v1/company/{company_id}/invite` (requiert le rôle Admin)

## **Tests**

*(Section à développer)*
Le framework de test `pytest` est installé. Les tests unitaires et d'intégration seront ajoutés dans le répertoire `/tests`. Pour lancer les tests :
```bash
# (Nécessite d'entrer dans le conteneur de l'API)
docker-compose exec api pytest
```

## **Prochaines Étapes (Roadmap)**

-   [ ] **Module 3 : Gestion des Produits & Ventes :** Endpoints CRUD pour gérer les produits (SKU) et ingérer les données de ventes (via upload de CSV).
-   [ ] **Module 4 : Tâches Asynchrones (Celery) :** Activer et implémenter le worker Celery pour traiter les uploads de fichiers en arrière-plan.
-   [ ] **Module 5 : Moteur d'IA :** Intégrer les modèles de prédiction pré-entraînés et créer un endpoint pour lancer les prévisions.
-   [ ] **Tests :** Développer une suite de tests complète pour assurer la robustesse de l'API.
-   [ ] **Déploiement :** Mettre en place un pipeline CI/CD pour un déploiement automatisé sur un fournisseur cloud.

---
*Ce projet est réalisé à des fins académiques et de recherche. © Cabrel, Youri, Marie, Raissa, Université de Dschang, 2025.*