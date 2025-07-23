// Fichier: src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import PredictionDashboard from './pages/PredictionDashboard';
import PredictionExplanation from './pages/PredictionExplanation';
import EnterpriseAccountManagement from './components/module1/EnterpriseAccountManagement';
import UserRoleManagement from './components/module1/UserRoleManagement';
import ProductCatalog from './components/module1/ProductCatalog';
import ImportSyncModule from './components/module1/ImportSyncModule';
import ListEntreprise from './components/module1/ListEntreprise';
import PredictionModule from './components/common/PredictionModule';
import ProtectedRoute from './components/common/ProtectedRoutes';
import AuthPage from './pages/AuthPage';

// Importer notre nouveau composant

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route publique pour la connexion/inscription */}
        <Route path="/" element={<AuthPage />} />


        {/* Groupe de routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Les routes à l'intérieur du Layout sont maintenant protégées */}
            <Route path="/dashboard" element={<PredictionDashboard />} />
            <Route path="/analytics" element={<PredictionExplanation />} />
            <Route path="/prediction" element={<PredictionModule />} />
            <Route path="/account-management" element={<EnterpriseAccountManagement />} />
            <Route path="/user-management" element={<UserRoleManagement />} />
            <Route path="/catalog-management" element={<ProductCatalog />} />
            <Route path="/vente" element={<ImportSyncModule />} />
            <Route path="/entreprise" element={<ListEntreprise />} />
          </Route>
        </Route>

        {/* Vous pourriez ajouter une route 404 Not Found ici si vous le souhaitez */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;