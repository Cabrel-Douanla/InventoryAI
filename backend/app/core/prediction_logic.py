# Fichier : app/core/prediction_logic.py

import pandas as pd
import joblib
import json
import os
from scipy.stats import norm
from typing import List
from app.core.stock_optimization import calculate_optimal_stock_levels

# Définir les chemins des artefacts du modèle
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # Remonte au dossier /app
MODEL_DIR = os.path.join("/app/models_artefacts") # Puis va dans /models_artefacts
MODEL_PATH = os.path.join(MODEL_DIR, "lgbm_demand_model_v1.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "model_v1_features.json")

# Charger les artefacts une seule fois au démarrage du module pour la performance
print(f"Chargement du modèle depuis : {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
print("Modèle chargé.")

print(f"Chargement des caractéristiques depuis : {FEATURES_PATH}")
with open(FEATURES_PATH, 'r') as f:
    model_features = json.load(f)
print("Caractéristiques chargées.")


def create_features_for_inference(df: pd.DataFrame, future_periods: int) -> pd.DataFrame:
    """
    Crée les caractéristiques pour l'historique ET les périodes futures.
    """
    # Créer les dates futures
    last_date = df['ds'].max()
    future_dates = pd.to_datetime([last_date + pd.Timedelta(days=i) for i in range(1, future_periods + 1)])
    future_df = pd.DataFrame({'ds': future_dates})
    
    # Concaténer l'historique et le futur pour calculer les lags/rolling features
    full_df = pd.concat([df, future_df], ignore_index=True)

    # Réutiliser la même logique de création de features que pour l'entraînement
    full_df['day_of_week'] = full_df['ds'].dt.dayofweek
    full_df['day_of_month'] = full_df['ds'].dt.day
    full_df['day_of_year'] = full_df['ds'].dt.dayofyear
    full_df['week_of_year'] = full_df['ds'].dt.isocalendar().week.astype(int)
    full_df['month'] = full_df['ds'].dt.month
    full_df['year'] = full_df['ds'].dt.year
    
    for lag in [7, 14, 30]:
        full_df[f'sales_lag_{lag}'] = full_df['y'].shift(lag)
    for window in [7, 14]:
        # shift(1) pour ne pas utiliser la valeur du jour même pour la prédiction
        full_df[f'rolling_mean_{window}'] = full_df['y'].shift(1).rolling(window=window).mean()

    return full_df


def run_prediction_pipeline(sales_df: pd.DataFrame) -> dict:
    """
    Exécute le pipeline de prédiction en utilisant le modèle chargé.
    """
    print(f"Starting REAL prediction pipeline for dataframe with {len(sales_df)} records...")
    
    # --- PRÉDICTION ---
    # Générer les caractéristiques pour les 90 prochains jours
    future_periods = 90
    df_with_features = create_features_for_inference(sales_df, future_periods)
    
    # Isoler les lignes futures pour lesquelles nous voulons prédire
    future_data = df_with_features.iloc[-future_periods:].copy()
    
    # S'assurer que les colonnes sont dans le bon ordre et que toutes sont présentes
    X_future = future_data[model_features]
    
    # Faire la prédiction
    predictions = model.predict(X_future)
    # S'assurer que les prédictions ne sont pas négatives
    predictions = [max(0, p) for p in predictions]

    forecast = {
        "dates": [d.strftime('%Y-%m-%d') for d in future_data['ds']],
        "predicted_demand": [round(p, 2) for p in predictions]
    }
    
     # --- 2. OPTIMISATION DU STOCK (Partie Algorithmique) ---
    # Préparer les entrées pour le module d'optimisation
    predicted_daily_demand = sum(predictions) / len(predictions)
    # L'erreur du modèle devrait être un artefact stocké avec le modèle.
    model_error_std = 17.06 # Valeur de notre expérimentation

    # Paramètres métier (devraient venir de la BDD à terme)
    lead_time_days = 30
    lead_time_std_days = 5
    service_level = 0.95
    
    # Appeler le module d'optimisation dédié
    stock_optimization_results = calculate_optimal_stock_levels(
        avg_daily_demand=predicted_daily_demand,
        model_error_std=model_error_std,
        lead_time_days=lead_time_days,
        lead_time_std_days=lead_time_std_days,
        service_level=service_level
    )
    
    print("Real prediction pipeline finished.")
    
    # --- 3. RETOURNER LE RÉSULTAT COMBINÉ ---
    return {
        "forecast_90_days": forecast,
        "stock_optimization": stock_optimization_results
    }