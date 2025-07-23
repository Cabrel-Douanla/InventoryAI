import React, { useState } from 'react';
import { Building2, Edit, Download, Save, X, Shield, Users, CreditCard, Settings, AlertCircle, CheckCircle, MapPin, Phone, Mail, Globe, User } from 'lucide-react';

const EnterpriseAccountManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('billing');
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'TechCorp Solutions',
    industry: 'Technologie',
    size: '250-500 employés',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    phone: '+33 1 23 45 67 89',
    email: 'contact@techcorp-solutions.fr',
    website: 'www.techcorp-solutions.fr',
    taxId: 'FR12345678901',
    registrationNumber: '123 456 789 RCS Paris'
  });

  const [billingInfo, setBillingInfo] = useState({
    plan: 'Enterprise Premium',
    users: 45,
    maxUsers: 100,
    monthlyFee: 2499,
    nextBilling: '2025-07-15',
    paymentMethod: '**** **** **** 1234',
    billingAddress: '123 Avenue des Champs-Élysées, 75008 Paris, France'
  });

  const [subscription, setSubscription] = useState({
    status: 'active',
    startDate: '2024-01-15',
    renewalDate: '2025-07-15',
    autoRenewal: true
  });

  const handleSave = () => {
    setIsEditing(false);
    // Simulation de sauvegarde
    setTimeout(() => {
      alert('Informations mises à jour avec succès !');
    }, 500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Réinitialiser les modifications si nécessaire
  };

  const InputField = ({ label, value, onChange, name, type = "text", disabled = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || !isEditing}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled || !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactif', color: 'bg-red-100 text-red-800' },
      suspended: { label: 'Suspendu', color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-500">Gestion de Compte Entreprise</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Accès Admin requis
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{companyInfo.name}</h2>
                <p className="text-sm text-gray-500">{companyInfo.industry} • {companyInfo.size}</p>
                <div className="flex items-center mt-2">
                  <StatusBadge status={subscription.status} />
                  <span className="ml-3 text-sm text-gray-500">
                    Plan: <span className="font-medium">{billingInfo.plan}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 border-b">
            <div className="flex space-x-2">
              <TabButton
                id="billing"
                label="Facturation"
                icon={CreditCard}
                active={activeTab === 'billing'}
                onClick={setActiveTab}
              />
              <TabButton
                id="users"
                label="Utilisateurs"
                icon={Users}
                active={activeTab === 'users'}
                onClick={setActiveTab}
              />
              <TabButton
                id="settings"
                label="Paramètres"
                icon={Settings}
                active={activeTab === 'settings'}
                onClick={setActiveTab}
              />
            </div>
          </div>

          <div className="p-6">

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonnement Actuel</h3>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-blue-900">{billingInfo.plan}</h4>
                        <p className="text-blue-700">€{billingInfo.monthlyFee}/mois</p>
                      </div>
                      <StatusBadge status={subscription.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Utilisateurs</p>
                        <p className="font-medium">{billingInfo.users}/{billingInfo.maxUsers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prochaine facturation</p>
                        <p className="font-medium">{new Date(billingInfo.nextBilling).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Renouvellement auto</p>
                        <p className="font-medium">{subscription.autoRenewal ? 'Activé' : 'Désactivé'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthode de Paiement</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <p className="font-medium">{billingInfo.paymentMethod}</p>
                          <p className="text-sm text-gray-600">Expire 12/2026</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse de Facturation</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-600 mr-3 mt-1" />
                        <div>
                          <p className="font-medium">{companyInfo.name}</p>
                          <p className="text-sm text-gray-600">{billingInfo.billingAddress}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Factures</h3>
                  <div className="bg-white border rounded-lg">
                    <div className="p-4 border-b">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                        <div>Date</div>
                        <div>Montant</div>
                        <div>Statut</div>
                        <div>Actions</div>
                      </div>
                    </div>
                    {[
                      { date: '2025-06-15', amount: '€2,499', status: 'Payée' },
                      { date: '2025-05-15', amount: '€2,499', status: 'Payée' },
                      { date: '2025-04-15', amount: '€2,499', status: 'Payée' }
                    ].map((invoice, index) => (
                      <div key={index} className="p-4 border-b last:border-b-0">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>{invoice.date}</div>
                          <div className="font-medium">{invoice.amount}</div>
                          <div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {invoice.status}
                            </span>
                          </div>
                          <div>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="ml-2 w-7 h-7" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Statistiques des Utilisateurs</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{billingInfo.users}</p>
                        <p className="text-sm text-blue-700">Utilisateurs actifs</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-green-900">42</p>
                        <p className="text-sm text-green-700">Connectés ce mois</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-900">3</p>
                        <p className="text-sm text-yellow-700">Invitations en attente</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <User className="w-8 h-8 text-gray-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{billingInfo.maxUsers - billingInfo.users}</p>
                        <p className="text-sm text-gray-700">Places disponibles</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Répartition par Rôle</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-red-600 mr-2" />
                        <span>Administrateurs</span>
                      </div>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-blue-600 mr-2" />
                        <span>Utilisateurs Standard</span>
                      </div>
                      <span className="font-medium">40</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-blue-900">Gestion des Utilisateurs</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Pour gérer les utilisateurs individuels, leurs rôles et permissions, 
                        rendez-vous dans le module "Gestion des Utilisateurs et des Rôles".
                      </p>
                      <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <a href="/user-management">Accéder à la Gestion des Utilisateurs</a>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de Sécurité</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Authentification à deux facteurs (2FA)</p>
                        <p className="text-sm text-gray-600">Obligatoire pour tous les administrateurs</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">Activé</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Expiration des sessions</p>
                        <p className="text-sm text-gray-600">Déconnexion automatique après inactivité</p>
                      </div>
                      <select className="px-3 py-1 border rounded-lg">
                        <option>8 heures</option>
                        <option>4 heures</option>
                        <option>2 heures</option>
                        <option>1 heure</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Restriction d'accès par IP</p>
                        <p className="text-sm text-gray-600">Limiter l'accès à certaines adresses IP</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Configurer
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences Système</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Fuseau horaire</p>
                        <p className="text-sm text-gray-600">Utilisé pour tous les rapports et notifications</p>
                      </div>
                      <select className="px-3 py-1 border rounded-lg">
                        <option>Europe/Paris (GMT+1)</option>
                        <option>Europe/London (GMT+0)</option>
                        <option>America/New_York (GMT-5)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Langue par défaut</p>
                        <p className="text-sm text-gray-600">Langue principale de l'interface</p>
                      </div>
                      <select className="px-3 py-1 border rounded-lg">
                        <option>Français</option>
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Alertes de sécurité</p>
                        <p className="text-sm text-gray-600">Notifications en cas d'activité suspecte</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Rapports automatiques</p>
                        <p className="text-sm text-gray-600">Envoi hebdomadaire des rapports d'activité</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Mises à jour système</p>
                        <p className="text-sm text-gray-600">Notifications des nouvelles fonctionnalités</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Zone de Danger</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800">Suspendre le compte</p>
                        <p className="text-sm text-red-600">Désactiver temporairement tous les accès</p>
                      </div>
                      <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                        Suspendre
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800">Supprimer le compte</p>
                        <p className="text-sm text-red-600">Action irréversible - toutes les données seront perdues</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAccountManagement;