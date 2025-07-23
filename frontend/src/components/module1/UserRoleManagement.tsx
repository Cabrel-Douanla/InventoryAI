// Fichier: src/components/module1/UserRoleManagement.tsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Plus, Search, Edit3, Trash2, Mail, Shield, Users, Loader2, X } from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { fetchCompanyDetails, inviteUser } from '../../services/apiServices';
import { type CompanyMember } from '../../types'; // Assurez-vous d'avoir ce type

// ==============================================================================
// VALIDATION DE FORMULAIRE AVEC ZOD
// ==============================================================================
const inviteSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  role: z.enum(['admin', 'member'], { errorMap: () => ({ message: "Le rôle est requis." }) }),
});
type InviteFormData = z.infer<typeof inviteSchema>;


// ==============================================================================
// SOUS-COMPOSANT : MODAL D'INVITATION
// ==============================================================================
interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const activeCompanyId = useAuthStore((state) => state.activeCompanyId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { role: 'member' }
    });

    const inviteMutation = useMutation({
        mutationFn: inviteUser,
        onSuccess: (invitedUser) => {
            toast.success(`Invitation envoyée avec succès à ${invitedUser.email}`);
            queryClient.invalidateQueries({ queryKey: ['companyDetails', activeCompanyId] });
            onClose();
            reset();
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || "Impossible d'envoyer l'invitation."}`);
        }
    });

    const onSubmit: SubmitHandler<InviteFormData> = (data) => {
        inviteMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Inviter un nouvel utilisateur</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input {...register('email')} type="email" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="membre@exemple.com" />
                        </div>
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                        <select {...register('role')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                            <option value="member">Membre</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" disabled={inviteMutation.isPending} className="btn-primary flex items-center disabled:opacity-50">
                            {inviteMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" size={16} />}
                            {inviteMutation.isPending ? 'Envoi...' : 'Envoyer l\'invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
const UserRoleManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, activeCompanyId } = useAuthStore();

    const activeRole = user?.companies.find(c => c.id === activeCompanyId)?.role;
    const isAdmin = activeRole === 'admin';
    
    // RÉCUPÉRATION DES DONNÉES AVEC REACT QUERY
    const { data: companyDetails, isLoading, isError, error } = useQuery({
        queryKey: ['companyDetails', activeCompanyId],
        queryFn: fetchCompanyDetails,
        enabled: !!activeCompanyId,
    });
    
    // FILTRAGE DES UTILISATEURS
    const filteredUsers = useMemo(() => {
        if (!companyDetails?.members) return [];
        return companyDetails.members.filter(member =>
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [companyDetails, searchTerm]);
    
    // GESTION DES ÉTATS D'AFFICHAGE
    if (!activeCompanyId) {
        return <div className="p-6 text-center text-gray-500">Veuillez sélectionner une entreprise pour gérer les utilisateurs.</div>;
    }

    if (isLoading) {
        return <div className="p-6 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Chargement de l'équipe...</div>;
    }

    if (isError) {
        return <div className="p-6 text-center text-red-600">Erreur: {error?.message || "Impossible de charger les données de l'entreprise."}</div>;
    }

    return (
        <div className="p-6">
            <InviteModal isOpen={showModal} onClose={() => setShowModal(false)} />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Users className="mr-3 text-blue-600" size={32} />
                        Gestion de l'Équipe
                    </h1>
                    <p className="text-gray-600 mt-2">Gérez les accès et permissions pour <span className="font-semibold">{companyDetails?.name}</span></p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                      <Plus size={20} /> Inviter un utilisateur
                  </button>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((member: CompanyMember) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {member.role === 'admin' ? 'Administrateur' : 'Membre'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {member.is_active ? 'Actif' : 'Invitation en attente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {isAdmin && member.id !== user?.id && (
                                            <div className="flex items-center space-x-3">
                                                <button className="text-blue-600 hover:text-blue-800" title="Modifier (à implémenter)">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800" title="Supprimer (à implémenter)">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
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

export default UserRoleManagement;