// Fichier: src/components/common/ProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Brain } from 'lucide-react';

interface ProtectedRouteProps {
  // Vous pouvez ajouter des props ici si vous avez besoin de vérifier des rôles spécifiques plus tard
  // Par exemple: requiredRole?: 'admin' | 'member';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  // Utilise le store pour obtenir l'état d'authentification.
  // Le `useAuthStore` est un hook, donc le composant se mettra à jour
  // automatiquement si l'état `isAuthenticated` change (login/logout).
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Le store a déjà tenté de se réhydrater depuis le localStorage.
  // Cependant, on peut ajouter une micro-vérification de "chargement initial"
  // pour éviter un flash de la page de login.
  // Pour cela, nous devons savoir si la tentative d'initialisation a eu lieu.
  // Modifions légèrement le store pour cela.

  // Pour l'instant, la logique simple est suffisante :
  if (!isAuthenticated) {
    // Si l'utilisateur n'est pas authentifié, le rediriger vers la page racine
    // qui contient notre formulaire de connexion/inscription.
    // L'option `replace` empêche l'utilisateur de revenir à la page protégée
    // avec le bouton "précédent" du navigateur.
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est authentifié, on affiche le contenu de la route protégée.
  // <Outlet /> est un composant de react-router-dom qui rend le composant enfant
  // correspondant à la route actuelle. Dans notre cas, ce sera <Layout />.
  return <Outlet />;
};

export default ProtectedRoute; 