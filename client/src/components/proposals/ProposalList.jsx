import React, { useEffect, useState } from 'react'
import { Download, Plus } from 'lucide-react'
import ProposalWizard from './ProposalWizard'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ProposalList() {
  const [proposals, setProposals] = useState([])
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    fetch('/api/proposals').then(r => r.json()).then(setProposals)
  }, [showWizard])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Proposals</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowWizard(true)}>
          <Plus size={13} /> New Proposal
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Proposal Number</th>
            <th>Type</th>
            <th>Tier</th>
            <th>Client</th>
            <th>Billing Contact</th>
            <th>Generated</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map(p => (
            <tr key={p.id}>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.proposal_number}</td>
              <td><span className="badge badge-type">{p.proposal_type}</span></td>
              <td>{p.tier || '—'}</td>
              <td>{p.client_name}</td>
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {p.billing_name ? `${p.billing_name}` : '—'}
              </td>
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(p.generated_at)}</td>
              <td>
                {p.docx_filename ? (
                  <a href={`/generated/${p.docx_filename}`} download className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                    <Download size={13} /> DOCX
                  </a>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {proposals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No proposals generated yet.</div>
      )}

      {showWizard && <ProposalWizard onClose={() => setShowWizard(false)} />}
    </div>
  )
}
