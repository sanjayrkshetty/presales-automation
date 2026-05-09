import React, { useState } from 'react'
import { X, Wand2, FileText } from 'lucide-react'
import UpdateLogger from './UpdateLogger'
import ProposalWizard from '../proposals/ProposalWizard'

const STAGES = ['Hot', 'Warm', 'Cold', 'Won', 'Lost']
const TYPES = ['IFI', 'Retainer', 'CA', 'BAS', 'PFI', 'ATM', 'Deep and Dark Web', 'Other']

export default function OpportunityDetail({ opp, onClose, onUpdate }) {
  const [tab, setTab] = useState('detail')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...opp })
  const [aiMsg, setAiMsg] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  async function save() {
    const res = await fetch(`/api/opportunities/${opp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const updated = await res.json()
    onUpdate(updated)
    setEditing(false)
  }

  async function generateFollowup() {
    setGenLoading(true)
    const days = Math.floor((Date.now() - new Date(opp.date_updated || opp.created_at).getTime()) / 86400000)
    const res = await fetch('/api/ai/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engagement_type: opp.engagement_type,
        stage: opp.stage,
        days_since_update: days,
        client_side_updates: opp.client_side_updates,
      }),
    })
    const data = await res.json()
    setAiMsg(data.message || data.error || 'No message returned.')
    setGenLoading(false)
  }

  const f = (key) => (
    editing
      ? key === 'stage'
        ? <select value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        : key === 'engagement_type'
        ? <select value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        : key === 'presales_update' || key === 'client_side_updates'
        ? <textarea value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={3} style={{ width: '100%' }} />
        : <input value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }} />
      : <span style={{ color: 'var(--text)' }}>{opp[key] || '—'}</span>
  )

  if (showWizard) {
    return <ProposalWizard opportunity={opp} onClose={() => setShowWizard(false)} />
  }

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 480,
      background: 'var(--card)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{opp.client_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{opp.engagement_type} · {opp.stage}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowWizard(true)}>
            <FileText size={13} /> Generate Proposal
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {['detail', 'updates'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px', background: 'none', border: 'none',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
          }}>
            {t === 'detail' ? 'Details' : 'Updates'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {tab === 'detail' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
              {editing ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm({ ...opp }) }}>Cancel</button>
                </>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Client Name', 'client_name'],
                ['Account Manager', 'account_manager'],
                ['Engagement Type', 'engagement_type'],
                ['Stage', 'stage'],
                ['ACV (Cr)', 'acv_cr'],
                ['Pre-Sales Update', 'presales_update'],
                ['Client Side Updates', 'client_side_updates'],
              ].map(([label, key]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  {f(key)}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>AI Follow-up Message</div>
              <button className="btn btn-ghost btn-sm" onClick={generateFollowup} disabled={genLoading} style={{ marginBottom: 10 }}>
                <Wand2 size={13} />
                {genLoading ? 'Generating...' : 'Suggest Follow-up'}
              </button>
              {aiMsg && (
                <div style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {aiMsg}
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(aiMsg)}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'updates' && <UpdateLogger opportunityId={opp.id} />}
      </div>
    </div>
  )
}
