# Fichier: app/schemas/dashboard_schemas.py

from pydantic import BaseModel
from typing import List, Optional, Dict

class ChartDataPoint(BaseModel):
    date: str
    actual_sales: Optional[float] = None # Ventes réelles (pour l'historique)
    prediction: Optional[float] = None # Prédiction (pour l'historique et le futur)
    confidence_min: Optional[float] = None # Borne inférieure de l'intervalle de confiance
    confidence_max: Optional[float] = None # Borne supérieure

class DashboardKPIs(BaseModel):
    model_accuracy_percent: float
    total_forecast_30d: int
    avg_daily_demand_30d: float
    # ====================================================================
    # CORRECTION : Ajouter ` = None` pour rendre le champ optionnel
    # ====================================================================
    stock_coverage_days: Optional[float] = None
    # ====================================================================

class ProductDashboardData(BaseModel):
    product_id: int
    product_sku: str
    product_name: str
    kpis: DashboardKPIs
    chart_data: List[ChartDataPoint]
    influencing_factors: Dict[str, str] # Pour une V1, on peut simuler ça