// Fichier: src/pages/PredictionDashboard.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Package, AlertCircle, Search, Home, Loader2, ServerCrash } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { fetchProducts, fetchProductDashboardData, type Product } from '../services/apiService';

// ==============================================================================
// SOUS-COMPOSANT : SQUELETTE DE CHARGEMENT
// ==============================================================================
const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg p-6 mb-6 h-24"></div>
    <div className="bg-gray-200 rounded-lg p-6 mb-6 h-96"></div>
    <div className="bg-gray-200 rounded-lg p-6 h-48"></div>
  </div>
);

// ==============================================================================
// SOUS-COMPOSANT : TOOLTIP PERSONNALISÉ POUR LE GRAPHIQUE
// ==============================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`Date: ${new Date(label).toLocaleDateString('fr-FR')}`}</p>
        {data.actual_sales !== null && typeof data.actual_sales !== 'undefined' && (
          <p className="text-blue-600">{`Ventes réelles: ${data.actual_sales} unités`}</p>
        )}
        {data.prediction !== null && typeof data.prediction !== 'undefined' && (
          <p className="text-green-600">{`Prédiction: ${data.prediction} unités`}</p>
        )}
        {data.confidence_min !== null && typeof data.confidence_min !== 'undefined' && (
          <p className="text-gray-500 text-sm">{`Intervalle: ${data.confidence_min} - ${data.confidence_max}`}</p>
        )}
      </div>
    );
  }
  return null;
};

// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
const PredictionDashboard: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { activeCompanyId } = useAuthStore();

  // 1. Récupérer la liste des produits pour la sélection
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', activeCompanyId],
    queryFn: fetchProducts,
    enabled: !!activeCompanyId,
  });

  // 2. Sélectionner le premier produit par défaut une fois la liste chargée
  useEffect(() => {
    if (products && products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // 3. Récupérer les données du dashboard pour le produit sélectionné
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
    error: dashboardError
  } = useQuery({
    queryKey: ['dashboardData', selectedProductId],
    queryFn: () => fetchProductDashboardData(selectedProductId!),
    enabled: !!selectedProductId, // N'exécute la requête que si un produit est sélectionné
  });

  // 4. Filtrer les produits pour la barre de recherche
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Gérer l'affichage conditionnel
  if (!activeCompanyId) {
    return <div className="p-6 text-center text-gray-500">Veuillez sélectionner une entreprise pour afficher le tableau de bord.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Home size={32} /> Tableau de Bord des Prédictions
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Sélection de produit */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Sélection Produit
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {isLoadingProducts && <div className="text-center p-4">Chargement...</div>}
              {filteredProducts.map((product: Product) => (
                <div
                  key={product.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedProductId === product.id ? 'bg-blue-100 border-2 border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {!selectedProductId ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Sélectionnez un produit</h3>
              <p className="text-gray-500 mt-2">Choisissez un produit dans la liste de gauche pour visualiser ses prédictions.</p>
            </div>
          ) : isLoadingDashboard ? (
            <DashboardSkeleton />
          ) : isErrorDashboard ? (
            <div className="bg-red-50 text-red-700 rounded-lg shadow-sm border border-red-200 p-12 text-center">
              <ServerCrash size={48} className="mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-red-800">Erreur de chargement</h3>
              <p className="mt-2">Impossible de récupérer les données pour ce produit.</p>
              <p className="text-sm mt-1">Détail : {(dashboardError as any)?.response?.data?.detail || (dashboardError as Error).message}</p>
            </div>
          ) : dashboardData && (
            <>
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">{dashboardData.product_name}</h2>
                <p className="text-sm text-gray-600">SKU: {dashboardData.product_sku}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card text-center"><h4 className="font-medium text-gray-500">Précision du Modèle</h4><p className="text-2xl font-bold text-green-600">{dashboardData.kpis.model_accuracy_percent.toFixed(1)}%</p></div>
                <div className="card text-center"><h4 className="font-medium text-gray-500">Prévision 30 jours</h4><p className="text-2xl font-bold">{dashboardData.kpis.total_forecast_30d.toLocaleString()}</p></div>
                <div className="card text-center"><h4 className="font-medium text-gray-500">Demande Quotidienne Prévue</h4><p className="text-2xl font-bold">{dashboardData.kpis.avg_daily_demand_30d.toFixed(2)}</p></div>
              </div>

              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique et Prédictions de Demande</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.chart_data}>
                      <defs>
                        <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="prediction" stroke="#10B981" fillOpacity={1} fill="url(#colorPrediction)" name="Prédiction" />
                      <Line type="monotone" dataKey="actual_sales" stroke="#3B82F6" strokeWidth={2} dot={false} name="Ventes réelles" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Facteurs d'Influence Principaux (Simulés)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(dashboardData.influencing_factors).map(([factor, description]) => (
                    <div key={factor} className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">{factor}</h4>
                      <p className="text-sm text-blue-800">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;