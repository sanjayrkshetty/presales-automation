import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import OpportunityList from './components/opportunities/OpportunityList'
import ProposalList from './components/proposals/ProposalList'
import GAMManager from './components/gam/GAMManager'
import ReportExport from './components/ReportExport'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/opportunities" element={<OpportunityList />} />
            <Route path="/proposals" element={<ProposalList />} />
            <Route path="/gam" element={<GAMManager />} />
            <Route path="/reports" element={<ReportExport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
