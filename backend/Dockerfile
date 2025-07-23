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

# 6. Exposer le port que l'application utilisera
EXPOSE 8000

# NOUVELLE INSTRUCTION : Commande de démarrage pour la production
# Gunicorn va gérer plusieurs workers pour notre API.
# Le worker Uvicorn est optimisé pour asyncio.
# Le --host 0.0.0.0 est crucial pour que Docker puisse exposer le port.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]