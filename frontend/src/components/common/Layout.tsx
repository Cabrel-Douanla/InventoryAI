// Fichier : src/components/common/Layout.tsx

import React, { useState, Fragment } from 'react';
import { 
  BarChart3, Package, Settings, Bell, User, Menu, X, Home, Database, Brain, LogOut, Building2, Check, ChevronDown 
} from 'lucide-react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Transition } from '@headlessui/react'; // Bibliothèque pour des transitions fluides

// ==============================================================================
// SOUS-COMPOSANT : SÉLECTEUR D'ENTREPRISE
// =ag=============================================================================
const CompanySelector = () => {
  const { user, activeCompanyId, setActiveCompany } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeCompany = user?.companies.find(c => c.id === activeCompanyId);

  if (!user || user.companies.length === 0) {
    return (
      <div className="text-sm font-medium text-gray-500">
        Aucune entreprise
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <Building2 size={16} className="text-gray-600" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{activeCompany?.name || 'Sélectionner...'}</p>
          <p className="text-xs text-gray-500">Entreprise active</p>
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-gray-500">Changer d'entreprise</p>
            {user.companies.map(company => (
              <button
                key={company.id}
                onClick={() => {
                  setActiveCompany(company.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>{company.name}</span>
                {activeCompanyId === company.id && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
            {/* Ajouter un bouton pour créer une nouvelle entreprise */}
          </div>
        </div>
      </Transition>
    </div>
  );
};


// ==============================================================================
// SOUS-COMPOSANT : MENU UTILISATEUR
// ==============================================================================
const UserMenu = () => {
  const { user, logout, activeCompanyId } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const activeRole = user.companies.find(c => c.id === activeCompanyId)?.role;
  const userInitial = user.email.substring(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {userInitial}
        </div>
      </button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate">{user.email.split('@')[0]}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                {activeRole && (
                  <p className="text-xs text-gray-400 capitalize">{activeRole}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/account-management');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <User size={16} />
              Mon compte
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                // navigate('/settings'); // Endpoint à définir
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Settings size={16} />
              Paramètres
            </button>
            <hr className="my-2" />
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                navigate('/'); // Redirige vers la page de connexion/inscription
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
};


// ==============================================================================
// COMPOSANT PRINCIPAL : LAYOUT
// ==============================================================================
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Utilise le store pour obtenir les informations nécessaires
  const user = useAuthStore((state) => state.user);
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  
  const activeCompany = user?.companies.find(c => c.id === activeCompanyId);
  const userRole = activeCompany?.role;

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home, path: '/dashboard', roles: ['admin', 'member'] },
    { id: 'prediction', label: 'Prédiction Demande', icon: Brain, path: '/prediction', roles: ['admin', 'member'] },
    { id: 'catalog', label: 'Catalogue Produits', icon: Package, path: '/catalog-management', roles: ['admin', 'member'] },
    { id: 'sales', label: 'Import Ventes', icon: Database, path: '/vente', roles: ['admin', 'member'] },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['admin', 'member'] },
    { id: 'divider', type: 'divider' },
    { id: 'company_list', label: 'Infos Entreprises', icon: Building2, path: '/entreprise', roles: ['admin', 'member'] },
    { id: 'user_management', label: 'Gestion Équipe', icon: Settings, path: '/user-management', roles: ['admin'] },
    // { id: 'account_management', label: 'Compte & Facturation', icon: User, path: '/account-management', roles: ['admin'] },
  ];

  // Filtrer les items du menu en fonction du rôle de l'utilisateur dans l'entreprise active
  const filteredMenuItems = menuItems.filter(item => item.type === 'divider' || (userRole && item.roles.includes(userRole)));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fixe */}
      <aside className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-40 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo/Titre */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 h-16">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-900 truncate">InventoryAI</h1>}
        </div>

        {/* Menu de navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item, index) => {
            if (item.type === 'divider') {
              return <hr key={`divider-${index}`} className={`my-4 ${sidebarOpen ? '' : 'mx-2'}`} />;
            }

            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                title={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors text-left
                  ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
                  ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Contenu Principal */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-2 h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center gap-3">
              <CompanySelector />
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Conteneur pour le contenu des pages */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;