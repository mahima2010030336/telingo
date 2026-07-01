import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import WordCard from '../components/WordCard.jsx'
import SEO from '../components/SEO.jsx'
import { wordsAPI, seedAPI } from '../api.js'
import { useAuth, useToast } from '../App.jsx'

export default function Home() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()
  const showToast = useToast()

  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [activeLetter, setActiveLetter] = useState(null)

  const sort = searchParams.get('sort') || 'new'
  const pending = searchParams.get('pending') === 'true'

  const fetchWords = useCallback(async () => {
    setLoading(true)
    try {
      const params = { sort, pending }
      if (searchQuery) params.search = searchQuery
      if (activeLetter) params.letter = activeLetter
      const res = await wordsAPI.getAll(params)
      setWords(res.data)
    } catch {
      showToast('Failed to load words', 'error')
    } finally {
      setLoading(false)
    }
  }, [sort, pending, searchQuery, activeLetter])

  useEffect(() => { fetchWords() }, [fetchWords])

  const handleSeed = async () => {
    try {
      await seedAPI.seed()
      showToast('Sample Telugu words loaded!', 'success')
      fetchWords()
    } catch { showToast('Already seeded', 'error') }
  }

  const handleLetterClick = (letter) => {
    setActiveLetter(letter)
    setSearchQuery('')
  }

  const pageTitle = pending ? 'Pending Words – Vote to Publish'
    : sort === 'popular' ? 'Popular Telugu Words'
    : searchQuery ? `Search: "${searchQuery}"`
    : 'Telugu Dictionary – Search Telugu Words & Meanings'

  const pageDesc = pending
    ? 'Vote on new Telugu words submitted by the community. Words with 20 likes get published to the dictionary.'
    : `Free Telugu dictionary. ${words.length > 0 ? `Browse ${words.length}+ words` : 'Search'} with meanings, definitions, usage examples and regional variations.`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-root)', padding: '16px' }}>
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={`/?sort=${sort}`}
      />

      <div style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>
        {pending ? 'Pending Words' : sort === 'popular' ? 'Popular' : 'Home'}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 1200, margin: '0 auto' }}>
        <Sidebar activeLetter={activeLetter} onLetterClick={handleLetterClick} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>🔍</span>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setActiveLetter(null) }}
              placeholder="Search Telugu words..."
              style={{ borderRadius: 'var(--radius-full)', padding: '14px 20px 14px 48px', fontSize: 15, border: '2px solid var(--orange)', background: 'var(--bg-panel)' }}
            />
          </div>

          {pending && (
            <div style={{ background: 'rgba(249,115,22,0.1)', border: '1.5px solid var(--orange)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--orange)' }}>
              ⏳ These words need <strong>20 likes</strong> to go live. Vote to help publish them!
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading words...</div>
          ) : words.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                {searchQuery || activeLetter ? 'No words found.' : 'No words yet! Be the first to add a Telugu word.'}
              </div>
              <button className="btn btn-outline" onClick={handleSeed}>Load Sample Telugu Words</button>
            </div>
          ) : (
            words.map(w => <WordCard key={w.id} word={w} pending={pending} />)
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Logout</button>
                  </div>
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
