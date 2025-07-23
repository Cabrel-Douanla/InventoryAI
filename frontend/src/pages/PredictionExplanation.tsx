import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Users, 
  Zap, 
  BarChart3,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  Settings,
  Eye,
  Target,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Données de démonstration pour l'explication
const mockExplanationData = {
  productId: 1,
  productName: "Smartphone Galaxy S24",
  prediction: {
    next30Days: 1247,
    confidence: 92,
    modelVersion: "v2.3.1"
  },
  factors: [
    {
      name: "Tendance saisonnière",
      impact: 35,
      direction: "positive",
      description: "Forte demande attendue en période de rentrée",
      confidence: 94
    },
    {
      name: "Historique des ventes",
      impact: 28,
      direction: "positive", 
      description: "Croissance constante sur les 6 derniers mois",
      confidence: 89
    },
    {
      name: "Événements marketing",
      impact: 22,
      direction: "positive",
      description: "Campagne publicitaire prévue la semaine prochaine",
      confidence: 87
    },
    {
      name: "Stock concurrent",
      impact: 12,
      direction: "negative",
      description: "Concurrents en rupture de stock sur produits similaires",
      confidence: 76
    },
    {
      name: "Prix du marché",
      impact: 8,
      direction: "neutral",
      description: "Prix stable par rapport à la concurrence",
      confidence: 82
    }
  ],
  modelMetrics: {
    accuracy: 92,
    precision: 89,
    recall: 94,
    f1Score: 91,
    mape: 8.5
  },
  dataQuality: {
    completeness: 96,
    consistency: 94,
    accuracy: 91,
    timeliness: 98
  },
  risks: [
    {
      type: "high",
      title: "Rupture fournisseur",
      probability: 15,
      impact: "Retard de livraison possible",
      mitigation: "Diversifier les fournisseurs"
    },
    {
      type: "medium", 
      title: "Changement réglementaire",
      probability: 25,
      impact: "Impact sur les importations",
      mitigation: "Surveiller les évolutions légales"
    },
    {
      type: "low",
      title: "Nouvelle concurrence",
      probability: 35,
      impact: "Pression sur les prix",
      mitigation: "Renforcer la différenciation"
    }
  ]
};

