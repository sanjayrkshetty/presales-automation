import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const STAGE_COLORS = {
  Hot: '#ef4444', Warm: '#f59e0b', Cold: '#3b82f6', Won: '#22c55e', Lost: '#6b7280'
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [opps, setOpps] = useState([])

  useEffect(() => {
    fetch('/api/opportunities').then(r => r.json()).then(setOpps)
  }, [])

  const total = opps.length
  const totalAcv = opps.reduce((s, o) => s + (o.acv_cr || 0), 0)
  const hotAcv = opps.filter(o => o.stage === 'Hot').reduce((s, o) => s + (o.acv_cr || 0), 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const wonMonth = opps.filter(o => o.stage === 'Won' && o.date_modified?.startsWith(thisMonth)).length

  const byType = Object.entries(
    opps.reduce((acc, o) => {
      if (o.engagement_type) acc[o.engagement_type] = (acc[o.engagement_type] || 0) + (o.acv_cr || 0)
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))

  const byStage = Object.entries(
    opps.reduce((acc, o) => {
      acc[o.stage] = (acc[o.stage] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const stale = opps.filter(o => {
    if (['Won', 'Lost'].includes(o.stage)) return false
    const days = Math.floor((Date.now() - new Date(o.date_updated || o.created_at).getTime()) / 86400000)
    return (o.stage === 'Hot' && days >= 7) || (o.stage === 'Warm' && days >= 14) || (o.stage === 'Cold' && days >= 21)
  })

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Dashboard</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Total Opportunities" value={total} />
        <MetricCard label="Total Pipeline ACV" value={`₹${totalAcv.toFixed(2)} Cr`} />
        <MetricCard label="Hot Pipeline ACV" value={`₹${hotAcv.toFixed(2)} Cr`} />
        <MetricCard label="Won This Month" value={wonMonth} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>ACV by Engagement Type (₹ Cr)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byType} layout="vertical">
              <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#888', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Stage Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {byStage.map((entry, i) => (
                  <Cell key={i} fill={STAGE_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stale.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--warning)' }}>
            Stale Opportunities ({stale.length})
          </div>
          <table>
            <thead>
              <tr>
                <th>Client</th><th>Stage</th><th>Type</th><th>Account Manager</th><th>Days Stale</th>
              </tr>
            </thead>
            <tbody>
              {stale.map(o => {
                const days = Math.floor((Date.now() - new Date(o.date_updated || o.created_at).getTime()) / 86400000)
                return (
                  <tr key={o.id}>
                    <td>{o.client_name}</td>
                    <td><span className={`badge badge-${o.stage.toLowerCase()}`}>{o.stage}</span></td>
                    <td>{o.engagement_type}</td>
                    <td>{o.account_manager}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{days}d</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
