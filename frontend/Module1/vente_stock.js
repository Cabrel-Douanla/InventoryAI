import React, { useState, useEffect } from 'react';
import { Upload, Download, Sync, Database, CheckCircle, AlertCircle, XCircle, Clock, Play, Pause, Settings, FileText, BarChart3, RefreshCw, Calendar, Filter, Search, Eye, Activity } from 'lucide-react';

const ImportSyncModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [syncJobs, setSyncJobs] = useState([
    {
      id: 1,
      name: 'Shopify - Ventes Quotidiennes',
      source: 'Shopify',
      type: 'sales',
      status: 'running',
      lastSync: '2025-06-23 14:30:00',
      nextSync: '2025-06-23 15:00:00',
      progress: 75,
      recordsProcessed: 1247,
      totalRecords: 1663,
      errors: 0,
      frequency: 'every_30min'
    },
    {
      id: 2,
      name: 'WooCommerce - Stock Temps Réel',
      source: 'WooCommerce',
      type: 'inventory',
      status: 'completed',
      lastSync: '2025-06-23 14:45:00',
      nextSync: '2025-06-23 15:15:00',
      progress: 100,
      recordsProcessed: 892,
      totalRecords: 892,
      errors: 0,
      frequency: 'every_30min'
    },
    {
      id: 3,
      name: 'Magento - Catalogue Produits',
      source: 'Magento',
      type: 'catalog',
      status: 'error',
      lastSync: '2025-06-23 13:30:00',
      nextSync: '2025-06-23 14:30:00',
      progress: 45,
      recordsProcessed: 234,
      totalRecords: 520,
      errors: 12,
      frequency: 'hourly'
    },
    {
      id: 4,
      name: 'ERP SAP - Mouvements Stock',
      source: 'SAP ERP',
      type: 'movements',
      status: 'scheduled',
      lastSync: '2025-06-23 12:00:00',
      nextSync: '2025-06-23 16:00:00',
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 0,
      errors: 0,
      frequency: 'every_4h'
    }
  ]);

  const [importHistory, setImportHistory] = useState([
    {
      id: 1,
      fileName: 'ventes_juin_2025.csv',
      source: 'Upload Manuel',
      type: 'sales',
      status: 'completed',
      timestamp: '2025-06-23 10:15:00',
      recordsProcessed: 2847,
      errors: 0,
      fileSize: '2.4 MB'
    },
    {
      id: 2,
      fileName: 'stock_warehouse_A.xlsx',
      source: 'Upload Manuel',
      type: 'inventory',
      status: 'processing',
      timestamp: '2025-06-23 14:20:00',
      recordsProcessed: 1205,
      errors: 3,
      fileSize: '5.7 MB'
    },
    {
      id: 3,
      fileName: 'catalogue_produits.json',
      source: 'API REST',
      type: 'catalog',
      status: 'failed',
      timestamp: '2025-06-23 13:45:00',
      recordsProcessed: 89,
      errors: 45,
      fileSize: '1.2 MB'
    }
  ]);

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'error': case 'failed': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4" />;
      case 'error': case 'failed': return <XCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Shopify': return '🛍️';
      case 'WooCommerce': return '🛒';
      case 'Magento': return '🏪';
      case 'SAP ERP': return '🏢';
      case 'Upload Manuel': return '📁';
      case 'API REST': return '🔗';
      default: return '📊';
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulation d'upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            // Ajouter à l'historique
            const newImport = {
              id: importHistory.length + 1,
              fileName: file.name,
              source: 'Upload Manuel',
              type: 'sales',
              status: 'processing',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              recordsProcessed: 0,
              errors: 0,
              fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
            };
            setImportHistory(prev => [newImport, ...prev]);
            return 0;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const startSync = (jobId) => {
    setSyncJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'running', progress: 0 } : job
    ));
  };

  const pauseSync = (jobId) => {
    setSyncJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'scheduled' } : job
    ));
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Sources Actives</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <Database className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Syncs Réussies (24h)</p>
              <p className="text-3xl font-bold">47</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Enregistrements/Jour</p>
              <p className="text-3xl font-bold">28.5K</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Erreurs Actives</p>
              <p className="text-3xl font-bold">3</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Statut des synchronisations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Synchronisations en Cours</h3>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser Tout
          </button>
        </div>
        
        <div className="space-y-4">
          {syncJobs.filter(job => job.status === 'running' || job.status === 'error').map(job => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSourceIcon(job.source)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{job.name}</h4>
                    <p className="text-sm text-gray-500">{job.source} • {job.type}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {getStatusIcon(job.status)}
                  {job.status === 'running' ? 'En cours' : job.status === 'error' ? 'Erreur' : 'Terminé'}
                </div>
              </div>
              
              {job.status === 'running' && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{job.recordsProcessed} / {job.totalRecords} enregistrements</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {job.status === 'error' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{job.errors} erreurs détectées</p>
                  <button className="text-sm text-red-600 hover:text-red-800 mt-1">Voir les détails →</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SyncJobsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Tâches de Synchronisation</h3>
        <button 
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Sync className="w-4 h-4" />
          Nouvelle Tâche
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Sync</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fréquence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSourceIcon(job.source)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.name}</div>
                        {job.status === 'running' && (
                          <div className="text-xs text-gray-500">
                            {job.recordsProcessed} / {job.totalRecords} enregistrements
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {job.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status === 'running' ? 'En cours' : 
                       job.status === 'completed' ? 'Terminé' :
                       job.status === 'error' ? 'Erreur' : 
                       job.status === 'scheduled' ? 'Programmé' : job.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.lastSync).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.frequency === 'every_30min' ? 'Toutes les 30min' :
                     job.frequency === 'hourly' ? 'Toutes les heures' :
                     job.frequency === 'every_4h' ? 'Toutes les 4h' : job.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {job.status === 'scheduled' && (
                        <button 
                          onClick={() => startSync(job.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Démarrer"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {job.status === 'running' && (
                        <button 
                          onClick={() => pauseSync(job.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Paramètres">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ImportView = () => (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Import de Fichiers</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Glissez vos fichiers ici</h4>
          <p className="text-gray-600 mb-4">ou cliquez pour sélectionner</p>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept=".csv,.xlsx,.xls,.json"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Sélectionner un fichier
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Formats supportés: CSV, Excel (.xlsx, .xls), JSON
          </p>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Upload en cours...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Historique des imports */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Historique des Imports</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-300">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-300">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enregistrements</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {importHistory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSourceIcon(item.source)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.fileName}</div>
                        <div className="text-xs text-gray-500">{item.fileSize}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status === 'completed' ? 'Terminé' : 
                       item.status === 'processing' ? 'En cours' :
                       item.status === 'failed' ? 'Échec' : item.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{item.recordsProcessed.toLocaleString()} traités</div>
                      {item.errors > 0 && (
                        <div className="text-red-600 text-xs">{item.errors} erreurs</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Sync className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Import & Synchronisation</h1>
                  <p className="text-sm text-gray-600">Gestion des données de ventes et de stock</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-300">
                <Calendar className="w-4 h-4" />
                Planifier
              </button>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
              { id: 'sync', label: 'Synchronisations', icon: Sync },
              { id: 'import', label: 'Import Fichiers', icon: Upload },
              { id: 'mapping', label: 'Mapping Données', icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'sync' && <SyncJobsView />}
        {activeTab === 'import' && <ImportView />}
        {activeTab === 'mapping' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mapping des Données</h3>
            <p className="text-gray-600">Configuration du mapping des champs de données</p>
          </div>
        )}
      </div>

      {/* Modal détails tâche */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getSourceIcon(selectedJob.source)}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedJob.name}</h3>
                    <p className="text-gray-600">{selectedJob.source}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Statut et progression */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Statut Actuel</h4>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                      {getStatusIcon(selectedJob.status)}
                      {selectedJob.status === 'running' ? 'En cours d\'exécution' : 
                       selectedJob.status === 'completed' ? 'Terminé avec succès' :
                       selectedJob.status === 'error' ? 'Erreur détectée' : 
                       selectedJob.status === 'scheduled' ? 'Programmé' : selectedJob.status}
                    </div>
                    {selectedJob.status === 'running' && (
                      <span className="text-sm text-gray-600">{selectedJob.progress}%</span>
                    )}
                  </div>
                  
                  {selectedJob.status === 'running' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedJob.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{selectedJob.recordsProcessed} / {selectedJob.totalRecords} enregistrements</span>
                        <span>Temps estimé: 5 min</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations de synchronisation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h5 className="font-medium text-blue-900">Dernière Synchronisation</h5>
                    </div>
                    <p className="text-blue-700">{new Date(selectedJob.lastSync).toLocaleString('fr-FR')}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      <h5 className="font-medium text-green-900">Prochaine Synchronisation</h5>
                    </div>
                    <p className="text-green-700">{new Date(selectedJob.nextSync).toLocaleString('fr-FR')}</p>
                  </div>
                </div>

                {/* Statistiques détaillées */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Statistiques</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{selectedJob.recordsProcessed.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Enregistrements traités</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{(selectedJob.recordsProcessed - selectedJob.errors).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Succès</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{selectedJob.errors}</p>
                      <p className="text-sm text-gray-600">Erreurs</p>
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type de données:</span>
                      <span className="font-medium">{selectedJob.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fréquence:</span>
                      <span className="font-medium">
                        {selectedJob.frequency === 'every_30min' ? 'Toutes les 30 minutes' :
                         selectedJob.frequency === 'hourly' ? 'Toutes les heures' :
                         selectedJob.frequency === 'every_4h' ? 'Toutes les 4 heures' : selectedJob.frequency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto-restart:</span>
                      <span className="font-medium text-green-600">Activé</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeout:</span>
                      <span className="font-medium">30 minutes</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fermer
                  </button>
                  <button className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                    Modifier
                  </button>
                  {selectedJob.status === 'scheduled' && (
                    <button 
                      onClick={() => {
                        startSync(selectedJob.id);
                        setSelectedJob(null);
                      }}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Démarrer
                    </button>
                  )}
                  {selectedJob.status === 'running' && (
                    <button 
                      onClick={() => {
                        pauseSync(selectedJob.id);
                        setSelectedJob(null);
                      }}
                      className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Pause
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle tâche */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Nouvelle Tâche de Synchronisation</h3>
                <button 
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la tâche</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Import ventes quotidiennes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source de données</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Sélectionner une source</option>
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="magento">Magento</option>
                    <option value="sap">SAP ERP</option>
                    <option value="api">API REST Personnalisée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de données</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="sales">Données de ventes</option>
                    <option value="inventory">Stock et inventaire</option>
                    <option value="catalog">Catalogue produits</option>
                    <option value="movements">Mouvements de stock</option>
                    <option value="customers">Données clients</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence de synchronisation</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="every_15min">Toutes les 15 minutes</option>
                    <option value="every_30min">Toutes les 30 minutes</option>
                    <option value="hourly">Toutes les heures</option>
                    <option value="every_4h">Toutes les 4 heures</option>
                    <option value="daily">Quotidiennement</option>
                    <option value="manual">Manuel uniquement</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="09:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (minutes)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="30"
                      min="5"
                      max="120"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-restart"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                  <label htmlFor="auto-restart" className="text-sm text-gray-700">
                    Redémarrage automatique en cas d'échec
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                  <label htmlFor="notifications" className="text-sm text-gray-700">
                    Notifications par email en cas d'erreur
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button 
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowJobModal(false);
                      // Ajouter la logique de création de tâche ici
                    }}
                  >
                    Créer la tâche
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      };