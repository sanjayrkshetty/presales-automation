import React, { useState } from 'react'
import { X } from 'lucide-react'

const STAGES = ['Cold', 'Warm', 'Hot', 'Won', 'Lost']
const TYPES = ['IFI', 'Retainer', 'CA', 'BAS', 'PFI', 'ATM', 'Deep and Dark Web', 'Other', 'Custom']

export default function OpportunityForm({ onClose, onCreated, gamNames = [] }) {
  const [form, setForm] = useState({
    client_name: '', account_manager: '', engagement_type: 'IFI',
    stage: 'Cold', acv_cr: '', proposal_shared: false,
    presales_update: '', client_side_updates: '',
  })
  const [saving, setSaving] = useState(false)

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, acv_cr: parseFloat(form.acv_cr) || 0 }),
    })
    const created = await res.json()
    onCreated(created)
    setSaving(false)
    onClose()
  }

  const field = (label, key, type = 'text', opts) => (
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {type === 'select'
        ? <select value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: '100%' }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        : type === 'textarea'
        ? <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={3} style={{ width: '100%' }} />
        : type === 'datalist'
        ? <>
            <input list={`dl-${key}`} value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: '100%' }} />
            <datalist id={`dl-${key}`}>{opts.map(o => <option key={o} value={o} />)}</datalist>
          </>
        : <input type={type} value={form[key]} onChange={e => set(key, type === 'checkbox' ? e.target.checked : e.target.value)} style={{ width: '100%' }} />
      }
    </div>
  )

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>New Opportunity</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('Client Name *', 'client_name')}
          {field('Account Manager', 'account_manager', 'datalist', gamNames)}
          {field('Engagement Type', 'engagement_type', 'select', TYPES)}
          {field('Stage', 'stage', 'select', STAGES)}
          {field('ACV (₹ Cr)', 'acv_cr', 'number')}
          {field('Pre-Sales Update', 'presales_update', 'textarea')}
          {field('Client Side Updates', 'client_side_updates', 'textarea')}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="ps" checked={form.proposal_shared} onChange={e => set('proposal_shared', e.target.checked)} />
            <label htmlFor="ps" style={{ fontSize: 13 }}>Proposal Shared</label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.client_name}>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
