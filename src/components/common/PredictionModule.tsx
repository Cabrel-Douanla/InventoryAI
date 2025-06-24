import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Target, 
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Info,
  ChevronDown,
  Package,
  Brain,
  Activity,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart, 
  Bar, 
  BarChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Données de démonstration
const mockProducts = [
  { id: 1, name: 'Smartphone Galaxy S24', sku: 'TECH-001', currentStock: 45, category: 'Électronique', price: 899 },
  { id: 2, name: 'Laptop Dell XPS 13', sku: 'TECH-002', currentStock: 23, category: 'Électronique', price: 1299 },
  { id: 3, name: 'Casque Audio Sony', sku: 'TECH-003', currentStock: 67, category: 'Audio', price: 199 },
  { id: 4, name: 'Montre Apple Watch', sku: 'TECH-004', currentStock: 34, category: 'Wearables', price: 399 },
  { id: 5, name: 'Tablette iPad Pro', sku: 'TECH-005', currentStock: 28, category: 'Électronique', price: 1099 }
];

const mockPredictionData = [
  { date: '2025-01-01', actualSales: 25, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-02', actualSales: 32, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-03', actualSales: 28, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-04', actualSales: 35, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-05', actualSales: 42, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-06', actualSales: 38, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-07', actualSales: 45, prediction: null, confidenceUpper: null, confidenceLower: null },
  { date: '2025-01-08', actualSales: null, prediction: 48, confidenceUpper: 55, confidenceLower: 41 },
  { date: '2025-01-09', actualSales: null, prediction: 52, confidenceUpper: 59, confidenceLower: 45 },
  { date: '2025-01-10', actualSales: null, prediction: 47, confidenceUpper: 54, confidenceLower: 40 },
  { date: '2025-01-11', actualSales: null, prediction: 51, confidenceUpper: 58, confidenceLower: 44 },
  { date: '2025-01-12', actualSales: null, prediction: 49, confidenceUpper: 56, confidenceLower: 42 },
  { date: '2025-01-13', actualSales: null, prediction: 53, confidenceUpper: 60, confidenceLower: 46 },
  { date: '2025-01-14', actualSales: null, prediction: 55, confidenceUpper: 62, confidenceLower: 48 }
];

const mockAggregatedData = [
  { category: 'Électronique', predicted: 1250, actual: 1180, confidence: 87 },
  { category: 'Audio', predicted: 890, actual: 920, confidence: 92 },
  { category: 'Wearables', predicted: 450, actual: 430, confidence: 89 },
  { category: 'Accessoires', predicted: 320, actual: 310, confidence: 94 }
];