// Composant pour les facteurs d'influence
const InfluenceFactors = ({ factors }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Facteurs d'Influence</h3>
          <p className="text-sm text-gray-600">Éléments impactant la prédiction</p>
        </div>
      </div>

      <div className="space-y-4">
        {factors.map((factor, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  factor.direction === 'positive' ? 'bg-green-100' :
                  factor.direction === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {factor.direction === 'positive' ? 
                    <TrendingUp className="w-4 h-4 text-green-600" /> :
                    factor.direction === 'negative' ?
                    <AlertTriangle className="w-4 h-4 text-red-600" /> :
                    <Activity className="w-4 h-4 text-gray-600" />
                  }
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{factor.name}</h4>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{factor.impact}%</div>
                <div className="text-xs text-gray-500">Impact</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      factor.direction === 'positive' ? 'bg-green-500' :
                      factor.direction === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${factor.impact}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Confiance:</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  factor.confidence >= 90 ? 'bg-green-100 text-green-700' :
                  factor.confidence >= 80 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {factor.confidence}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant pour les métriques du modèle
const ModelMetrics = ({ metrics }) => {
  const metricsData = [
    { name: 'Précision', value: metrics.accuracy, color: '#10b981', description: 'Pourcentage de prédictions correctes' },
    { name: 'Précision', value: metrics.precision, color: '#3b82f6', description: 'Rapport vrais positifs / positifs prédits' },
    { name: 'Rappel', value: metrics.recall, color: '#f59e0b', description: 'Rapport vrais positifs / positifs réels' },
    { name: 'F1-Score', value: metrics.f1Score, color: '#ef4444', description: 'Moyenne harmonique précision/rappel' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Target className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance du Modèle</h3>
          <p className="text-sm text-gray-600">Métriques de qualité de prédiction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {metricsData.map((metric, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: metric.color }}
                ></div>
                <span className="font-medium text-gray-900">{metric.name}</span>
              </div>
              <span className="text-xl font-bold" style={{ color: metric.color }}>
                {metric.value}%
              </span>
            </div>
            <p className="text-xs text-gray-600">{metric.description}</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${metric.value}%`,
                  backgroundColor: metric.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">MAPE (Erreur Absolue Moyenne)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Plus la valeur est faible, plus le modèle est précis</span>
          <span className="text-lg font-bold text-blue-600">{metrics.mape}%</span>
        </div>
      </div>
    </div>
  );
};

// Composant pour la qualité des données
const DataQuality = ({ quality }) => {
  const qualityMetrics = [
    { name: 'Complétude', value: quality.completeness, icon: CheckCircle },
    { name: 'Cohérence', value: quality.consistency, icon: Settings },
    { name: 'Précision', value: quality.accuracy, icon: Target },
    { name: 'Actualité', value: quality.timeliness, icon: Calendar }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Eye className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Qualité des Données</h3>
          <p className="text-sm text-gray-600">Indicateurs de fiabilité des données source</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {qualityMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className={`inline-flex p-3 rounded-full mb-3 ${
                metric.value >= 95 ? 'bg-green-100' :
                metric.value >= 85 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Icon className={`w-5 h-5 ${
                  metric.value >= 95 ? 'text-green-600' :
                  metric.value >= 85 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}%</div>
              <div className="text-sm text-gray-600">{metric.name}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Recommandations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Améliorer la complétude des données historiques</li>
              <li>• Vérifier la cohérence des unités de mesure</li>
              <li>• Synchroniser plus fréquemment les données</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour l'analyse des risques
const RiskAnalysis = ({ risks }) => {
  const getRiskColor = (type) => {
    switch (type) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskIcon = (type) => {
    switch (type) {
      case 'high': return <XCircle className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analyse des Risques</h3>
          <p className="text-sm text-gray-600">Facteurs pouvant affecter la prédiction</p>
        </div>
      </div>

      <div className="space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getRiskColor(risk.type)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getRiskIcon(risk.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{risk.title}</h4>
                  <span className="text-sm font-medium px-2 py-1 bg-white rounded-full">
                    {risk.probability}%
                  </span>
                </div>
                <p className="text-sm mb-2">{risk.impact}</p>
                <div className="text-xs">
                  <span className="font-medium">Mitigation: </span>
                  {risk.mitigation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant principal d'explication des prédictions
const PredictionExplanation = ({ productId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('factors');

  useEffect(() => {
    // Simuler le chargement des données d'explication
    setLoading(true);
    setTimeout(() => {
      setData(mockExplanationData);
      setLoading(false);
    }, 1000);
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500">Analyse en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'factors', label: 'Facteurs d\'influence', icon: Brain },
    { id: 'metrics', label: 'Performance', icon: Target },
    { id: 'quality', label: 'Qualité données', icon: Eye },
    { id: 'risks', label: 'Analyse risques', icon: AlertTriangle }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Explication de la Prédiction
            </h2>
            <p className="text-gray-600">
              {data.productName} - Prédiction: <span className="font-semibold text-blue-600">
                {data.prediction.next30Days.toLocaleString()} unités
              </span> (Confiance: {data.prediction.confidence}%)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Modèle utilisé</div>
              <div className="font-medium text-gray-900">{data.prediction.modelVersion}</div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="space-y-6">
        {activeTab === 'factors' && <InfluenceFactors factors={data.factors} />}
        {activeTab === 'metrics' && <ModelMetrics metrics={data.modelMetrics} />}
        {activeTab === 'quality' && <DataQuality quality={data.dataQuality} />}
        {activeTab === 'risks' && <RiskAnalysis risks={data.risks} />}
      </div>
    </div>
  );
};

export default PredictionExplanation;