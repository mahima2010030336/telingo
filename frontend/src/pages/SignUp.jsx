import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api.js'
import { useAuth, useToast } from '../App.jsx'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const showToast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { showToast('Please fill all fields', 'error'); return }
    if (form.password !== form.confirm) { showToast('Passwords do not match', 'error'); return }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
    if (!agreed) { showToast('Please accept the terms & conditions', 'error'); return }

    setLoading(true)
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password })
      login(res.data.user, res.data.access_token)
      showToast('Account created! Welcome to eLingo!', 'success')
      navigate('/')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-root)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ position: 'absolute', top: 16, left: 20, color: 'var(--text-muted)', fontSize: 13 }}>Sign Up</div>

      <div style={{
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-lg)',
        padding: 36,
        width: '100%',
        maxWidth: 460,
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <h1 style={{ color: 'var(--orange)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Create an Account
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Hey! Select method to create an account:
        </p>

        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>G</span> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Or continue with username/email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>👤</span>
            <input placeholder="Enter your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>✉</span>
            <input type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔒</span>
            <input type="password" placeholder="Create password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔒</span>
            <input type="password" placeholder="Confirm password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ paddingLeft: 40 }} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--orange)' }} />
          I accept all{' '}
          <span style={{ color: 'var(--orange)' }}>terms &amp; conditions</span>
        </label>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register Now'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 600 }}>Login now</Link>
        </p>
      </div>
    </div>
  )
}
