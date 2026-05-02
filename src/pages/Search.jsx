// src/pages/Search.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Card, Chip, Spinner } from '@/components/ui'
import { B } from '@/lib/theme'

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Search() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [q, setQ]           = useState('')
  const [tab, setTab]       = useState('all')
  const [results, setResults] = useState({ users: [], groups: [], events: [], marketplace: [] })
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(q)

  useEffect(() => {
    if (!debounced.trim()) { setResults({ users: [], groups: [], events: [], marketplace: [] }); return }
    search(debounced.trim())
  }, [debounced])

  async function search(term) {
    setLoading(true)
    const end = term + '\uf8ff'
    try {
      const [uSnap, gSnap, eSnap, mSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('displayName', '>=', term), where('displayName', '<=', end), where('status', '==', 'approved'), limit(8))),
        getDocs(query(collection(db, 'groups'), where('name', '>=', term), where('name', '<=', end), limit(6))),
        getDocs(query(collection(db, 'events'), where('title', '>=', term), where('title', '<=', end), limit(6))),
        getDocs(query(collection(db, 'marketplace'), where('title', '>=', term), where('title', '<=', end), limit(6))),
      ])
      setResults({
        users:       uSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        groups:      gSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        events:      eSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        marketplace: mSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const total = Object.values(results).reduce((s, a) => s + a.length, 0)
  const TABS = [
    { id: 'all',         label: 'All',          count: total },
    { id: 'users',       label: '👤 Students',  count: results.users.length },
    { id: 'groups',      label: '💬 Groups',    count: results.groups.length },
    { id: 'events',      label: '📅 Events',    count: results.events.length },
    { id: 'marketplace', label: '📚 Resources', count: results.marketplace.length },
  ]

  return (
    <div className="page-container">
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
        <input
          autoFocus value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search students, groups, events, resources…"
          style={{ width: '100%', background: 'var(--cl-surface)', border: `1.5px solid ${B.vibrantPurple}40`, borderRadius: 16, padding: '14px 14px 14px 44px', color: 'var(--cl-text)', fontSize: 15, outline: 'none', boxSizing: 'border-box', boxShadow: `0 0 0 0px ${B.vibrantPurple}` }}
        />
        {loading && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><Spinner size={18} /></span>}
      </div>

      {/* Tabs */}
      {debounced && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: tab === t.id ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : `${B.vibrantPurple}15`, color: tab === t.id ? '#fff' : B.vibrantPurple, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
              {t.label} {t.count > 0 && `(${t.count})`}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!debounced && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--cl-text)', marginBottom: 8 }}>Search CampusLink</div>
          <div style={{ color: 'var(--cl-muted)', fontSize: 14 }}>Find students, groups, events and course resources</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
            {['Computer Science', 'Study Groups', 'Career Fair', 'Past Papers'].map(s => (
              <Chip key={s} onClick={() => setQ(s)}>{s}</Chip>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {debounced && !loading && total === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--cl-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>😔</div>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', marginBottom: 6 }}>No results for "{debounced}"</div>
          <div style={{ fontSize: 13 }}>Try different keywords or check spelling</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Students */}
        {(tab === 'all' || tab === 'users') && results.users.length > 0 && (
          <Card>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, marginBottom: 12 }}>👤 Students</div>
            {results.users.map(u => (
              <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', borderBottom: `1px solid var(--cl-border)`, cursor: 'pointer' }}>
                <Avatar src={u.photoURL} initials={u.displayName} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>
                    {u.displayName}
                    {u.isVerified && <span style={{ marginLeft: 5, color: B.mint, fontSize: 11 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{u.program} · {u.university}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--cl-muted)' }}>→</span>
              </div>
            ))}
          </Card>
        )}

        {/* Groups */}
        {(tab === 'all' || tab === 'groups') && results.groups.length > 0 && (
          <Card>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, marginBottom: 12 }}>💬 Groups</div>
            {results.groups.map(g => (
              <div key={g.id} onClick={() => navigate('/groups')} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', borderBottom: `1px solid var(--cl-border)`, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${B.richPurple},${B.midPurple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{g.icon || '💬'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{g.memberCount || 0} members</div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Events */}
        {(tab === 'all' || tab === 'events') && results.events.length > 0 && (
          <Card>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, marginBottom: 12 }}>📅 Events</div>
            {results.events.map(e => (
              <div key={e.id} onClick={() => navigate('/events')} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', borderBottom: `1px solid var(--cl-border)`, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${B.vibrantPurple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{e.icon || '📅'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{e.date} · {e.location}</div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Marketplace */}
        {(tab === 'all' || tab === 'marketplace') && results.marketplace.length > 0 && (
          <Card>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, marginBottom: 12 }}>📚 Course Resources</div>
            {results.marketplace.map(m => (
              <div key={m.id} onClick={() => navigate('/marketplace')} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', borderBottom: `1px solid var(--cl-border)`, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${B.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{m.courseCode} · {m.type}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.price > 0 ? B.gold : B.mint }}>{m.price > 0 ? `GH₵${m.price}` : 'Free'}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
