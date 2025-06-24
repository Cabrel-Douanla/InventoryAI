import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Package, AlertCircle, Search, Filter } from 'lucide-react';

// Types TypeScript
interface ProductData {
  id: string;
  name: string;
  category: string;
  sku: string;
}

interface PredictionData {
  date: string;
  actualSales: number | null;
  prediction: number;
  confidenceMin: number;
  confidenceMax: number;
}

// Données mockées pour la démonstration
const mockProducts: ProductData[] = [
  { id: '1', name: 'Coca-Cola 33cl', category: 'Boissons', sku: 'CC-33CL-001' },
  { id: '2', name: 'Riz Uncle Ben\'s 1kg', category: 'Alimentaire', sku: 'RIZ-UB-1KG' },
  { id: '3', name: 'Savon Lux 90g', category: 'Hygiène', sku: 'SAV-LUX-90' },
  { id: '4', name: 'Huile Frytol 1L', category: 'Alimentaire', sku: 'HUI-FRY-1L' },
];

// Générer des données de prédiction mockées
const generateMockData = (): PredictionData[] => {
  const data: PredictionData[] = [];
  const today = new Date();
  
  // Données historiques (30 derniers jours)
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseValue = 150 + Math.sin(i * 0.2) * 30;
    data.push({
      date: date.toISOString().split('T')[0],
      actualSales: Math.floor(baseValue + (Math.random() - 0.5) * 40),
      prediction: Math.floor(baseValue),
      confidenceMin: Math.floor(baseValue * 0.85),
      confidenceMax: Math.floor(baseValue * 1.15),
    });
  }
  
  // Données prédictives (90 prochains jours)
  for (let i = 1; i <= 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const seasonality = 1 + Math.sin(i * 0.1) * 0.3;
    const trend = 1 + i * 0.002;
    const baseValue = 150 * seasonality * trend;
    data.push({
      date: date.toISOString().split('T')[0],
      actualSales: null,
      prediction: Math.floor(baseValue),
      confidenceMin: Math.floor(baseValue * 0.75),
      confidenceMax: Math.floor(baseValue * 1.25),
    });
  }
  
  return data;
};

const PredictionDashboard: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductData>(mockProducts[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const predictionData = useMemo(() => generateMockData(), [selectedProduct]);
  
  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];
  
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calcul de la précision du modèle (données historiques uniquement)
  const modelAccuracy = useMemo(() => {
    const historicalData = predictionData.filter(d => d.actualSales !== null);
    if (historicalData.length === 0) return 0;
    
    const mape = historicalData.reduce((acc, point) => {
      const error = Math.abs((point.actualSales! - point.prediction) / point.actualSales!) * 100;
      return acc + error;
    }, 0) / historicalData.length;
    
    return Math.max(0, 100 - mape);
  }, [predictionData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Date: ${new Date(label).toLocaleDateString('fr-FR')}`}</p>
          {data.actualSales !== null && (
            <p className="text-blue-600">{`Ventes réelles: ${data.actualSales} unités`}</p>
          )}
          <p className="text-green-600">{`Prédiction: ${data.prediction} unités`}</p>
          <p className="text-gray-500 text-sm">{`Intervalle: ${data.confidenceMin} - ${data.confidenceMax}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">InventoryAI Enterprise</h1>
              <p className="text-sm text-gray-600">Dashboard de Prédictions de Demande</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Sélection de produit */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Sélection Produit
              </h3>
              
              {/* Recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtre par catégorie */}
              <div className="mb-4">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Toutes catégories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Liste des produits */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProduct.id === product.id 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    <p className="text-xs text-blue-600">{product.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            
            {/* En-tête du produit sélectionné */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-600">SKU: {selectedProduct.sku} • Catégorie: {selectedProduct.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">
                      {modelAccuracy.toFixed(1)}% de précision
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Précision du modèle</p>
                </div>
              </div>
            </div>

            {/* Graphique principal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Historique et Prédictions de Demande
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Ventes réelles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Prédictions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-200 rounded"></div>
                    <span>Intervalle de confiance</span>
                  </div>
                </div>
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Zone de confiance */}
                    <Area
                      type="monotone"
                      dataKey="confidenceMax"
                      stroke="none"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceMin"
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={1}
                    />
                    
                    {/* Ligne de prédiction */}
                    <Line
                      type="monotone"
                      dataKey="prediction"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                    
                    {/* Ligne des ventes réelles */}
                    <Line
                      type="monotone"
                      dataKey="actualSales"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explicabilité simplifiée */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                Analyse des Facteurs d'Influence
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Tendance Générale</h4>
                  <p className="text-sm text-blue-800">
                    Croissance modérée observée (+2% par rapport au mois dernier). 
                    Le produit maintient une demande stable avec des pics saisonniers identifiés.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Saisonnalité</h4>
                  <p className="text-sm text-green-800">
                    Forte saisonnalité détectée en fin de mois (effet paie des fonctionnaires). 
                    Pic attendu autour du 25-30 de chaque mois.
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Événements Spéciaux</h4>
                  <p className="text-sm text-yellow-800">
                    Fête de la Jeunesse (20 Mai) approchant. 
                    Augmentation de +15% de la demande prévue durant cette période.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Confiance du Modèle</h4>
                  <p className="text-sm text-purple-800">
                    Modèle très fiable avec {modelAccuracy.toFixed(1)}% de précision. 
                    Intervalles de confiance serrés indiquent une prédiction robuste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;