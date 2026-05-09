import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Lightbulb, FileText, Users, Download } from 'lucide-react'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/opportunities', icon: Lightbulb, label: 'Opportunities' },
  { to: '/proposals', icon: FileText, label: 'Proposals' },
  { to: '/gam', icon: Users, label: 'GAM Contacts' },
  { to: '/reports', icon: Download, label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 220,
      background: '#0d0d0d',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      flexShrink: 0,
    }}>
      <div style={{ padding: '8px 14px 20px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Pre-Sales Hub</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>SISA DFIR</div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
