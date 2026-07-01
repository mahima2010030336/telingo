import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import SEO from '../components/SEO.jsx'
import { wordsAPI, voteAPI, flagAPI } from '../api.js'
import { useAuth, useToast } from '../App.jsx'

function DefinitionCard({ def, onVoteUpdate }) {
  const { user } = useAuth()
  const showToast = useToast()
  const [votes, setVotes] = useState({ likes: def.likes, dislikes: def.dislikes, userVote: def.user_vote })

  const handleVote = async (type) => {
    if (!user) { showToast('Please login to vote', 'error'); return }
    try {
      const res = await voteAPI.voteDefinition(def.id, type)
      setVotes({ likes: res.data.likes, dislikes: res.data.dislikes, userVote: res.data.user_vote })
      if (res.data.just_published) showToast('🎉 Definition is now live!', 'success')
      if (onVoteUpdate) onVoteUpdate()
    } catch { showToast('Vote failed', 'error') }
  }

  const handleFlag = async () => {
    if (!user) { showToast('Please login to flag', 'error'); return }
    try { await flagAPI.flagDefinition(def.id); showToast('Flagged for review', 'success') }
    catch { showToast('Flag failed', 'error') }
  }

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 12, border: '1.5px solid var(--border)' }}>
      {!def.is_published && (
        <div style={{ marginBottom: 12 }}>
          <span className="badge-pending">Pending – needs 10 likes to publish</span>
          <div className="progress-bar" style={{ marginTop: 6, maxWidth: 200 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (votes.likes / 10) * 100)}%` }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{votes.likes}/10 likes</div>
        </div>
      )}
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.7 }}>{def.definition}</p>
      {def.usage && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8, fontSize: 13 }}>Example: {def.usage}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Added by <span style={{ color: 'var(--orange)' }}>{def.author_name || 'Anonymous'}</span></span>
        {def.region && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {def.region}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className={`btn-icon ${votes.userVote === 'like' ? 'active-like' : ''}`} onClick={() => handleVote('like')}>👍 {votes.likes}</button>
        <button className={`btn-icon ${votes.userVote === 'dislike' ? 'active-dislike' : ''}`} onClick={() => handleVote('dislike')}>👎 {votes.dislikes}</button>
        <button className="btn-icon" onClick={handleFlag} style={{ marginLeft: 'auto' }}>🚩 Flag</button>
      </div>
    </div>
  )
}

export default function Details() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const showToast = useToast()
  const [word, setWord] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchWord = async () => {
    try {
      const res = await wordsAPI.getOne(id)
      setWord(res.data)
    } catch {
      showToast('Word not found', 'error')
      navigate('/')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchWord() }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )
  if (!word) return null

  const seoDesc = word.definitions.length > 0
    ? `${word.word} meaning in Telugu: ${word.definitions[0].definition}${word.definitions[0].usage ? ` Example: ${word.definitions[0].usage}` : ''}`
    : `Telugu meaning of ${word.word}. Find definitions, usage examples and regional variations.`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-root)', padding: '16px' }}>
      <SEO
        title={`${word.word} – Telugu meaning & definition`}
        description={seoDesc}
        url={`/word/${word.id}`}
        word={word.word}
        definitions={word.definitions}
        type="article"
      />

      <div style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>Details</div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 1200, margin: '0 auto' }}>
        <Sidebar activeLetter={null} onLetterClick={(l) => navigate(`/?letter=${l}`)} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>🔍</span>
            <input placeholder="Search Telugu words..." onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/?search=${e.target.value}`) }}
              style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px 14px 48px', fontSize: 15, border: '2px solid var(--orange)', background: 'var(--bg-panel)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-icon" onClick={() => navigate(-1)} style={{ fontSize: 18, padding: '8px 12px' }}>←</button>
              <h1 style={{ color: 'var(--orange)', fontSize: 26, fontWeight: 700 }}>{word.word}</h1>
            </div>
            <button className="btn btn-outline" onClick={() => user ? navigate(`/word/${id}/add-definition`) : navigate('/login')}>
              + New Definition
            </button>
          </div>

          {/* BreadcrumbList for Google */}
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "eLingo", "item": import.meta.env.VITE_SITE_URL || "https://elingo.vercel.app" },
              { "@type": "ListItem", "position": 2, "name": word.word }
            ]
          })}</script>

          {word.definitions.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}>
              No definitions yet. Be the first!<br /><br />
              <button className="btn btn-primary" onClick={() => user ? navigate(`/word/${id}/add-definition`) : navigate('/login')}>Add Definition</button>
            </div>
          ) : (
            word.definitions.map(def => <DefinitionCard key={def.id} def={def} onVoteUpdate={fetchWord} />)
          )}
        </div>

        <div style={{ width: 200, minWidth: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-outline" onClick={() => navigate('/add-word')} style={{ width: '100%', justifyContent: 'center' }}>+ Add New Word</button>
                <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={() => navigate('/signup')}>Sign Up</button>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
              </div>
            )}
          </div>
          <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}>
            Ads Section
          </div>
        </div>
      </div>
    </div>
  )
}