// Composant pour le sélecteur de produit
const ProductSelector = ({ selectedProduct, onProductChange, products, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder={selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : "Rechercher un produit..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="flex-1 outline-none text-sm"
        />
        <ChevronDown size={18} className="text-gray-400" />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => {
                onProductChange(product);
                setSearchTerm('');
                setShowDropdown(false);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  <p className="text-xs text-blue-600 font-medium">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.currentStock} unités</p>
                  <p className="text-xs text-gray-500">{product.price}€</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Package size={24} className="mx-auto mb-2 text-gray-300" />
              Aucun produit trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant pour les métriques clés
const MetricsCards = ({ predictions, selectedProduct }) => {
  const metrics = [
    {
      label: 'Prédiction 30 jours',
      value: predictions?.next30Days || 1247,
      unit: 'unités',
      change: '+12%',
      changeType: 'positive',
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Prédiction 60 jours',
      value: predictions?.next60Days || 2384,
      unit: 'unités',
      change: '+8%',
      changeType: 'positive',
      icon: BarChart3,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Prédiction 90 jours',
      value: predictions?.next90Days || 3521,
      unit: 'unités',
      change: '+15%',
      changeType: 'positive',
      icon: Target,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Précision du modèle',
      value: predictions?.modelAccuracy || 92,
      unit: '%',
      change: '+2%',
      changeType: 'positive',
      icon: Brain,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className={`${metric.bgColor} rounded-lg p-4 border border-gray-100`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-white ${metric.iconColor}`}>
                <Icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                metric.changeType === 'positive' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {metric.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Composant pour le graphique de prédiction principal
const PredictionChart = ({ data, selectedProduct, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500">Chargement des prédictions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Prédiction de la Demande</h3>
          <p className="text-sm text-gray-600">
            {selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : 'Sélectionnez un produit'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download size={16} />
            Exporter
          </button>
          <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                month: 'short', 
                day: 'numeric' 
              })}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ value: 'Quantité', angle: -90, position: 'insideLeft' }}
            />
            
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
              formatter={(value, name) => [
                `${value} unités`,
                name === 'actualSales' ? 'Ventes réelles' : 
                name === 'prediction' ? 'Prédiction' : 
                name === 'confidenceUpper' ? 'Limite haute' : 'Limite basse'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            
            {/* Zone de confiance */}
            <Area
              type="monotone"
              dataKey="confidenceUpper"
              stackId="1"
              stroke="none"
              fill="url(#confidenceGradient)"
            />
            <Area
              type="monotone"
              dataKey="confidenceLower"
              stackId="1"
              stroke="none"
              fill="white"
            />
            
            {/* Ligne des ventes réelles */}
            <Line
              type="monotone"
              dataKey="actualSales"
              stroke="#6b7280"
              strokeWidth={2}
              dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
            
            {/* Ligne de prédiction */}
            <Line
              type="monotone"
              dataKey="prediction"
              stroke="#10b981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Ventes réelles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Prédiction</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
          <span>Intervalle de confiance</span>
        </div>
      </div>
    </div>
  );
};

// Composant pour les prédictions agrégées
const AggregatedPredictions = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Prédictions par Catégorie</h3>
          <p className="text-sm text-gray-600">Vue d'ensemble des prédictions de demande</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-600" />
          <span className="text-sm text-gray-600">Temps réel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Comparaison Prédiction vs Réel</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} unités`,
                    name === 'predicted' ? 'Prédiction' : 'Réel'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="predicted" fill="#3b82f6" name="Prédiction" radius={[2, 2, 0, 0]} />
                <Bar dataKey="actual" fill="#10b981" name="Réel" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique en secteurs pour la répartition */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Répartition des Prédictions</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="predicted"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} unités`, 'Prédiction']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableau de détails */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Détails par Catégorie</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Catégorie</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Prédiction</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Réel</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Écart</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Précision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => {
                const difference = item.predicted - item.actual;
                const percentageDiff = ((difference / item.actual) * 100).toFixed(1);
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.predicted.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.actual.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      difference > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.confidence >= 90 ? 'bg-green-100 text-green-700' :
                        item.confidence >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.confidence}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composant principal du module
const PredictionModule = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [predictionData, setPredictionData] = useState(mockPredictionData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');

  const handleProductChange = (product) => {
    setSelectedProduct(product);
    setLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête du module */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Module de Prédiction de la Demande</h1>
              <p className="text-gray-600">Analyse prédictive avancée pour optimiser votre inventaire</p>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'individual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Prédictions Individuelles
            </button>
            <button
              onClick={() => setActiveTab('aggregated')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'aggregated'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue Agrégée
            </button>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'individual' ? (
          <>
            {/* Sélecteur de produit */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un produit
              </label>
              <ProductSelector
                selectedProduct={selectedProduct}
                onProductChange={handleProductChange}
                products={mockProducts}
                loading={loading}
              />
            </div>

            {/* Métriques */}
            <MetricsCards 
              predictions={{
                next30Days: selectedProduct ? 1247 : 0,
                next60Days: selectedProduct ? 2384 : 0,
                next90Days: selectedProduct ? 3521 : 0,
                modelAccuracy: selectedProduct ? 92 : 0
              }}
              selectedProduct={selectedProduct}
            />

            {/* Graphique principal */}
            <PredictionChart
              data={predictionData}
              selectedProduct={selectedProduct}
              loading={loading}
            />

            {/* Message d'aide si aucun produit sélectionné */}
            {!selectedProduct && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Package size={48} className="mx-auto mb-4 text-blue-300" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Sélectionnez un produit pour voir les prédictions
                </h3>
                <p className="text-blue-700">
                  Utilisez le sélecteur ci-dessus pour choisir un produit et visualiser ses prédictions de demande.
                </p>
              </div>
            )}
          </>
        ) : (
          <AggregatedPredictions data={mockAggregatedData} />
        )}
      </div>
    </div>
  );
};

export default PredictionModule;