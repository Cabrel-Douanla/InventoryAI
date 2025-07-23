// Fichier: src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './styles/global.css'
import { Toaster } from 'react-hot-toast'; // Importer


// 1. Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Options par défaut pour toutes les requêtes
      staleTime: 1000 * 60 * 5, // 5 minutes avant que les données ne soient considérées comme "périmées"
      refetchOnWindowFocus: false, // Désactiver le rafraîchissement automatique au focus de la fenêtre
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Envelopper l'application avec le Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
            <Toaster position="top-right" /> {/* Ajouter le composant Toaster ici */}

      {/* 3. Ajouter les Devtools (uniquement en développement) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)