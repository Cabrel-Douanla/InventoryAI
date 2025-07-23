# 1. Utiliser une image Python officielle comme base
FROM python:3.10-slim

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 3. Installer les dépendances
# Copier d'abord le fichier requirements pour profiter du cache Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copier le reste du code de l'application
COPY ./app /app/app
COPY ./tasks /app/tasks

# NOUVELLE INSTRUCTION : Copier les artefacts du modèle
COPY ./models_artefacts /app/models_artefacts

# 5. Exposer le port que l'application utilisera
EXPOSE 80