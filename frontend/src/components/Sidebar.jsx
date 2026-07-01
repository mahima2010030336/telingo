import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: '⌂' },
  { label: 'Popular', path: '/?sort=popular', icon: '↗' },
  { label: 'New Additions', path: '/?sort=new', icon: '✦' },
  { label: 'Pending Words', path: '/?pending=true', icon: '⏳' },
]

export default function Sidebar({ activeLetter, onLetterClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'var(--bg-panel)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: 'fit-content',
      position: 'sticky',
      top: 20,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }}
      >
        <div style={{
          width: 36, height: 36, background: 'var(--orange)',
          borderRadius: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff'
        }}>తె</div>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Lingo</span>
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_LINKS.map(({ label, path, icon }) => {
          const isActive = location.pathname + location.search === path
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                background: isActive ? 'var(--orange-muted)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--orange)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
              {label}
            </button>
          )
        })}
      </nav>

      {/* Add New Word */}
      <button
        className="btn"
        onClick={() => user ? navigate('/add-word') : navigate('/login')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--orange)',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          fontSize: 14,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
        Add New Word
      </button>

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Alphabet search */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
          <span>🔍</span> Search By Letters
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {LETTERS.map(l => (
            <button
              key={l}
              onClick={() => onLetterClick(activeLetter === l ? null : l)}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: `1.5px solid ${activeLetter === l ? 'var(--orange)' : 'var(--border)'}`,
                background: activeLetter === l ? 'var(--orange)' : 'transparent',
                color: activeLetter === l ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => { if (activeLetter !== l) { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' } }}
              onMouseLeave={e => { if (activeLetter !== l) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
