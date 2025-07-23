// Fichier: src/api.ts
import axios from 'axios';
import { useAuthStore } from './stores/authStore'; // Importer le store

const api = axios.create({
  baseURL: "http://localhost:8000",
  // withCredentials n'est pas nécessaire pour l'authentification par token Bearer
});

// L'intercepteur utilise maintenant le store pour obtenir les informations dynamiques
api.interceptors.request.use((config) => {
  // Obtenir l'état actuel du store
  const { token, activeCompanyId } = useAuthStore.getState();

  // Ajouter le token d'authentification s'il existe
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Ajouter l'ID de l'entreprise active s'il existe
  if (activeCompanyId) {
    config.headers['X-Company-ID'] = activeCompanyId;
  }
  
  return config;
});


// Intercepteur de réponse pour gérer la déconnexion en cas de token invalide (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Si le token est invalide ou expiré, déconnecter l'utilisateur
      console.log("Token invalide ou expiré, déconnexion...");
      useAuthStore.getState().logout();
      // Rediriger vers la page de connexion
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);


export default api;