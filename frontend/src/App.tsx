import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout.tsx'
import PredictionDashboard from './pages/PredictionDashboard.tsx'
import PredictionExplanation from './pages/PredictionExplanation.tsx'
import PredictionModule from './components/common/PredictionModule.tsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PredictionDashboard />} />
          <Route path="/analytics" element={<PredictionExplanation />} />
          <Route path="/prediction" element={<PredictionModule />} />
          <Route path="/prediction" element={<PredictionModule />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
