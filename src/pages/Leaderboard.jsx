// src/pages/Leaderboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getLeaderboard, getBadge } from '@/lib/reputation'
import { Avatar, Card, Skeleton } from '@/components/ui'
import { B } from '@/lib/theme'

const RANK_STYLE = {
  1: { bg: '#FBBF24', color: '#1A1A2E', label: '🥇' },
  2: { bg: '#9CA3AF', color: '#fff',    label: '🥈' },
  3: { bg: '#C2714F', color: '#fff',    label: '🥉' },
}

function LeaderRow({ entry, isYou }) {
  const badge = getBadge(entry.reputationPoints || 0)
  const rank  = RANK_STYLE[entry.rank]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px',
      background: isYou ? `${B.vibrantPurple}15` : 'transparent',
      border: isYou ? `1px solid ${B.vibrantPurple}40` : '1px solid transparent',
      borderRadius: 14, marginBottom: 6,
      transition: 'all 0.2s',
    }}>
      {/* Rank */}
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: rank ? 18 : 13, background: rank ? rank.bg : `${B.midPurple}20`, color: rank ? rank.color : 'var(--cl-muted)' }}>
        {rank ? rank.label : `#${entry.rank}`}
      </div>
      <Avatar src={entry.photoURL} initials={entry.displayName} size={40} glow={isYou} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--cl-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.displayName}
            {entry.isVerified && <span style={{ color: B.mint, fontSize: 11, marginLeft: 4 }}>✓</span>}
          </span>
          {isYou && <span style={{ fontSize: 10, background: `${B.vibrantPurple}30`, color: B.vibrantPurple, padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>You</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>
          <span style={{ marginRight: 6 }}>{badge.icon} {badge.label}</span>·
          <span style={{ marginLeft: 6 }}>{entry.program || 'Student'}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: badge.color }}>{entry.reputationPoints || 0}</div>
        <div style={{ fontSize: 10, color: 'var(--cl-muted)' }}>points</div>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { user, profile } = useAuth()
  const [tab, setTab]       = useState('global')
  const [board, setBoard]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [tab, profile?.university, profile?.faculty])

  async function load() {
    setLoading(true)
    try {
      const faculty = tab === 'faculty' ? profile?.faculty : null
      const data = await getLeaderboard(profile?.university || 'knust', faculty)
      setBoard(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const TABS = [
    { id: 'global',  label: '🌍 University' },
    { id: 'faculty', label: `🏛️ ${profile?.faculty || 'Faculty'}` },
  ]

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 4 }}>🏆 Leaderboard</div>
        <div style={{ fontSize: 13, color: 'var(--cl-muted)' }}>Top contributors at {profile?.university || 'your university'} this week</div>
      </div>

      {/* How to earn */}
      <Card style={{ marginBottom: 16, background: `${B.midPurple}15`, border: `1px solid ${B.vibrantPurple}25` }}>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, marginBottom: 10 }}>How to earn points</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[['📝 Post', '+10'], ['❤️ Like received', '+2'], ['💬 Comment', '+5'], ['👥 Join group', '+8'], ['📅 RSVP event', '+10'], ['🤝 New friend', '+5'], ['📚 Share resource', '+15']].map(([action, pts]) => (
            <div key={action} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--cl-surface)', border: `1px solid var(--cl-border)`, borderRadius: 20, padding: '4px 10px' }}>
              <span style={{ fontSize: 12, color: 'var(--cl-text)' }}>{action}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: B.mint }}>{pts}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', background: tab === t.id ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : `${B.vibrantPurple}15`, color: tab === t.id ? '#fff' : B.vibrantPurple, fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Board */}
      <Card>
        {loading ? (
          [1,2,3,4,5].map(i => <Skeleton key={i} height={60} style={{ marginBottom: 8 }} />)
        ) : board.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--cl-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', marginBottom: 6 }}>No data yet</div>
            <div style={{ fontSize: 13 }}>Start posting to claim your spot!</div>
          </div>
        ) : (
          board.map(entry => (
            <LeaderRow key={entry.id} entry={entry} isYou={entry.id === user?.uid} />
          ))
        )}
      </Card>
    </div>
  )
}
