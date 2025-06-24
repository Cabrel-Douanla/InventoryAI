import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  Settings,
  Bell,
  User,
  Menu,
  X,
  Home,
  Database,
  Brain
} from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = ({ children, currentPage = 'prediction' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // true = visible par défaut

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home, path: '/dashboard' },
    { id: 'prediction', label: 'Prédiction Demande', icon: Brain, path: '/prediction' },
    { id: 'optimization', label: 'Optimisation Stock', icon: Package, path: '/optimization' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'data', label: 'Données', icon: Database, path: '/data' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 bg-white shadow-lg z-30 flex flex-col">

          <nav className="flex-1 p-4 space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon size={20} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Besoin d'aide ?
              </h3>
              <p className="text-xs text-blue-700 mb-2">
                Consultez notre documentation
              </p>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Voir les guides →
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Menu toggle button visible on all screens */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">InventoryAI</h1>
                <p className="text-xs text-gray-500">Enterprise</p>
              </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Entreprise ABC</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
