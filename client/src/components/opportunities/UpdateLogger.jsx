import React, { useEffect, useState } from 'react'
import { Send } from 'lucide-react'

export default function UpdateLogger({ opportunityId }) {
  const [updates, setUpdates] = useState([])
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!opportunityId) return
    fetch(`/api/opportunities/${opportunityId}/updates`).then(r => r.json()).then(setUpdates)
  }, [opportunityId])

  async function save() {
    if (!text.trim()) return
    setSaving(true)
    await fetch(`/api/opportunities/${opportunityId}/updates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ update_text: text }),
    })
    const fresh = await fetch(`/api/opportunities/${opportunityId}/updates`).then(r => r.json())
    setUpdates(fresh)
    setText('')
    setSaving(false)
  }

  function formatTime(str) {
    return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Log an update..."
          rows={2}
          style={{ flex: 1, resize: 'vertical' }}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) save() }}
        />
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ alignSelf: 'flex-end' }}>
          <Send size={14} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {updates.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
            No updates logged yet.
          </div>
        )}
        {updates.map(u => (
          <div key={u.id} style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{formatTime(u.logged_at)}</div>
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{u.update_text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
