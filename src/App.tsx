import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout.tsx'
import PredictionDashboard from './pages/PredictionDashboard.tsx'
import PredictionExplanation from './pages/PredictionExplanation.tsx'
import EnterpriseAccountManagement from './components/module1/EnterpriseAccountManagement.tsx'
import UserRoleManagement from './components/module1/UserRoleManagement.tsx'
import ProductCatalog from './components/module1/ProductCatalog.tsx'
import ImportSyncModule from './components/module1/ImportSyncModule.tsx'
import CreateEntreprise from './components/module1/CreateEntreprise.tsx'
import ListEntreprise from './components/module1/ListEntreprise.tsx'
import PredictionModule from './components/common/PredictionModule.tsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PredictionDashboard />} />
          <Route path="/analytics" element={<PredictionExplanation />} />
          <Route path="/prediction" element={<PredictionModule />} />
          <Route path="/account-management" element={<EnterpriseAccountManagement />} />
          <Route path="/user-management" element={<UserRoleManagement />} />
          <Route path="/catalog-management" element={<ProductCatalog />} />
          <Route path="/vente" element={<ImportSyncModule />} />
          <Route path="/entreprise" element={<ListEntreprise />} />
        </Route>
          <Route path="/" element={<CreateEntreprise />} />
      </Routes>
    </Router>
  )
}

export default App
