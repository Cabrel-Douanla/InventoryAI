# Fichier: app/crud/dashboard_crud.py

from sqlmodel import Session, select
import pandas as pd
from typing import List

from app.models.base import Product, Sale
from app.core.prediction_logic import model, model_features # Importer le modèle chargé

def get_dashboard_data_for_product(db: Session, product: Product) -> dict:
    """
    Récupère les données historiques, génère des prédictions à la volée
    et calcule les KPIs pour le dashboard d'un produit.
    """
    # 1. Récupérer l'historique des ventes
    sales_records = db.exec(select(Sale).where(Sale.product_id == product.id).order_by(Sale.transaction_date.desc()).limit(180)).all()
    sales_records.reverse() # Remettre dans l'ordre chronologique

    if not sales_records:
        return {"kpis": {}, "chart_data": [], "influencing_factors": {}}

    sales_df = pd.DataFrame(
        [{"ds": s.transaction_date, "y": s.quantity_sold} for s in sales_records]
    )
    sales_df['ds'] = pd.to_datetime(sales_df['ds'])

    # 2. Générer les caractéristiques et les prédictions
    # Utiliser une version modifiée de la logique de prédiction
    from app.core.prediction_logic import create_features_for_inference
    
    # Prédire pour l'historique (pour le calcul de la précision) et le futur
    future_periods = 90
    df_with_features = create_features_for_inference(sales_df.copy(), future_periods)
    
    # Prédictions sur l'ensemble (historique + futur)
    X_full = df_with_features[model_features]
    full_predictions = model.predict(X_full)

    # 3. Calculer les KPIs
    # Précision du modèle (MAPE inversé) sur les données historiques
    historical_df = df_with_features.head(len(sales_df))
    mape = (abs(historical_df['y'] - full_predictions[:len(sales_df)]) / historical_df['y']).mean()
    model_accuracy = max(0, 100 * (1 - mape))

    # Prédictions sur les 30 prochains jours
    future_predictions_30d = full_predictions[-future_periods:-future_periods+30]
    total_forecast_30d = sum(future_predictions_30d)
    avg_daily_demand_30d = total_forecast_30d / 30

    kpis = {
        "model_accuracy_percent": round(model_accuracy, 2),
        "total_forecast_30d": int(total_forecast_30d),
        "avg_daily_demand_30d": round(avg_daily_demand_30d, 2),
    }

    # 4. Formater les données pour le graphique
    chart_data = []
    # Données historiques
    for _, row in historical_df.iterrows():
        chart_data.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "actual_sales": row['y'],
        })
    # Données de prédiction (on les ajoute/met à jour)
    for i, prediction in enumerate(full_predictions):
        index_date = df_with_features.iloc[i]['ds'].strftime('%Y-%m-%d')
        # Trouver le point de donnée correspondant s'il existe
        point = next((item for item in chart_data if item["date"] == index_date), None)
        confidence_range = 17.06 * 1.96 # Simulation (RMSE * Z-score pour 95%)
        if point:
            point.update({
                "prediction": round(max(0, prediction), 2),
                "confidence_min": round(max(0, prediction - confidence_range), 2),
                "confidence_max": round(max(0, prediction + confidence_range), 2)
            })
        else: # C'est un point futur
             chart_data.append({
                "date": index_date,
                "prediction": round(max(0, prediction), 2),
                "confidence_min": round(max(0, prediction - confidence_range), 2),
                "confidence_max": round(max(0, prediction + confidence_range), 2)
            })


    # 5. Simuler les facteurs d'influence
    influencing_factors = {
        "Tendance Générale": "Croissance stable observée.",
        "Saisonnalité": "Pics de demande identifiés en fin de mois."
    }

    return {
        "kpis": kpis,
        "chart_data": chart_data,
        "influencing_factors": influencing_factors
    }