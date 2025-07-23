// Fichier: src/components/common/PredictionModule.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Brain, Package, Loader2, TrendingUp, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { fetchProducts, triggerPrediction, fetchJobStatus, type Product } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';
import { type PredictionResult } from '../../types';

// ==============================================================================
// SOUS-COMPOSANT : PredictionResultDisplay
// ==============================================================================
interface PredictionResultDisplayProps {
  jobId: number;
}

const PredictionResultDisplay: React.FC<PredictionResultDisplayProps> = ({ jobId }) => {
  // Utilise useQuery pour suivre le statut du job
  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['predictionJobStatus', jobId],
    queryFn: () => fetchJobStatus(jobId),
    // Le polling s'arrête automatiquement quand le job est terminé
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'SUCCESS' || status === 'FAILED') ? false : 3000; // Poll every 3 seconds
    },
  });

  // Affiche un état de chargement/traitement
  if (isLoading || !job || job.status === 'PENDING' || job.status === 'RUNNING') {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Loader2 size={48} className="mx-auto mb-4 text-blue-400 animate-spin" />
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          L'IA calcule les prédictions...
        </h3>
        <p className="text-blue-700">Statut actuel : {job?.status || 'EN ATTENTE'}. Cela peut prendre quelques instants.</p>
      </div>
    );
  }

  // Affiche un état d'erreur
  if (isError || job.status === 'FAILED') {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de prédiction</h3>
        <p className="text-red-700">{job?.result || "Une erreur inconnue est survenue."}</p>
      </div>
    );
  }

  // Si le job est réussi, parse et affiche les résultats
  try {
    const results: PredictionResult = JSON.parse(job.result);
    const chartData = results.forecast_90_days.dates.map((date, index) => ({
      date,
      prediction: results.forecast_90_days.predicted_demand[index],
    }));

    return (
      <div className="mt-6 space-y-6">
        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center"><h4 className="font-medium text-gray-500">Stock de Sécurité Recommandé</h4><p className="text-2xl font-bold text-gray-800">{results.stock_optimization.recommended_safety_stock.toLocaleString()} unités</p></div>
          <div className="card text-center"><h4 className="font-medium text-gray-500">Point de Commande</h4><p className="text-2xl font-bold text-gray-800">{results.stock_optimization.reorder_point.toLocaleString()} unités</p></div>
          <div className="card text-center"><h4 className="font-medium text-gray-500">Demande Quotidienne Prévue</h4><p className="text-2xl font-bold text-gray-800">{results.stock_optimization.inputs_summary.avg_daily_demand_forecast.toFixed(2)} unités/jour</p></div>
        </div>
        {/* Graphique */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévisions de Demande sur 90 jours</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} unités`, 'Prédiction']} />
                <Area type="monotone" dataKey="prediction" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Prédiction" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  } catch (e) {
    // Gérer le cas où le JSON des résultats est mal formé
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erreur d'affichage des résultats</h3>
        <p className="text-red-700">Les données de résultat reçues du serveur sont invalides.</p>
      </div>
    );
  }
};

// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
const PredictionModule = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [activePredictionJobId, setActivePredictionJobId] = useState<number | null>(null);
  const { activeCompanyId } = useAuthStore();

  // 1. Récupérer la liste des produits pour le sélecteur
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', activeCompanyId],
    queryFn: fetchProducts,
    enabled: !!activeCompanyId,
  });

  // 2. Créer une mutation pour lancer une prédiction
  const predictionMutation = useMutation({
    mutationFn: triggerPrediction,
    onSuccess: (data) => {
      toast.success(data.message);
      setActivePredictionJobId(data.job_id);
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.response?.data?.detail || "Impossible de lancer la prédiction."}`);
    }
  });

  const handlePredict = () => {
    if (selectedProductId) {
      predictionMutation.mutate(selectedProductId);
    } else {
      toast.error("Veuillez d'abord sélectionner un produit.");
    }
  };

  // Gérer l'affichage conditionnel
  if (!activeCompanyId) {
    return <div className="p-6 text-center text-gray-500">Veuillez sélectionner une entreprise pour lancer des prédictions.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Brain size={32} /> Module de Prédiction</h1>
        <p className="text-gray-600 mt-1">Lancez une prédiction de demande pour un produit spécifique de votre catalogue.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un produit à analyser</label>
            <select
              value={selectedProductId || ''}
              onChange={(e) => {
                const newProductId = Number(e.target.value);
                setSelectedProductId(newProductId);
                // Réinitialiser l'affichage si on change de produit
                if (activePredictionJobId) setActivePredictionJobId(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              disabled={isLoadingProducts || !products}
            >
              <option value="" disabled>{isLoadingProducts ? "Chargement des produits..." : "Choisissez un produit"}</option>
              {products?.map((p: Product) => (
                <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
              ))}
            </select>
          </div>
          <div>
            <button onClick={handlePredict} disabled={!selectedProductId || predictionMutation.isPending} className="w-full btn-primary flex justify-center items-center gap-2">
              {predictionMutation.isPending ? <Loader2 className="animate-spin" /> : <TrendingUp />}
              {predictionMutation.isPending ? "Lancement..." : "Lancer la Prédiction"}
            </button>
          </div>
        </div>

        {/* Affiche le composant de suivi/résultat si un job a été lancé */}
        {activePredictionJobId && <PredictionResultDisplay jobId={activePredictionJobId} />}
      </div>
    </div>
  );
};

export default PredictionModule;