import React from 'react'
import { Check } from 'lucide-react'

const TIERS = [
  {
    name: 'Essential',
    hours: '20 hours/year',
    hourlyRate: 'INR 28,000/hr',
    darkWeb: 'None',
    bas: 'None',
    asm: 'None',
    ca: 'None',
    reallocate: 'NA',
    carryForward: 'Up to 50% of unused hours',
    billing: '100% advance',
  },
  {
    name: 'Enterprise',
    recommended: true,
    hours: '40 hours/year',
    hourlyRate: 'INR 25,000/hr',
    darkWeb: 'Half yearly / 50 keywords',
    bas: 'Once per year',
    asm: 'None',
    ca: 'One Time (10 Systems)',
    reallocate: 'Yes',
    carryForward: 'Up to 70% of unused hours',
    billing: '100% advance',
  },
  {
    name: 'Elite',
    hours: '120 hours/year',
    hourlyRate: 'INR 20,000/hr',
    darkWeb: 'Monthly / 100 keywords',
    bas: 'Half yearly',
    asm: 'Yes',
    ca: 'Half yearly (10 Systems per assessment)',
    reallocate: 'Yes',
    carryForward: 'Up to 100% of unused hours',
    billing: '100% advance',
  },
]

export default function TierSelector({ selected, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {TIERS.map(tier => (
        <div key={tier.name}
          onClick={() => onChange(tier.name)}
          style={{
            border: `2px solid ${selected === tier.name ? 'var(--accent)' : tier.recommended ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
            borderRadius: 10,
            padding: 16,
            cursor: 'pointer',
            background: selected === tier.name ? 'rgba(59,130,246,0.08)' : 'var(--card)',
            transition: 'all 0.15s',
            position: 'relative',
          }}>
          {tier.recommended && (
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              RECOMMENDED
            </div>
          )}
          {selected === tier.name && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--accent)', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={11} color="white" />
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: selected === tier.name ? 'var(--accent)' : 'var(--text)' }}>{tier.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Hours', tier.hours],
              ['Rate (extra)', tier.hourlyRate],
              ['Support', '24/7/365'],
              ['IR on Demand', 'Yes'],
              ['Dark Web', tier.darkWeb],
              ['BAS', tier.bas],
              ['ASM', tier.asm],
              ['CA', tier.ca],
              ['Reallocate', tier.reallocate],
              ['Carry Forward', tier.carryForward],
              ['Billing', tier.billing],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <span style={{ fontSize: 12, color: val === 'None' ? 'var(--text-muted)' : 'var(--text)', marginTop: 1 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
