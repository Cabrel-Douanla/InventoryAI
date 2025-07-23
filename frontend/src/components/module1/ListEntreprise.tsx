import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit, Trash2, Mail, Phone, MapPin, Save, X, Loader2 } from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import api from '../../api'; // Importer pour rafraîchir les données utilisateur
import { createCompany } from '../../services/apiService';

// ==============================================================================
// SOUS-COMPOSANTS (Inchangés mais inclus pour la complétude)
// ==============================================================================
const EnterpriseCard = ({ enterprise, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{enterprise.name}</h3>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            enterprise.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {enterprise.role === 'admin' ? 'Administrateur' : 'Membre'}
          </span>
        </div>
      </div>
      <div className="flex space-x-2 self-end">
        {enterprise.role === 'admin' && (
          <>
            <button
              onClick={() => onEdit(enterprise)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier (fonctionnalité à venir)"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(enterprise.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer (fonctionnalité à venir)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
    <div className="mt-auto pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
            ID: {enterprise.id}
        </p>
    </div>
  </div>
);

const EnterpriseForm = ({ formData, setFormData, onSubmit, onCancel, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une nouvelle entreprise</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'entreprise *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Distribution Centrale SARL"
        />
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
          disabled={isLoading || !formData.name}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 inline mr-2" />
          )}
          {isLoading ? 'Création...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};


// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
const ListEntreprises = () => {
  // Lire l'état directement depuis le store Zustand
  const { user, login } = useAuthStore();
  const enterprises = user?.companies || [];

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  
  // Utilitaire pour rafraîchir les données de l'utilisateur après une action
  const refetchUserData = async () => {
    try {
      const response = await api.get('/api/v1/users/me');
      const token = localStorage.getItem('inventoryai_token');
      if (response.data && token) {
        // Mettre à jour le store Zustand avec les nouvelles informations
        login(response.data, token);
      }
    } catch (error) {
      console.error("Impossible de rafraîchir les données utilisateur:", error);
    }
  };

  // Mutation pour la création d'entreprise
  const createCompanyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      // Au succès, rafraîchir les données de l'utilisateur
      refetchUserData();
      
      // Fermer le formulaire et réinitialiser
      setShowCreateForm(false);
      setFormData({ name: '' });
      alert('Entreprise créée avec succès !');
    },
    onError: (error: any) => {
      // Afficher une erreur claire à l'utilisateur
      const errorMessage = error.response?.data?.detail || "Une erreur est survenue lors de la création de l'entreprise.";
      alert(`Erreur: ${errorMessage}`);
    }
  });

  const handleCreateEnterprise = () => {
    if (!formData.name.trim()) {
      alert("Le nom de l'entreprise ne peut pas être vide.");
      return;
    }
    createCompanyMutation.mutate({ name: formData.name });
  };

  const handleEdit = (enterprise) => {
    // La logique de mise à jour sera implémentée ici
    alert(`Fonctionnalité de modification pour "${enterprise.name}" à venir.`);
  };

  const handleDelete = (enterpriseId) => {
    // La logique de suppression sera implémentée ici
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.")) {
      alert(`Fonctionnalité de suppression pour l'ID ${enterpriseId} à venir.`);
    }
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Gestion des Entreprises
            </h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle entreprise</span>
            </button>
          </div>

          {showCreateForm && (
            <div className="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <EnterpriseForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateEnterprise}
                  onCancel={() => setShowCreateForm(false)}
                  isLoading={createCompanyMutation.isPending}
                />
            </div>
          )}

          {enterprises.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {enterprises.map((enterprise) => (
                <EnterpriseCard
                  key={enterprise.id}
                  enterprise={enterprise}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune entreprise associée</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Créez votre première entreprise pour commencer.
                </p>
                <div className="mt-6">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center mx-auto space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Créer une entreprise</span>
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListEntreprises;