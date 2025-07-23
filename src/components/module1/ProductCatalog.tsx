import React, { useState } from 'react';
import { Search, Plus, Upload, Download, Edit3, Trash2 } from 'lucide-react';

const ProductCatalog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [formData, setFormData] = useState();

      const handleEditUser = () => {
        setModalType('edit');
        setFormData();
        setShowModal(true);
    };
    const products = [
        // Ajoutez vos données de produits ici
        {
            id: 1,
            sku: 'ELE-001-2024',
            name: 'Smartphone Samsung Galaxy S24',
            category: 'Électronique',
            description: 'Smartphone dernière génération 256GB',
            costPrice: 650.00,
            sellPrice: 899.00,
            currentStock: 45,
            minStock: 10,
            maxStock: 100,
            weight: 0.168,
            stockStatus: 'good',
        },
        // Ajoutez d'autres produits ici
    ];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStock = !stockFilter || (stockFilter === 'low' && product.currentStock < product.minStock) || (stockFilter === 'good' && product.currentStock >= product.minStock);

        return matchesSearch && matchesCategory && matchesStock;
    });

    const handleAddProduct = () => {
        setModalType('create');
        setFormData();
        setShowModal(true);
    };

    const handleImport = () => {
        // Logique pour importer des produits
    };

    const handleExport = () => {
        // Logique pour exporter le catalogue
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📦 Catalogue Produits</h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-6">
                <div className="flex items-center mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, SKU, code-barres..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-85 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select className="p-2 ml-4 border border-gray-300 rounded-lg" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">Toutes les catégories</option>
                        <option value="electronique">Électronique</option>
                        <option value="textile">Textile</option>
                        <option value="alimentaire">Alimentaire</option>
                        <option value="bricolage">Bricolage</option>
                    </select>
                    <select className="p-2 ml-4 border border-gray-300 rounded-lg" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                        <option value="">Tous les stocks</option>
                        <option value="good">Stock normal</option>
                        <option value="low">Stock bas</option>
                        <option value="out">Rupture</option>
                    </select>
                </div>

                <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleImport}>
                        <Upload className="w-4 h-4 mr-2" /> Importer
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Exporter
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg" onClick={handleAddProduct}>
                        <Plus className="w-4 h-4 mr-2" /> Nouveau Produit
                    </button>
                </div>
            </div>
            
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {modalType === 'create' ? 'Ajouter un nouveau produit' : 'Modifier le produit'}
                    </h3>
                    
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                        </label>
                        <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: ordinateur"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sku
                        </label>
                        <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: ELE-001-2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        prix
                        </label>
                        <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 899.00 €"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qte
                        </label>
                        <input
                        type="number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 10"
                        />
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                        <button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                        {modalType === 'create' ? 'Ajouter' : 'Modifier'}
                        </button>
                        <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                        Annuler
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix de vente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock actuel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4">{product.name}</td>
                                    <td className="px-6 py-4">{product.sku}</td>
                                    <td className="px-6 py-4">{product.sellPrice.toFixed(2)} €</td>
                                    <td className="px-6 py-4">{product.currentStock}</td>
                                    <td className="px-6 py-4">
                                        <button
                                        onClick={() => handleEditUser()}
                                        className="text-blue-600 hover:text-blue-900"> <Edit3 size={16} /> </button>
                                        <button className="text-red-600 hover:text-red-900 ml-2"> <Trash2 size={16} /> </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductCatalog;