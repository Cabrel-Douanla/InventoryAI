// Fichier: src/services/apiService.ts
import api from '../api';
import type { CompanyDetails, ProductDashboardData, JobStatusResponse, JobSubmission, LoginResponse, UserProfile } from '../types';

// Types pour les payloads (ce que l'API attend)
interface CompanyCreatePayload {
    name: string;
}

interface UserInvitePayload {
    email: string;
    role: 'admin' | 'member';
}


// --- TYPES POUR LES PRODUITS ---
export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    company_id: number;
}

export interface ProductCreatePayload {
    sku: string;
    name: string;
    description?: string;
}

export interface ProductUpdatePayload {
    sku?: string;
    name?: string;
    description?: string;
}

// Types pour les payloads (ce que l'API attend)
export interface UserRegisterPayload {
    email: string;
    password: string;
}

export interface UserLoginPayload {
    username: string; // L'API attend 'username' pour l'email
    password: string;
}
export const registerUser = async (payload: UserRegisterPayload): Promise<UserProfile> => {
    const { data } = await api.post('/api/v1/register', payload);
    return data;
};

export const loginUser = async (payload: UserLoginPayload): Promise<LoginResponse> => {
    // L'API attend des données de formulaire, pas du JSON
    const formData = new URLSearchParams();
    formData.append('username', payload.username);
    formData.append('password', payload.password);

    const { data } = await api.post('/api/v1/login/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
};

export const fetchProductDashboardData = async (productId: number): Promise<ProductDashboardData> => {
    const { data } = await api.get(`/api/v1/dashboard/product/${productId}`);
    return data;
};

// Fonction pour créer une nouvelle entreprise
export const createCompany = async (payload: CompanyCreatePayload): Promise<CompanyDetails> => {
    const { data } = await api.post('/api/v1/company/', payload);
    return data;
};

// La fonction fetchCompanyDetails est maintenant la source de vérité pour la liste des membres
export const fetchCompanyDetails = async (): Promise<CompanyDetails> => {
    // Note: l'ID de l'entreprise est déjà dans le header grâce à notre api.ts
    // L'endpoint est `/` car il est préfixé par `/api/v1/company` dans main.py
    const { data } = await api.get('/api/v1/company/');
    return data;
};

// Fonction pour inviter un utilisateur
export const inviteUser = async (payload: UserInvitePayload): Promise<UserProfile> => {
    const { data } = await api.post('/api/v1/company/invite', payload);
    return data;
}

export const fetchProducts = async (): Promise<any[]> => {
    const { data } = await api.get('/api/v1/products/');
    return data;
};

export const createProduct = async (payload: ProductCreatePayload): Promise<Product> => {
    const { data } = await api.post('/api/v1/products/', payload);
    return data;
};

export const updateProduct = async ({ id, payload }: { id: number, payload: ProductUpdatePayload }): Promise<Product> => {
    const { data } = await api.put(`/api/v1/products/${id}`, payload);
    return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/products/${id}`);
};

// --- FONCTIONS POUR VENTES & JOBS ---

export const uploadSalesFile = async (file: File): Promise<JobSubmission> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/api/v1/sales/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const fetchJobStatus = async (jobId: number): Promise<JobStatusResponse> => {
    const { data } = await api.get(`/api/v1/sales/jobs/${jobId}`);
    return data;
};

// --- FONCTIONS POUR PRÉDICTIONS ---

export const triggerPrediction = async (productId: number): Promise<JobSubmission> => {
    const { data } = await api.post(`/api/v1/predictions/product/${productId}`);
    return data;
};

// ... Ajoutez ici d'autres fonctions pour les produits, les ventes, etc.
// export const fetchProducts = async () => { ... }
// export const createProduct = async (payload) => { ... }