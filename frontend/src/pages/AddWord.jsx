import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { wordsAPI } from '../api.js'
import { useAuth, useToast } from '../App.jsx'

const REGIONS = [
  '', 'Andhra Pradesh', 'Telangana', 'All regions', 'Coastal Andhra',
  'Rayalaseema', 'Nellore', 'Guntur', 'Krishna', 'East Godavari',
  'West Godavari', 'Hyderabad', 'Warangal', 'Karimnagar',
]

export default function AddWord({ addDefOnly = false }) {
  const navigate = useNavigate()
  const { id: wordId } = useParams()
  const { user } = useAuth()
  const showToast = useToast()

  const [form, setForm] = useState({
    word: '',
    transliteration: '',
    definition: '',
    usage: '',
    region: '',
  })
  const [loading, setLoading] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  const isDefOnly = addDefOnly && wordId

  const handleSubmit = async () => {
    if (!form.definition) { showToast('Definition is required', 'error'); return }
    if (!isDefOnly && !form.word) { showToast('Word is required', 'error'); return }

    setLoading(true)
    try {
      if (isDefOnly) {
        await wordsAPI.addDefinition(wordId, {
          definition: form.definition,
          usage: form.usage || null,
          region: form.region || null,
        })
        showToast('Definition submitted! It needs 10 likes to go live.', 'success')
        navigate(`/word/${wordId}`)
      } else {
        const res = await wordsAPI.create({
          word: form.word,
          transliteration: form.transliteration || null,
          definition: form.definition,
          usage: form.usage || null,
          region: form.region || null,
        })
        showToast('Word submitted! It needs 20 likes to go live.', 'success')
        navigate('/?pending=true')
      }
    } catch (e) {
      showToast(e.response?.data?.detail || 'Submission failed', 'error')
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
      <div style={{ position: 'absolute', top: 16, left: 20, color: 'var(--text-muted)', fontSize: 13 }}>
        {isDefOnly ? 'New Definition' : 'New Word'}
      </div>

      <div style={{
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-lg)',
        padding: 36,
        width: '100%',
        maxWidth: 520,
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            className="btn-icon"
            onClick={() => navigate(-1)}
            style={{ fontSize: 18, padding: '8px 12px' }}
          >
            ←
          </button>
          <h1 style={{ color: 'var(--orange)', fontSize: 22, fontWeight: 700 }}>
            {isDefOnly ? 'Add new Definition' : 'Add new Word'}
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>
          {isDefOnly
            ? 'You know a new definition? Please share with a wider audience.'
            : 'Do you want to add a new word? You can share it here.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!isDefOnly && (
          <>
            <input
              placeholder="Enter the new word (Telugu or English)"
              value={form.word}
              onChange={e => setForm(f => ({ ...f, word: e.target.value }))}
            />
            <input
              placeholder="Transliteration in English (e.g. Namaskaram)"
              value={form.transliteration}
              onChange={e => setForm(f => ({ ...f, transliteration: e.target.value }))}
            />
          </>
        )}

          <textarea
            placeholder="Enter the definition of this word"
            value={form.definition}
            onChange={e => setForm(f => ({ ...f, definition: e.target.value }))}
            rows={4}
            style={{ borderRadius: 'var(--radius-md)' }}
          />

          <textarea
            placeholder="Enter the usage / example sentence (optional)"
            value={form.usage}
            onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
            rows={3}
            style={{ borderRadius: 'var(--radius-md)' }}
          />

          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
              Select the region where this word is commonly used (optional)
            </p>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>📍</span>
              <select
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                style={{ paddingLeft: 40, borderRadius: 'var(--radius-full)', appearance: 'none', cursor: 'pointer' }}
              >
                {REGIONS.map(r => (
                  <option key={r} value={r} style={{ background: 'var(--bg-input)' }}>
                    {r || 'Select region or place'}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>▼</span>
            </div>
          </div>

          {/* Info banner */}
          <div style={{
            background: 'var(--orange-muted)',
            border: '1.5px solid var(--orange)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--orange)',
          }}>
            {isDefOnly
              ? '💡 Your definition needs 10 likes from the community to go live.'
              : '💡 Your word needs 20 likes from the community to go live.'}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : isDefOnly ? 'Add Definition' : 'Add Word'}
          </button>
        </div>
      </div>
    </div>
  )
}
