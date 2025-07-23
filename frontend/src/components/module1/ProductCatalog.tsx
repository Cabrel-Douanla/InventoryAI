// Fichier: src/components/module1/ProductCatalog.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Upload, Download, Edit3, Trash2, Loader2, X, Save } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../stores/authStore';
import { type Product, createProduct, updateProduct, fetchProducts, deleteProduct } from '../../services/apiService';

// ==============================================================================
// VALIDATION DE FORMULAIRE AVEC ZOD
// ==============================================================================
const productSchema = z.object({
    name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
    sku: z.string().min(1, { message: "Le SKU est obligatoire." }),
    description: z.string().optional(),
});
type ProductFormData = z.infer<typeof productSchema>;

// ==============================================================================
// SOUS-COMPOSANT : MODAL DE PRODUIT
// ==============================================================================
interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
    const queryClient = useQueryClient();
    const activeCompanyId = useAuthStore((state) => state.activeCompanyId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    useEffect(() => {
        // Pré-remplir le formulaire si on est en mode édition
        if (productToEdit) {
            reset({
                name: productToEdit.name,
                sku: productToEdit.sku,
                description: productToEdit.description || '',
            });
        } else {
            reset({ name: '', sku: '', description: '' });
        }
    }, [productToEdit, isOpen, reset]);

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            toast.success('Produit créé avec succès !');
            queryClient.invalidateQueries({ queryKey: ['products', activeCompanyId] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            toast.success('Produit mis à jour avec succès !');
            queryClient.invalidateQueries({ queryKey: ['products', activeCompanyId] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || error.message}`);
        },
    });

    const onSubmit: SubmitHandler<ProductFormData> = (data) => {
        if (productToEdit) {
            updateMutation.mutate({ id: productToEdit.id, payload: data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (!isOpen) return null;

    const isMutating = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {productToEdit ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                        <input {...register('name')} className="input-field" placeholder="Ex: Smartphone Galaxy S24" />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Référence unique) *</label>
                        <input {...register('sku')} className="input-field" placeholder="Ex: ELE-001-2024" />
                        {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...register('description')} className="input-field" rows={3} placeholder="Description optionnelle du produit..."></textarea>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" disabled={isMutating} className="btn-primary flex items-center disabled:opacity-50">
                            {isMutating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={16} />}
                            {productToEdit ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==============================================================================
// COMPOSANT PRINCIPAL : CATALOGUE DE PRODUITS
// ==============================================================================
const ProductCatalog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const queryClient = useQueryClient();
    const activeCompanyId = useAuthStore((state) => state.activeCompanyId);

    // RÉCUPÉRATION DES DONNÉES AVEC REACT QUERY
    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products', activeCompanyId],
        queryFn: fetchProducts,
        enabled: !!activeCompanyId,
    });

    // MUTATION POUR LA SUPPRESSION
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            toast.success("Produit supprimé avec succès.");
            queryClient.invalidateQueries({ queryKey: ['products', activeCompanyId] });
        },
        onError: (error: any) => {
            toast.error(`Erreur: ${error.response?.data?.detail || error.message}`);
        }
    });

    const handleOpenCreateModal = () => {
        setProductToEdit(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setProductToEdit(product);
        setShowModal(true);
    };

    const handleDelete = (productId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            deleteMutation.mutate(productId);
        }
    }

    // FILTRAGE DES PRODUITS
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    // AFFICHAGE DES ÉTATS
    if (!activeCompanyId) {
        return <div className="p-6 text-center text-gray-500">Veuillez sélectionner une entreprise pour voir le catalogue.</div>;
    }

    if (isLoading) {
        return <div className="p-6 text-center"> <Loader2 className="animate-spin inline-block mr-2" /> Chargement du catalogue...</div>;
    }

    if (isError) {
        return <div className="p-6 text-center text-red-600">Erreur lors du chargement des produits.</div>;
    }

    return (
        <div className="p-6">
            <ProductModal isOpen={showModal} onClose={() => setShowModal(false)} productToEdit={productToEdit} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">📦 Catalogue Produits</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary flex items-center gap-2" disabled><Upload size={16} /> Importer</button>
                        <button className="btn-secondary flex items-center gap-2" disabled><Download size={16} /> Exporter</button>
                        <button className="btn-primary flex items-center gap-2" onClick={handleOpenCreateModal}>
                            <Plus size={16} /> Nouveau Produit
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.sku}</td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-sm">{product.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleOpenEditModal(product)} className="text-blue-600 hover:text-blue-900" title="Modifier">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 ml-4" title="Supprimer">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>Aucun produit trouvé.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCatalog;