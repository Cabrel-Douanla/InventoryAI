# 1. Utiliser une image Python officielle comme base
FROM python:3.10-slim

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 3. Installer les dépendances
# Copier d'abord le fichier requirements pour profiter du cache Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Mettre à jour les paquets du système et installer la dépendance manquante
# libgomp1 est le paquet qui contient libgomp.so.1
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# 4. Copier le reste du code de l'application
COPY ./app /app/app
COPY ./tasks /app/tasks

# NOUVELLE INSTRUCTION : Copier les artefacts du modèle
COPY ./models_artefacts /app/models_artefacts

# 5. Exposer le port que l'application utilisera
EXPOSE 80