import React, { useState } from 'react';
import { Building2, Plus, Edit, Trash2, LogIn, Mail, Phone, MapPin, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateEntreprise = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enterprises, setEnterprises] = useState([
    {
      id: 1,
      name: "Distribution Centrale SARL",
      sector: 'Technologie',
      size: '250-500 employés',
      address: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@techcorp-solutions.fr',
      website: 'www.techcorp-solutions.fr',
      taxId: 'FR12345678901',
      registrationNumber: '123 456 789 RCS Paris',
      isOwner: true
    },
    {
      id: 2,
      name: "Pharma Plus",
      sector: "Pharmacie",
      size: '250-500 employés',
      address: "Quartier Bastos, Yaoundé, Cameroun",
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: "+237 222 20 45 67",
      email: "info@pharmaplus.cm",
      website: 'www.techcorp-solutions.fr',
      taxId: 'FR12345678901',
      registrationNumber: '123 456 789 RCS Paris',
      isOwner: false
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sector: 'Distribution',
    size: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    registrationNumber: ''
  });

  // Simulation de connexion
  const navigate = useNavigate();
  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const handleCreateEnterprise = () => {
    if (formData.name && formData.address && formData.phone && formData.email) {
      const newEnterprise = {
        id: enterprises.length + 1,
        ...formData,
        isOwner: true
      };
      setEnterprises([...enterprises, newEnterprise]);
      setFormData({
        name: '',
        sector: 'Distribution',
        size: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        taxId: '',
        registrationNumber: ''
      });
      setShowCreateForm(false);
    }
  };

  const EnterpriseCard = ({ enterprise, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{enterprise.name}</h3>
            <span className="text-sm text-gray-500">{enterprise.sector}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {enterprise.isOwner && (
            <>
              <button
                onClick={() => onEdit(enterprise)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(enterprise.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>{enterprise.address}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4" />
          <span>{enterprise.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>{enterprise.email}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className={`px-2 py-1 rounded-full text-xs ${
            enterprise.isOwner 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {enterprise.isOwner ? 'Propriétaire' : 'Membre'}
          </span>
        </div>
      </div>
    </div>
  );

  const EnterpriseForm = ({ data, onChange, onSubmit, onCancel, title }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Distribution Centrale SARL"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secteur d'activité *
          </label>
          <select
            value={data.sector}
            onChange={(e) => onChange({ ...data, sector: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Distribution">Distribution</option>
            <option value="Retail">Retail</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Pharmacie">Pharmacie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taille de l'entreprise *
          </label>
          <input
            type="text"
            value={data.size}
            onChange={(e) => onChange({ ...data, size: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 250-500 employés"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de SIRET *
          </label>
          <input
            type="text"
            value={data.registrationNumber}
            onChange={(e) => onChange({ ...data, registrationNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 123 456 789 RCS Paris"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse *
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Avenue Kennedy, Douala, Cameroun"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code postal *
          </label>
          <input
            type="tel"
            value={data.postalCode}
            onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="75008"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pays *
          </label>
          <input
            type="tel"
            value={data.country}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="France"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ville *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paris"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+237 233 42 15 78"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@entreprise.cm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site web *
          </label>
          <input
            type="text"
            value={data.website}
            onChange={(e) => onChange({ ...data, website: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: www.techcorp-solutions.fr"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de TVA *
          </label>
          <input
            type="text"
            value={data.taxId}
            onChange={(e) => onChange({ ...data, taxId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: FR12345678901"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 inline mr-2" />
          Annuler
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          Enregistrer
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              InventoryAI Enterprise
            </h1>
            <p className="text-xl text-gray-600">
              Plateforme intelligente de gestion de stock pour les PME africaines
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Créer une nouvelle entreprise
                </h2>
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </button>
              </div>

              {!showCreateForm ? (
                <div className="text-center py-8">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">
                    Créez votre première entreprise pour commencer à utiliser InventoryAI
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Créer une entreprise</span>
                  </button>
                </div>
              ) : (
                <EnterpriseForm
                  data={formData}
                  onChange={setFormData}
                  onSubmit={handleCreateEnterprise}
                  onCancel={() => setShowCreateForm(false)}
                  title="Nouvelle entreprise"
                />
              )}
            </div>

            {enterprises.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Entreprises disponibles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enterprises.map((enterprise) => (
                    <EnterpriseCard
                      key={enterprise.id}
                      enterprise={enterprise}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default CreateEntreprise;