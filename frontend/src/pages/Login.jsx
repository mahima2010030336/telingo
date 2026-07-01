import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api.js'
import { useAuth, useToast } from '../App.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const showToast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = async () => {
    if (!form.email || !form.password) { showToast('Please fill all fields', 'error'); return }
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password })
      login(res.data.user, res.data.access_token)
      showToast('Welcome back!', 'success')
      navigate('/')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Login failed', 'error')
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
      <div style={{ marginBottom: 8, position: 'absolute', top: 16, left: 20, color: 'var(--text-muted)', fontSize: 13 }}>Login</div>

      <div style={{
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-lg)',
        padding: 36,
        width: '100%',
        maxWidth: 420,
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <h1 style={{ color: 'var(--orange)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Login into your Account
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Welcome back! Select method to log in:
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
            <input
              type="email"
              placeholder="Username or Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--orange)', fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--orange)' }} />
            Remember Me
          </label>
          <span style={{ color: 'var(--orange)', fontSize: 13, cursor: 'pointer' }}>Forgot Password?</span>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--orange)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
