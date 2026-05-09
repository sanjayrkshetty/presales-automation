import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Check, Upload } from 'lucide-react'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB')
}

export default function GAMManager() {
  const [gams, setGams] = useState([])
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', designation: '', email: '', phone: '', region: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const data = await fetch('/api/gam').then(r => r.json())
    setGams(data)
  }

  async function save(id) {
    await fetch(`/api/gam/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditing(null)
    load()
  }

  async function add() {
    if (!newForm.name) return
    await fetch('/api/gam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    setAdding(false)
    setNewForm({ name: '', designation: '', email: '', phone: '', region: '' })
    load()
  }

  async function del(id) {
    await fetch(`/api/gam/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    load()
  }

  async function bulkImport() {
    if (!importText.trim()) return
    setImporting(true)
    await fetch('/api/gam/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: importText }),
    })
    setImporting(false)
    setShowImport(false)
    setImportText('')
    load()
  }

  const COLS = ['name', 'designation', 'email', 'phone', 'region']

  function editCell(gam, key) {
    if (editing === gam.id) {
      return <input value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }} />
    }
    return gam[key] || '—'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>GAM Contacts</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(true)}>
            <Upload size={13} /> Import from Text
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={13} /> Add Contact
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Designation</th><th>Email</th><th>Phone</th><th>Region</th><th>Updated</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {adding && (
            <tr style={{ background: 'rgba(59,130,246,0.05)' }}>
              {COLS.map(k => (
                <td key={k}>
                  <input value={newForm[k]} onChange={e => setNewForm(p => ({ ...p, [k]: e.target.value }))} style={{ width: '100%' }} placeholder={k} />
                </td>
              ))}
              <td>—</td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={add}><Check size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}><X size={13} /></button>
                </div>
              </td>
            </tr>
          )}
          {gams.map(g => (
            <tr key={g.id}>
              {COLS.map(k => <td key={k}>{editCell(g, k)}</td>)}
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(g.updated_at)}</td>
              <td>
                {editing === g.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-success btn-sm" onClick={() => save(g.id)}><Check size={13} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={13} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(g.id); setEditForm({ ...g }) }}><Edit2 size={13} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(g.id)}><Trash2 size={13} /></button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {gams.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No contacts yet.</div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Delete Contact?</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              This will remove {gams.find(g => g.id === deleteId)?.name} from the GAM table. Existing proposals will not be affected.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => del(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700 }}>Bulk Import Contacts</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(false)}><X size={14} /></button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              One contact per line. Format: Name, Designation, Email, Phone, Region (comma or tab-separated).<br />
              Existing contacts matched by name will be updated.
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={8} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
              placeholder="John Smith, Account Manager, john@co.com, +91 98765, India" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button className="btn btn-ghost" onClick={() => setShowImport(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={bulkImport} disabled={importing || !importText.trim()}>
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
