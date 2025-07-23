# Fichier : app/core/stock_optimization.py

from scipy.stats import norm

def calculate_optimal_stock_levels(
    avg_daily_demand: float,
    model_error_std: float,
    lead_time_days: int,
    lead_time_std_days: int,
    service_level: float = 0.95
) -> dict:
    """
    Calcule les niveaux de stock optimaux (stock de sécurité, point de commande)
    basé sur les sorties du modèle de prédiction et les paramètres métier.

    Args:
        avg_daily_demand: Prévision de la demande journalière moyenne.
        model_error_std: Écart-type de l'erreur du modèle de prédiction (ex: RMSE).
        lead_time_days: Délai de réapprovisionnement moyen en jours.
        lead_time_std_days: Variabilité (écart-type) du délai de réapprovisionnement.
        service_level: Taux de service client désiré (ex: 0.95 pour 95%).

    Returns:
        Un dictionnaire contenant les recommandations de stock.
    """
    if not (0 < service_level < 1):
        raise ValueError("Service level must be between 0 and 1.")

    # 1. Coefficient de sécurité (Z-score)
    z_score = norm.ppf(service_level)

    # 2. Écart-type de la demande pendant le délai de réapprovisionnement
    demand_variance = lead_time_days * (model_error_std ** 2)
    lead_time_variance = (avg_daily_demand ** 2) * (lead_time_std_days ** 2)
    combined_std_dev = (demand_variance + lead_time_variance) ** 0.5
    
    # 3. Stock de Sécurité
    safety_stock = z_score * combined_std_dev
    
    # 4. Point de Commande
    demand_during_lead_time = avg_daily_demand * lead_time_days
    reorder_point = demand_during_lead_time + safety_stock

    return {
        "service_level_percent": service_level * 100,
        "recommended_safety_stock": round(safety_stock),
        "reorder_point": round(reorder_point),
        "inputs_summary": {
            "avg_daily_demand_forecast": round(avg_daily_demand, 2),
            "model_error_std_dev": round(model_error_std, 2),
            "lead_time_days": lead_time_days
        }
    }