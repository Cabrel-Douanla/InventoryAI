// Fichier: src/stores/authStore.ts

import { create } from 'zustand';
import type { AuthState, UserProfile } from '../types';

// Création du store avec Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  // --- État Initial ---
  user: null,
  token: null,
  activeCompanyId: null,
  isAuthenticated: false,

  // --- Actions ---

  /**
   * Action appelée après une connexion réussie.
   * Met à jour l'état et persiste les informations dans le localStorage.
   */
  login: (user: UserProfile, token: string) => {
    // Si l'utilisateur a des entreprises, on sélectionne la première par défaut.
    const defaultCompanyId = user.companies && user.companies.length > 0 
      ? user.companies[0].id 
      : null;
      
    set({
      user,
      token,
      activeCompanyId: defaultCompanyId,
      isAuthenticated: true,
    });

    // Persistance dans le localStorage
    localStorage.setItem('inventoryai_token', token);
    localStorage.setItem('inventoryai_user', JSON.stringify(user));
    if (defaultCompanyId) {
      localStorage.setItem('inventoryai_active_company_id', defaultCompanyId.toString());
    }
  },

  /**
   * Action pour déconnecter l'utilisateur.
   * Nettoie l'état et le localStorage.
   */
  logout: () => {
    set({
      user: null,
      token: null,
      activeCompanyId: null,
      isAuthenticated: false,
    });

    // Nettoyage du localStorage
    localStorage.removeItem('inventoryai_token');
    localStorage.removeItem('inventoryai_user');
    localStorage.removeItem('inventoryai_active_company_id');
  },

  /**
   * Action pour changer l'entreprise active.
   * Met à jour l'état et le localStorage.
   */
  setActiveCompany: (companyId: number) => {
    // Vérifier si l'utilisateur a bien accès à cette entreprise
    const hasAccess = get().user?.companies.some(c => c.id === companyId);
    if (hasAccess) {
      set({ activeCompanyId: companyId });
      localStorage.setItem('inventoryai_active_company_id', companyId.toString());
    } else {
      console.error("Tentative de sélection d'une entreprise non autorisée.");
    }
  },
  
  /**
   * Action à appeler au démarrage de l'application.
   * Tente de réhydrater l'état d'authentification depuis le localStorage.
   */
  initializeAuth: () => {
    const token = localStorage.getItem('inventoryai_token');
    const userStr = localStorage.getItem('inventoryai_user');
    const activeCompanyIdStr = localStorage.getItem('inventoryai_active_company_id');

    if (token && userStr) {
      try {
        const user: UserProfile = JSON.parse(userStr);
        const activeCompanyId = activeCompanyIdStr ? parseInt(activeCompanyIdStr, 10) : null;
        
        set({
          user,
          token,
          activeCompanyId,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Erreur lors de la réhydratation de l'état d'authentification:", error);
        // En cas d'erreur (ex: JSON invalide), on nettoie tout
        get().logout();
      }
    }
  },
}));

// Appeler initializeAuth une seule fois au chargement de l'application
useAuthStore.getState().initializeAuth();