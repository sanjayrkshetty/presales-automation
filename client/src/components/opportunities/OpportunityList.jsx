import React, { useEffect, useState, useRef } from 'react'
import { Plus, Upload, Columns, ChevronDown, Wand2, X, Check } from 'lucide-react'
import OpportunityDetail from './OpportunityDetail'
import OpportunityForm from './OpportunityForm'

const STAGES = ['Hot', 'Warm', 'Cold', 'Won', 'Lost']
const TYPES = ['IFI', 'Retainer', 'CA', 'BAS', 'PFI', 'ATM', 'Deep and Dark Web', 'Other']

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

function getVisibleCols() {
  try {
    const saved = localStorage.getItem('opp_cols')
    if (saved) return JSON.parse(saved)
  } catch {}
  return ALL_COLS.map(c => c.key)
}

function StageBadge({ stage }) {
  return <span className={`badge badge-${stage?.toLowerCase()}`}>{stage}</span>
}

function TypeBadge({ type }) {
  return <span className="badge badge-type">{type}</span>
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB')
}

export default function OpportunityList() {
  const [opps, setOpps] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showColMenu, setShowColMenu] = useState(false)
  const [visibleCols, setVisibleCols] = useState(getVisibleCols)
  const [selectedIds, setSelectedIds] = useState([])
  const [filters, setFilters] = useState({ stage: [], type: [], am: '', q: '', proposal_shared: 'all' })
  const [sortKey, setSortKey] = useState('date_modified')
  const [sortDir, setSortDir] = useState('desc')
  const [gamNames, setGamNames] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [chaseLoading, setChaseLoading] = useState(false)
  const [chaseResults, setChaseResults] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    loadOpps()
    fetch('/api/gam').then(r => r.json()).then(g => setGamNames(g.map(x => x.name)))
  }, [])

  async function loadOpps() {
    const params = new URLSearchParams()
    if (filters.stage.length) params.set('stage', filters.stage.join(','))
    if (filters.type.length) params.set('type', filters.type.join(','))
    if (filters.am) params.set('am', filters.am)
    if (filters.q) params.set('q', filters.q)
    if (filters.proposal_shared !== 'all') params.set('proposal_shared', filters.proposal_shared)
    const data = await fetch(`/api/opportunities?${params}`).then(r => r.json())
    setOpps(data)
  }

  useEffect(() => { loadOpps() }, [filters])

  function toggleCol(key) {
    setVisibleCols(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      localStorage.setItem('opp_cols', JSON.stringify(next))
      return next
    })
  }

  async function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    await fetch('/api/opportunities/import', { method: 'POST', body: fd })
    loadOpps()
    e.target.value = ''
  }

  async function bulkStage(stage) {
    if (!selectedIds.length) return
    await fetch('/api/opportunities/bulk-stage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds, stage }),
    })
    setSelectedIds([])
    loadOpps()
  }

  async function bulkProposalShared() {
    if (!selectedIds.length) return
    await fetch('/api/opportunities/bulk-proposal-shared', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    })
    setSelectedIds([])
    loadOpps()
  }

  async function chaseAll() {
    setChaseLoading(true)
    const results = await fetch('/api/ai/chase-stale', { method: 'POST' }).then(r => r.json())
    setChaseResults(results)
    setChaseLoading(false)
  }

  async function commitEdit(opp, key) {
    let val = editVal
    if (key === 'acv_cr') val = parseFloat(val) || 0
    if (key === 'proposal_shared') val = val === 'Yes'
    await fetch(`/api/opportunities/${opp.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: val }),
    })
    setEditingCell(null)
    loadOpps()
  }

  function sortedOpps() {
    return [...opps].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function renderCell(opp, key) {
    const isEditing = editingCell?.id === opp.id && editingCell?.key === key
    const INLINE_EDITABLE = ['presales_update', 'client_side_updates', 'account_manager', 'acv_cr']
    const TOGGLE_EDITABLE = ['proposal_shared']
    const SELECT_EDITABLE = ['stage', 'engagement_type']

    if (key === 'date_modified' || key === 'date_updated') return formatDate(opp[key])
    if (key === 'stage') {
      if (isEditing) return (
        <select value={editVal} onChange={e => setEditVal(e.target.value)}
          onBlur={() => commitEdit(opp, key)} autoFocus style={{ width: 100 }}>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
      )
      return <div style={{ cursor: 'pointer' }} onClick={() => { setEditingCell({ id: opp.id, key }); setEditVal(opp[key]) }}>
        <StageBadge stage={opp[key]} />
      </div>
    }
    if (key === 'engagement_type') {
      if (isEditing) return (
        <select value={editVal} onChange={e => setEditVal(e.target.value)}
          onBlur={() => commitEdit(opp, key)} autoFocus style={{ width: 120 }}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      )
      return <div style={{ cursor: 'pointer' }} onClick={() => { setEditingCell({ id: opp.id, key }); setEditVal(opp[key]) }}>
        {opp[key] ? <TypeBadge type={opp[key]} /> : '—'}
      </div>
    }
    if (key === 'proposal_shared') return (
      <button className={`btn btn-sm ${opp[key] ? 'btn-success' : 'btn-ghost'}`}
        onClick={async () => {
          await fetch(`/api/opportunities/${opp.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proposal_shared: !opp[key] }),
          })
          loadOpps()
        }}>
        {opp[key] ? 'Yes' : 'No'}
      </button>
    )
    if (key === 'acv_cr') {
      if (isEditing) return (
        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
          onBlur={() => commitEdit(opp, key)} onKeyDown={e => e.key === 'Enter' && commitEdit(opp, key)}
          autoFocus style={{ width: 80 }} />
      )
      return <div style={{ cursor: 'text' }} onClick={() => { setEditingCell({ id: opp.id, key }); setEditVal(opp[key] || '') }}>
        {opp[key] ? `₹${opp[key]}` : '₹0'}
      </div>
    }
    if (key === 'client_name') return (
      <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
        onClick={() => setSelected(opp)}>
        {opp[key]}
      </span>
    )
    if (INLINE_EDITABLE.includes(key)) {
      if (isEditing) return (
        <textarea value={editVal} onChange={e => setEditVal(e.target.value)} rows={2} style={{ width: '100%' }}
          onBlur={() => commitEdit(opp, key)} />
      )
      return <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text', color: opp[key] ? 'var(--text)' : 'var(--text-muted)' }}
        onClick={() => { setEditingCell({ id: opp.id, key }); setEditVal(opp[key] || '') }}
        title={opp[key]}>
        {opp[key] || 'Click to edit'}
      </div>
    }
    return opp[key] ?? '—'
  }

  const cols = ALL_COLS.filter(c => visibleCols.includes(c.key))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Opportunities</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <>
              <select className="btn btn-ghost btn-sm" style={{ height: 32 }}
                onChange={e => { if (e.target.value) { bulkStage(e.target.value); e.target.value = '' } }}>
                <option value="">Bulk Stage →</option>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="btn btn-success btn-sm" onClick={bulkProposalShared}>Mark Proposal Shared</button>
            </>
          )}
          <button className="btn btn-ghost btn-sm" onClick={chaseAll} disabled={chaseLoading}>
            <Wand2 size={13} />{chaseLoading ? 'Generating...' : 'Chase All Stale'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
            <Upload size={13} />Import Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowColMenu(p => !p)}>
              <Columns size={13} />Columns <ChevronDown size={12} />
            </button>
            {showColMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: 8, padding: 8, zIndex: 20, minWidth: 180,
              }}>
                {ALL_COLS.map(c => (
                  <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={visibleCols.includes(c.key)} onChange={() => toggleCol(c.key)} />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={13} />New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Search client..." value={filters.q} onChange={e => setFilters(p => ({ ...p, q: e.target.value }))} style={{ width: 180 }} />
        <select value={filters.am} onChange={e => setFilters(p => ({ ...p, am: e.target.value }))} style={{ width: 180 }}>
          <option value="">All AMs</option>
          {gamNames.map(n => <option key={n}>{n}</option>)}
        </select>
        <select value={filters.proposal_shared} onChange={e => setFilters(p => ({ ...p, proposal_shared: e.target.value }))}>
          <option value="all">All (Proposal)</option>
          <option value="yes">Proposal: Yes</option>
          <option value="no">Proposal: No</option>
        </select>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {STAGES.map(s => (
            <button key={s} className={`btn btn-sm ${filters.stage.includes(s) ? `badge-${s.toLowerCase()}` : 'btn-ghost'}`}
              style={{ border: '1px solid var(--border)' }}
              onClick={() => setFilters(p => ({ ...p, stage: p.stage.includes(s) ? p.stage.filter(x => x !== s) : [...p.stage, s] }))}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t} className={`btn btn-sm ${filters.type.includes(t) ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilters(p => ({ ...p, type: p.type.includes(t) ? p.type.filter(x => x !== t) : [...p.type, t] }))}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input type="checkbox"
                  checked={selectedIds.length === opps.length && opps.length > 0}
                  onChange={e => setSelectedIds(e.target.checked ? opps.map(o => o.id) : [])} />
              </th>
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOpps().map(opp => (
              <tr key={opp.id}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(opp.id)}
                    onChange={e => setSelectedIds(p => e.target.checked ? [...p, opp.id] : p.filter(x => x !== opp.id))} />
                </td>
                {cols.map(c => (
                  <td key={c.key}>{renderCell(opp, c.key)}</td>
                ))}
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    fetch(`/api/opportunities/${opp.id}`, { method: 'DELETE' }).then(() => loadOpps())
                  }} style={{ color: 'var(--danger)' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {opps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No opportunities found.</div>
        )}
      </div>

      {selected && (
        <OpportunityDetail
          opp={selected}
          onClose={() => setSelected(null)}
          onUpdate={updated => {
            setOpps(prev => prev.map(o => o.id === updated.id ? updated : o))
            setSelected(updated)
          }}
        />
      )}

      {showForm && (
        <OpportunityForm
          gamNames={gamNames}
          onClose={() => setShowForm(false)}
          onCreated={created => { setOpps(prev => [created, ...prev]); setShowForm(false) }}
        />
      )}

      {chaseResults && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Stale Chase Messages ({chaseResults.length})</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setChaseResults(null)}><X size={14} /></button>
            </div>
            {chaseResults.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No stale opportunities found.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {chaseResults.map((r, i) => (
                <div key={i} style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.opportunity.client_name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.days}d stale · <StageBadge stage={r.opportunity.stage} /></span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 8 }}>{r.message}</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(r.message)}>Copy</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
