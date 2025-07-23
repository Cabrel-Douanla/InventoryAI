// Fichier: src/components/module1/ImportSyncModule.tsx

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock, Loader2, Eye, Database, BarChart3, Calendar, Settings } from 'lucide-react';

import { uploadSalesFile, fetchJobStatus } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';
import { type JobStatusResponse } from '../../types';

// ==============================================================================
// SOUS-COMPOSANT : JobStatusRow (pour le suivi individuel des jobs)
// ==============================================================================
interface JobStatusRowProps {
  jobId: number;
  initialStatus: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
}

const JobStatusRow: React.FC<JobStatusRowProps> = ({ jobId, initialStatus }) => {
  const { data: job, isError } = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => fetchJobStatus(jobId),
    // Le polling s'arrête automatiquement quand le job est terminé
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'SUCCESS' || status === 'FAILED') ? false : 3000; // Poll every 3 seconds
    },
    initialData: { // Fournit des données initiales pour éviter un flash de chargement
      job_id: jobId,
      status: initialStatus,
      created_at: new Date().toISOString(),
      result: 'En attente...',
    },
  });

  const getStatusInfo = (status: JobStatusResponse['status']) => {
    switch (status) {
      case 'SUCCESS': return { icon: <CheckCircle className="text-green-600" />, text: 'Terminé', color: 'bg-green-100 text-green-800' };
      case 'FAILED': return { icon: <XCircle className="text-red-600" />, text: 'Échec', color: 'bg-red-100 text-red-800' };
      case 'RUNNING': return { icon: <Loader2 className="animate-spin text-blue-600" />, text: 'En cours', color: 'bg-blue-100 text-blue-800' };
      default: return { icon: <Clock className="text-gray-600" />, text: 'En attente', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isError) {
    return (
      <tr className="bg-red-50">
        <td className="px-6 py-4">Job #{jobId}</td>
        <td colSpan={3} className="px-6 py-4 text-red-700">Erreur lors de la récupération du statut.</td>
      </tr>
    );
  }

  const { icon, text, color } = getStatusInfo(job.status);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900">Job #{job.job_id}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${color}`}>
          {icon} {text}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.created_at).toLocaleString('fr-FR')}</td>
      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{job.status === 'FAILED' ? job.result : ''}</td>
      <td className="px-6 py-4">
        <button onClick={() => alert(JSON.stringify(job, null, 2))} className="text-blue-600 hover:text-blue-800" title="Voir les détails JSON">
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
};


// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
const ImportSyncModule = () => {
  // Liste des IDs des jobs actuellement suivis dans cette session
  const [trackedJobIds, setTrackedJobIds] = useState<number[]>([]);
  const { activeCompanyId } = useAuthStore();

  // Mutation pour l'upload de fichier
  const uploadMutation = useMutation({
    mutationFn: uploadSalesFile,
    onSuccess: (data) => {
      toast.success(data.message);
      // Ajouter le nouvel ID de job à la liste de suivi
      setTrackedJobIds(prev => [data.job_id, ...prev]);
    },
    onError: (error: any) => {
      toast.error(`Erreur d'upload: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    event.target.value = ''; // Permet de re-uploader le même fichier
  };

  // Gérer l'affichage conditionnel
  if (!activeCompanyId) {
    return <div className="p-6 text-center text-gray-500">Veuillez sélectionner une entreprise pour importer des données.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database size={32} /> Import des Données de Vente
        </h1>
        <p className="text-gray-600 mt-1">Uploadez vos fichiers de ventes au format CSV pour alimenter l'IA.</p>
      </div>

      {/* Zone d'upload */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Glissez votre fichier CSV ici</h4>
          <p className="text-gray-600 mb-4">ou cliquez pour sélectionner</p>
          <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" accept=".csv" disabled={uploadMutation.isPending} />
          <label htmlFor="file-upload" className={`inline-flex items-center gap-2 btn-primary cursor-pointer ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <FileText size={16} />}
            {uploadMutation.isPending ? 'Envoi en cours...' : 'Sélectionner un fichier'}
          </label>
          <p className="text-sm text-gray-500 mt-2">Colonnes requises: transaction_date, sku, quantity_sold, unit_price</p>
        </div>
      </div>

      {/* Section de suivi des jobs */}
      {trackedJobIds.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Suivi des Imports en Cours</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de création</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trackedJobIds.map(jobId => (
                  <JobStatusRow key={jobId} jobId={jobId} initialStatus="PENDING" />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportSyncModule;