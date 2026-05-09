import React, { useState, useEffect } from 'react'
import { X, Wand2, Download, Save, ChevronRight, ChevronLeft } from 'lucide-react'
import TierSelector from './TierSelector'

const PROPOSAL_TYPES = ['IFI', 'Retainer', 'BAS', 'CA', 'PFI', 'ATM', 'Deep and Dark Web', 'Other']

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ProposalWizard({ opportunity, onClose }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState(opportunity?.engagement_type || 'IFI')
  const [tier, setTier] = useState('Enterprise')
  const [form, setForm] = useState({
    client_name: opportunity?.client_name || '',
    executive_summary: '',
    incident_description: opportunity?.client_side_updates || '',
    billing_contact_id: '',
    proposal_date: new Date().toISOString().slice(0, 10),
  })
  const [gams, setGams] = useState([])
  const [propNum, setPropNum] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/gam').then(r => r.json()).then(setGams)
    previewNumber()
  }, [type])

  async function previewNumber() {
    const typeMap = { IFI: 'IFI', Retainer: 'RET', BAS: 'BAS', CA: 'CA', PFI: 'PFI', ATM: 'ATM' }
    const code = typeMap[type] || 'GEN'
    const year = new Date().getFullYear()
    setPropNum(`SISA/DFIR/${code}/${year}/XXX`)
  }

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  async function generateSummary() {
    setAiLoading(true)
    const res = await fetch('/api/ai/executive-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engagement_type: type,
        tier: type === 'Retainer' ? tier : '',
        context: form.incident_description || form.executive_summary,
      }),
    })
    const data = await res.json()
    set('executive_summary', data.summary || (data.error ? `[AI Error: ${data.error}]` : ''))
    setAiLoading(false)
  }

  async function generate() {
    setGenerating(true)
    const res = await fetch('/api/proposals/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunity_id: opportunity?.id,
        proposal_type: type,
        tier: type === 'Retainer' ? tier : '',
        client_name: form.client_name,
        executive_summary: form.executive_summary,
        incident_description: form.incident_description,
        billing_contact_id: form.billing_contact_id || null,
      }),
    })
    const data = await res.json()
    setResult(data)
    setPropNum(data.proposal_number)
    setGenerating(false)
  }

  const billingGam = gams.find(g => g.id === parseInt(form.billing_contact_id))

  const steps = type === 'Retainer' ? 4 : 3

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Generate Proposal</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Step {step} of {type === 'Retainer' ? 4 : 3}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {(type === 'Retainer' ? ['Type', 'Tier', 'Details', 'Preview'] : ['Type', 'Details', 'Preview']).map((label, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < step - 1 ? 'var(--accent)' : i === step - 1 ? 'var(--accent)' : 'var(--border)',
              opacity: i < step ? 1 : 0.4,
            }} />
          ))}
        </div>

        {/* Step 1: Type */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Select Proposal Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PROPOSAL_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`btn ${type === t ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'center', padding: '10px 0' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2a: Tier (Retainer only) */}
        {step === 2 && type === 'Retainer' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Select Retainer Tier</div>
            <TierSelector selected={tier} onChange={setTier} />
          </div>
        )}

        {/* Step 2 (non-Retainer) or Step 3 (Retainer): Details */}
        {((step === 2 && type !== 'Retainer') || (step === 3 && type === 'Retainer')) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Proposal Details</div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Client Name *</label>
              <input value={form.client_name} onChange={e => set('client_name', e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Executive Summary *</label>
                <button className="btn btn-ghost btn-sm" onClick={generateSummary} disabled={aiLoading}>
                  <Wand2 size={12} />{aiLoading ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <textarea value={form.executive_summary} onChange={e => set('executive_summary', e.target.value)} rows={4} style={{ width: '100%' }} placeholder="Enter or AI-generate the executive summary..." />
            </div>

            {['IFI', 'CA', 'PFI'].includes(type) && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Incident Description</label>
                <textarea value={form.incident_description} onChange={e => set('incident_description', e.target.value)} rows={4} style={{ width: '100%' }} placeholder="Describe the incident..." />
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Billing Contact *</label>
              <select value={form.billing_contact_id} onChange={e => set('billing_contact_id', e.target.value)} style={{ width: '100%' }}>
                <option value="">Select billing contact...</option>
                {gams.map(g => (
                  <option key={g.id} value={g.id}>{g.name} | {g.designation} | {g.email}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Proposal Date</label>
                <input type="date" value={form.proposal_date} onChange={e => set('proposal_date', e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Proposal Number</label>
                <input value={propNum} readOnly style={{ width: '100%', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        )}

        {/* Preview step */}
        {((step === 3 && type !== 'Retainer') || (step === 4 && type === 'Retainer')) && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Preview & Download</div>
            {!result ? (
              <div style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Proposal Number', propNum],
                    ['Date', formatDate(new Date(form.proposal_date))],
                    ['Client Name', form.client_name],
                    ['Type / Tier', type === 'Retainer' ? `${type} – ${tier}` : type],
                    ['Billing Contact', billingGam ? `${billingGam.name} | ${billingGam.email}` : '—'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>
                {form.executive_summary && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Executive Summary</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                      {form.executive_summary.slice(0, 200)}{form.executive_summary.length > 200 ? '...' : ''}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 8 }}>Document Generated Successfully</div>
                <div style={{ fontSize: 13 }}>Proposal No: <strong>{result.proposal_number}</strong></div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              {!result ? (
                <button className="btn btn-primary" onClick={generate} disabled={generating || !form.client_name}>
                  <Download size={14} />{generating ? 'Generating...' : 'Generate & Download DOCX'}
                </button>
              ) : (
                <a href={result.download_url} download className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  <Download size={14} /> Download DOCX
                </a>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
            <ChevronLeft size={14} />{step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < (type === 'Retainer' ? 4 : 3) && (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight size={14} />
            </button>
          )}
          {((step === 3 && type !== 'Retainer') || (step === 4 && type === 'Retainer')) && result && (
            <button className="btn btn-ghost" onClick={onClose}>Done</button>
          )}
        </div>
      </div>
    </div>
  )
}
