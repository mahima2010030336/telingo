import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { voteAPI, flagAPI } from '../api.js'
import { useToast } from '../App.jsx'

function DefinitionRow({ def, onVote, compact = false }) {
  const [votes, setVotes] = useState({ likes: def.likes, dislikes: def.dislikes, userVote: def.user_vote })
  const { user } = useAuth()
  const showToast = useToast()

  const handleVote = async (type) => {
    if (!user) { showToast('Please login to vote', 'error'); return }
    try {
      const res = await voteAPI.voteDefinition(def.id, type)
      setVotes({ likes: res.data.likes, dislikes: res.data.dislikes, userVote: res.data.user_vote })
      if (res.data.just_published) showToast('🎉 Definition is now live!', 'success')
      if (onVote) onVote(def.id, res.data)
    } catch (e) {
      showToast('Vote failed', 'error')
    }
  }

  return (
    <div style={{ marginBottom: compact ? 0 : 16 }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>
        {def.definition}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <span className="badge" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Added by <span style={{ color: 'var(--orange)', marginLeft: 4 }}>{def.author_name || 'Anonymous'}</span>
          </span>
        </div>
        {def.region && (
          <span className="badge">📍 {def.region}</span>
        )}
      </div>

      {!def.is_published && (
        <div style={{ marginTop: 8 }}>
          <span className="badge-pending">Pending – needs 10 likes</span>
          <div className="progress-bar" style={{ marginTop: 6, maxWidth: 160 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (votes.likes / 10) * 100)}%` }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <button
          className={`btn-icon ${votes.userVote === 'like' ? 'active-like' : ''}`}
          onClick={() => handleVote('like')}
        >
          👍 {votes.likes}
        </button>
        <button
          className={`btn-icon ${votes.userVote === 'dislike' ? 'active-dislike' : ''}`}
          onClick={() => handleVote('dislike')}
        >
          👎 {votes.dislikes}
        </button>
      </div>
    </div>
  )
}

export default function WordCard({ word, onVoteWord, showAll = false, pending = false }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const showToast = useToast()
  const [wordVotes, setWordVotes] = useState({ likes: word.likes, dislikes: word.dislikes, userVote: word.user_vote })

  const displayedDefs = showAll ? word.definitions : word.definitions.slice(0, 2)

  const handleWordVote = async (type) => {
    if (!user) { showToast('Please login to vote', 'error'); return }
    try {
      const res = await voteAPI.voteWord(word.id, type)
      setWordVotes({ likes: res.data.likes, dislikes: res.data.dislikes, userVote: res.data.user_vote })
      if (res.data.just_published) showToast('🎉 Word is now live in eLingo!', 'success')
      if (onVoteWord) onVoteWord(word.id, res.data)
    } catch {
      showToast('Vote failed', 'error')
    }
  }

  const handleFlag = async () => {
    if (!user) { showToast('Please login to flag', 'error'); return }
    try {
      await flagAPI.flagWord(word.id)
      showToast('Word flagged for review', 'success')
    } catch {
      showToast('Flag failed', 'error')
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      marginBottom: 16,
      border: '1.5px solid var(--border)',
    }}>
      {/* Word title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2
          onClick={() => navigate(`/word/${word.id}`)}
          style={{ color: 'var(--orange)', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}
        >
          {word.transliteration || word.word}
        </h2>
        {pending && (
          <div style={{ textAlign: 'right' }}>
            <span className="badge-pending">Needs 20 likes to publish</span>
            <div className="progress-bar" style={{ marginTop: 4, minWidth: 120 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (wordVotes.likes / 20) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {wordVotes.likes}/20 likes
            </div>
          </div>
        )}
      </div>

      {/* Definitions */}
      {displayedDefs.length > 0 ? (
        displayedDefs.map((def, i) => (
          <div key={def.id}>
            {i > 0 && <div className="divider" />}
            <DefinitionRow def={def} />
          </div>
        ))
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No definitions yet. Be the first to add one!</p>
      )}

      {/* Card footer */}
      <div className="divider" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {pending ? (
            <>
              <button
                className={`btn-icon ${wordVotes.userVote === 'like' ? 'active-like' : ''}`}
                onClick={() => handleWordVote('like')}
              >
                👍 {wordVotes.likes}
              </button>
              <button
                className={`btn-icon ${wordVotes.userVote === 'dislike' ? 'active-dislike' : ''}`}
                onClick={() => handleWordVote('dislike')}
              >
                👎 {wordVotes.dislikes}
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline"
              style={{ padding: '8px 16px', fontSize: 13 }}
              onClick={() => user ? navigate(`/word/${word.id}/add-definition`) : navigate('/login')}
            >
              + Add New Definition
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!pending && word.definitions.length > 2 && (
            <button
              className="btn-icon"
              onClick={() => navigate(`/word/${word.id}`)}
              style={{ color: 'var(--orange)' }}
            >
              Show More →
            </button>
          )}
          <button className="btn-icon" onClick={handleFlag}>
            🚩 Flag
          </button>
        </div>
      </div>
    </div>
  )
}
