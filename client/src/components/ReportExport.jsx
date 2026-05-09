import React, { useState } from 'react'
import { Download } from 'lucide-react'

const ALL_COLS = [
  { key: 'date_modified', label: 'Date Modified' },
  { key: 'client_name', label: 'Client Name' },
  { key: 'presales_update', label: 'Pre-Sales Update' },
  { key: 'account_manager', label: 'Account Manager' },
  { key: 'engagement_type', label: 'Engagement Type' },
  { key: 'proposal_shared', label: 'Proposal Shared' },
  { key: 'acv_cr', label: 'ACV (Cr)' },
  { key: 'stage', label: 'Stage' },
  { key: 'client_side_updates', label: 'Client Side Updates' },
  { key: 'date_updated', label: 'Date Updated' },
]

const STAGES = ['Hot', 'Warm', 'Cold', 'Won', 'Lost']
const TYPES = ['IFI', 'Retainer', 'CA', 'BAS', 'PFI', 'ATM', 'Deep and Dark Web', 'Other']

export default function ReportExport() {
  const [format, setFormat] = useState('excel')
  const [stages, setStages] = useState([])
  const [types, setTypes] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [cols, setCols] = useState(ALL_COLS.map(c => c.key))
  const [exporting, setExporting] = useState(false)

  function toggleStage(s) { setStages(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]) }
  function toggleType(t) { setTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]) }
  function toggleCol(k) { setCols(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]) }

  async function exportReport() {
    setExporting(true)
    const res = await fetch('/api/reports/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, stage: stages, type: types, dateFrom, dateTo, columns: cols }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = format === 'csv' ? 'opportunities.csv' : 'presales-report.xlsx'
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Export Report</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Format</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['excel', 'csv'].map(f => (
              <button key={f} className={`btn ${format === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFormat(f)} style={{ textTransform: 'capitalize' }}>
                {f === 'excel' ? 'Excel (.xlsx)' : 'CSV'}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Date Range</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Filter by Stage</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STAGES.map(s => (
              <button key={s} className={`btn btn-sm ${stages.includes(s) ? `badge-${s.toLowerCase()}` : 'btn-ghost'}`}
                style={{ border: '1px solid var(--border)' }} onClick={() => toggleStage(s)}>
                {s}
              </button>
            ))}
          </div>
          {stages.length > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{stages.length} selected (leave empty for all)</div>}
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Filter by Type</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button key={t} className={`btn btn-sm ${types.includes(t) ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => toggleType(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Columns</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_COLS.map(c => (
              <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '4px 10px', background: cols.includes(c.key) ? 'rgba(59,130,246,0.1)' : '#1a1a1a', border: `1px solid ${cols.includes(c.key) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6 }}>
                <input type="checkbox" checked={cols.includes(c.key)} onChange={() => toggleCol(c.key)} />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={exportReport} disabled={exporting}>
          <Download size={14} />{exporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>
    </div>
  )
}
