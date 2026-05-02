// src/pages/Admin.jsx
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  collection, query, where, getDocs, doc,
  updateDoc, serverTimestamp, getDoc, deleteDoc,
  orderBy, limit, onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

// ── Design tokens (admin-specific, desktop-first) ─────────────────────────────
const A = {
  bg:      '#05010F',
  panel:   '#0D0520',
  card:    '#130828',
  border:  '#2A1245',
  text:    '#EDE8FF',
  muted:   '#6B5A8E',
  accent:  '#A855F7',
  mid:     '#6B21A8',
  deep:    '#3B0F6E',
  green:   '#06D6A0',
  amber:   '#FBBF24',
  red:     '#FF6B6B',
  blue:    '#60A5FA',
}

// ── Mini bar chart ─────────────────────────────────────────────────────────────
function BarChart({ data, color = A.accent, height = 80 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            height: `${Math.max((d.value / max) * height, 4)}px`,
            background: i === data.length - 1
              ? `linear-gradient(180deg, ${color}, ${color}88)`
              : `${color}40`,
            transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: i === data.length - 1 ? `0 0 12px ${color}60` : 'none',
          }} />
          <span style={{ fontSize: 9, color: A.muted, whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let offset = 0
  const r = 45, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={A.border} strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dash = pct * circumference
        const gap  = circumference - dash
        const rotation = offset * 360 - 90
        offset += pct
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        )
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={A.text} fontSize="18" fontWeight="800" fontFamily="'Plus Jakarta Sans',sans-serif">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={A.muted} fontSize="9" fontFamily="'Plus Jakarta Sans',sans-serif">TOTAL</text>
    </svg>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, delta, color, sub }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: '18px 20px', flex: 1, minWidth: 140 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        {delta != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: delta >= 0 ? A.green : A.red,
            background: delta >= 0 ? `${A.green}18` : `${A.red}18`,
            padding: '2px 8px', borderRadius: 8 }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || A.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: A.muted, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color || A.accent, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

// ── Pill badge ────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: { color: A.green,  bg: `${A.green}18`,  label: 'Approved' },
    pending:  { color: A.amber,  bg: `${A.amber}18`,  label: 'Pending'  },
    rejected: { color: A.red,    bg: `${A.red}18`,    label: 'Rejected' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: '3px 9px', borderRadius: 8 }}>
      {s.label}
    </span>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Av({ name, src, size = 36 }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${A.border}`, flexShrink: 0 }} />
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${A.mid}, ${A.accent})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 800, color: '#fff',
      border: `2px solid ${A.border}` }}>
      {initials}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: A.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: A.muted, marginTop: 3 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
function Table({ cols, rows, emptyMsg = 'No data' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: A.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${A.border}`, whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 32, color: A.muted }}>{emptyMsg}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${A.border}20`, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${A.accent}08`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: '12px 12px', color: A.text, verticalAlign: 'middle' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, count, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 12, border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left',
      background: active ? `${A.accent}18` : 'transparent',
      color: active ? A.accent : A.muted,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: active ? 700 : 500, fontSize: 13,
      transition: 'all 0.18s',
      borderLeft: active ? `3px solid ${A.accent}` : '3px solid transparent',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count > 0 && <span style={{ background: A.red, color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 800, padding: '1px 6px' }}>{count}</span>}
    </button>
  )
}

// ── MAIN ADMIN COMPONENT ──────────────────────────────────────────────────────
export default function Admin() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]       = useState('overview')
  const [queue, setQueue]   = useState([])
  const [users, setUsers]   = useState([])
  const [posts, setPosts]   = useState([])
  const [groups, setGroups] = useState([])
  const [events, setEvents] = useState([])
  const [stats, setStats]   = useState({ total: 0, approved: 0, pending: 0, rejected: 0, posts: 0, groups: 0, events: 0 })
  const [loading, setLoading]   = useState(true)
  const [actioning, setActioning] = useState(null)
  const [searchQ, setSearch]    = useState('')

  // Guard
  useEffect(() => {
    if (profile && !profile.isAdmin) {
      toast.error('Admin access required')
      navigate('/feed')
    }
  }, [profile])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [qSnap, uSnap, pSnap, gSnap, eSnap] = await Promise.all([
        getDocs(query(collection(db, 'verificationQueue'), where('reviewed', '==', false))),
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(collection(db, 'groups')),
        getDocs(collection(db, 'events')),
      ])

      // Queue with user data
      const qItems = await Promise.all(
        qSnap.docs.map(async d => {
          const u = await getDoc(doc(db, 'users', d.id))
          return { id: d.id, ...d.data(), user: u.data() }
        })
      )

      const allUsers  = uSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const allPosts  = pSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const allGroups = gSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const allEvents = eSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      setQueue(qItems)
      setUsers(allUsers)
      setPosts(allPosts)
      setGroups(allGroups)
      setEvents(allEvents)
      setStats({
        total:    allUsers.length,
        approved: allUsers.filter(u => u.status === 'approved').length,
        pending:  allUsers.filter(u => u.status === 'pending').length,
        rejected: allUsers.filter(u => u.status === 'rejected').length,
        posts:    allPosts.length,
        groups:   allGroups.length,
        events:   allEvents.length,
      })
    } catch (err) {
      toast.error('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Actions ───────────────────────────────────────────────────────────────
  async function approveUser(uid) {
    setActioning(uid)
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'approved', updatedAt: serverTimestamp() })
      await updateDoc(doc(db, 'verificationQueue', uid), { reviewed: true, reviewedAt: serverTimestamp(), decision: 'approved' })
      setQueue(q => q.filter(i => i.id !== uid))
      setUsers(u => u.map(x => x.id === uid ? { ...x, status: 'approved' } : x))
      setStats(s => ({ ...s, approved: s.approved + 1, pending: s.pending - 1 }))
      toast.success('Student approved ✓')
    } catch { toast.error('Failed to approve') }
    finally { setActioning(null) }
  }

  async function rejectUser(uid) {
    setActioning(uid)
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'rejected', updatedAt: serverTimestamp() })
      await updateDoc(doc(db, 'verificationQueue', uid), { reviewed: true, reviewedAt: serverTimestamp(), decision: 'rejected' })
      setQueue(q => q.filter(i => i.id !== uid))
      setUsers(u => u.map(x => x.id === uid ? { ...x, status: 'rejected' } : x))
      setStats(s => ({ ...s, rejected: s.rejected + 1, pending: s.pending - 1 }))
      toast.success('Student rejected')
    } catch { toast.error('Failed to reject') }
    finally { setActioning(null) }
  }

  async function deletePost(postId) {
    if (!window.confirm('Delete this post permanently?')) return
    try {
      await deleteDoc(doc(db, 'posts', postId))
      setPosts(p => p.filter(x => x.id !== postId))
      setStats(s => ({ ...s, posts: s.posts - 1 }))
      toast.success('Post deleted')
    } catch { toast.error('Failed to delete post') }
  }

  async function toggleUserStatus(uid, current) {
    const newStatus = current === 'approved' ? 'rejected' : 'approved'
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus, updatedAt: serverTimestamp() })
      setUsers(u => u.map(x => x.id === uid ? { ...x, status: newStatus } : x))
      toast.success(`User ${newStatus}`)
    } catch { toast.error('Failed to update user') }
  }

  // ── Fake chart data (replace with real aggregation in production) ──────────
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const signupChart = weekDays.map((label, i) => ({ label, value: Math.floor(Math.random() * 20 + 2) }))
  const postChart   = weekDays.map((label, i) => ({ label, value: Math.floor(Math.random() * 40 + 5) }))

  const filteredUsers = users.filter(u =>
    !searchQ || u.displayName?.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQ.toLowerCase())
  )

  const TABS = [
    { id: 'overview',    icon: '📊', label: 'Overview' },
    { id: 'queue',       icon: '⏳', label: 'Verify Queue', count: queue.length },
    { id: 'users',       icon: '👥', label: 'Students' },
    { id: 'content',     icon: '📝', label: 'Content' },
    { id: 'groups',      icon: '💬', label: 'Groups' },
    { id: 'events',      icon: '📅', label: 'Events' },
  ]

  const panelStyle = { background: A.card, border: `1px solid ${A.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }

  return (
    <div style={{ minHeight: '100vh', background: A.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: A.text, display: 'flex' }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Sidebar ── */}
      <aside style={{ width: 240, flexShrink: 0, background: A.panel, borderRight: `1px solid ${A.border}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            <span style={{ color: A.text }}>Campus</span>
            <span style={{ color: A.accent }}>Link</span>
          </div>
          <div style={{ fontSize: 10, color: A.muted, marginTop: 2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin Console</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 10px', flex: 1 }}>
          <div style={{ fontSize: 10, color: A.muted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 14px 6px' }}>Main</div>
          {TABS.map(t => (
            <NavItem key={t.id} icon={t.icon} label={t.label} active={tab === t.id} count={t.count || 0} onClick={() => setTab(t.id)} />
          ))}
        </nav>

        {/* Bottom admin info */}
        <div style={{ padding: '16px 14px', borderTop: `1px solid ${A.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Av name={profile?.displayName} src={profile?.photoURL} size={32} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: A.text }}>{profile?.displayName || 'Admin'}</div>
              <div style={{ fontSize: 10, color: A.accent }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => navigate('/feed')} style={{ marginTop: 12, width: '100%', background: `${A.accent}15`, border: `1px solid ${A.accent}30`, borderRadius: 8, padding: '7px 10px', color: A.accent, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
            ← Back to App
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: A.text }}>{TABS.find(t => t.id === tab)?.label}</div>
            <div style={{ fontSize: 13, color: A.muted, marginTop: 2 }}>KNUST Pilot · CampusLink Admin</div>
          </div>
          <button onClick={loadData} style={{ background: `${A.accent}15`, border: `1px solid ${A.accent}30`, borderRadius: 10, padding: '8px 16px', color: A.accent, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            ↻ Refresh
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <StatCard icon="👥" label="Total Students" value={stats.total} color={A.accent} sub={`${stats.approved} active`} />
              <StatCard icon="✅" label="Approved" value={stats.approved} color={A.green} delta={12} />
              <StatCard icon="⏳" label="Pending Review" value={stats.pending} color={A.amber} />
              <StatCard icon="❌" label="Rejected" value={stats.rejected} color={A.red} />
              <StatCard icon="📝" label="Total Posts" value={stats.posts} color={A.blue} delta={8} />
              <StatCard icon="💬" label="Groups" value={stats.groups} color={A.accent} />
              <StatCard icon="📅" label="Events" value={stats.events} color={A.green} />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 24 }}>
              {/* Signups chart */}
              <div style={panelStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: A.text, marginBottom: 4 }}>Signups This Week</div>
                <div style={{ fontSize: 11, color: A.muted, marginBottom: 16 }}>New student registrations</div>
                <BarChart data={signupChart} color={A.accent} height={90} />
              </div>

              {/* Posts chart */}
              <div style={panelStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: A.text, marginBottom: 4 }}>Posts This Week</div>
                <div style={{ fontSize: 11, color: A.muted, marginBottom: 16 }}>Content activity on feed</div>
                <BarChart data={postChart} color={A.blue} height={90} />
              </div>

              {/* Donut */}
              <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: A.text, marginBottom: 16, alignSelf: 'flex-start' }}>Student Status</div>
                <DonutChart segments={[
                  { value: stats.approved, color: A.green },
                  { value: stats.pending,  color: A.amber },
                  { value: stats.rejected, color: A.red   },
                ]} size={120} />
                <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                  {[['Approved', A.green, stats.approved], ['Pending', A.amber, stats.pending], ['Rejected', A.red, stats.rejected]].map(([l, c, v]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, margin: '0 auto 4px' }} />
                      <div style={{ fontSize: 10, color: A.muted }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div style={panelStyle}>
              <SectionHeader title="Recent Registrations" subtitle="Latest students who signed up" />
              <Table
                cols={[
                  { key: 'name', label: 'Student', render: u => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Av name={u.displayName} src={u.photoURL} size={32} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{u.displayName}</div>
                        <div style={{ fontSize: 11, color: A.muted }}>{u.email}</div>
                      </div>
                    </div>
                  )},
                  { key: 'program', label: 'Program', render: u => <span style={{ color: A.muted, fontSize: 12 }}>{u.program || '—'}</span> },
                  { key: 'status', label: 'Status', render: u => <StatusBadge status={u.status} /> },
                ]}
                rows={[...users].slice(0, 8)}
                emptyMsg="No students yet"
              />
            </div>
          </div>
        )}

        {/* ── VERIFY QUEUE ── */}
        {tab === 'queue' && (
          <div style={panelStyle}>
            <SectionHeader
              title="Verification Queue"
              subtitle={`${queue.length} submission${queue.length !== 1 ? 's' : ''} awaiting review`}
            />
            {loading ? (
              <div style={{ textAlign: 'center', padding: 48, color: A.muted }}>Loading…</div>
            ) : queue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 64 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 700, color: A.text, fontSize: 16 }}>Queue is empty</div>
                <div style={{ color: A.muted, fontSize: 13, marginTop: 6 }}>All submissions have been reviewed</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {queue.map(item => (
                  <div key={item.id} style={{ background: A.panel, border: `1px solid ${A.border}`, borderRadius: 16, padding: 20 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {/* Student info */}
                      <Av name={item.user?.displayName} src={item.user?.photoURL} size={48} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: A.text }}>{item.user?.displayName}</div>
                        <div style={{ fontSize: 12, color: A.muted, marginTop: 2 }}>{item.user?.email}</div>
                        <div style={{ fontSize: 11, color: A.muted, marginTop: 4 }}>
                          Submitted: {item.submittedAt?.toDate?.()?.toLocaleDateString?.('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Unknown'}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                          {item.user?.program && <span style={{ fontSize: 11, background: `${A.accent}18`, color: A.accent, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{item.user.program}</span>}
                          {item.user?.year && <span style={{ fontSize: 11, background: `${A.blue}18`, color: A.blue, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{item.user.year}</span>}
                        </div>
                      </div>
                      <StatusBadge status="pending" />
                    </div>

                    {/* Student ID */}
                    {item.studentIdURL && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: A.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Student ID</div>
                        <a href={item.studentIdURL} target="_blank" rel="noreferrer">
                          <img src={item.studentIdURL} alt="Student ID"
                            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, border: `1px solid ${A.border}`, cursor: 'zoom-in', display: 'block' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        </a>
                        <a href={item.studentIdURL} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, color: A.accent, display: 'inline-block', marginTop: 6, textDecoration: 'none' }}>
                          Open full size ↗
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button onClick={() => approveUser(item.id)} disabled={actioning === item.id}
                        style={{ flex: 1, padding: '10px', background: `linear-gradient(135deg, #065F46, ${A.green})`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px ${A.green}40`, opacity: actioning === item.id ? 0.6 : 1 }}>
                        {actioning === item.id ? '…' : '✓ Approve Student'}
                      </button>
                      <button onClick={() => rejectUser(item.id)} disabled={actioning === item.id}
                        style={{ flex: 1, padding: '10px', background: `${A.red}20`, border: `1px solid ${A.red}40`, borderRadius: 10, color: A.red, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: actioning === item.id ? 0.6 : 1 }}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STUDENTS ── */}
        {tab === 'users' && (
          <div style={panelStyle}>
            <SectionHeader title="All Students" subtitle={`${users.length} registered accounts`} />
            <input value={searchQ} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Search by name or email…"
              style={{ width: '100%', background: A.panel, border: `1.5px solid ${A.border}`, borderRadius: 10, padding: '10px 14px', color: A.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'inherit' }}
            />
            <Table
              cols={[
                { key: 'student', label: 'Student', render: u => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Av name={u.displayName} src={u.photoURL} size={36} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.displayName}</div>
                      <div style={{ fontSize: 11, color: A.muted }}>{u.email}</div>
                    </div>
                  </div>
                )},
                { key: 'program', label: 'Program', render: u => <span style={{ fontSize: 12, color: A.muted }}>{u.program || '—'}</span> },
                { key: 'year',    label: 'Year',    render: u => <span style={{ fontSize: 12, color: A.muted }}>{u.year || '—'}</span> },
                { key: 'status',  label: 'Status',  render: u => <StatusBadge status={u.status} /> },
                { key: 'actions', label: '',        render: u => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleUserStatus(u.id, u.status)} style={{
                      background: u.status === 'approved' ? `${A.red}18` : `${A.green}18`,
                      color: u.status === 'approved' ? A.red : A.green,
                      border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, fontFamily: 'inherit'
                    }}>
                      {u.status === 'approved' ? 'Revoke' : 'Approve'}
                    </button>
                  </div>
                )},
              ]}
              rows={filteredUsers}
              emptyMsg="No students found"
            />
          </div>
        )}

        {/* ── CONTENT MODERATION ── */}
        {tab === 'content' && (
          <div style={panelStyle}>
            <SectionHeader title="Recent Posts" subtitle="Review and remove content" />
            <Table
              cols={[
                { key: 'author', label: 'Author', render: p => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Av name={p.authorName} src={p.authorPhoto} size={30} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{p.authorName}</span>
                  </div>
                )},
                { key: 'content', label: 'Content', render: p => (
                  <span style={{ fontSize: 12, color: A.muted, display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.content}
                  </span>
                )},
                { key: 'likes',    label: '❤️',  render: p => <span style={{ fontSize: 12, color: A.muted }}>{p.likeCount || 0}</span> },
                { key: 'comments', label: '💬',  render: p => <span style={{ fontSize: 12, color: A.muted }}>{p.commentCount || 0}</span> },
                { key: 'actions',  label: '',    render: p => (
                  <button onClick={() => deletePost(p.id)} style={{ background: `${A.red}18`, color: A.red, border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
                    🗑 Delete
                  </button>
                )},
              ]}
              rows={posts}
              emptyMsg="No posts yet"
            />
          </div>
        )}

        {/* ── GROUPS ── */}
        {tab === 'groups' && (
          <div style={panelStyle}>
            <SectionHeader title="All Groups" subtitle={`${groups.length} groups created`} />
            <Table
              cols={[
                { key: 'name',    label: 'Group',   render: g => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{g.icon}</span><span style={{ fontWeight: 700 }}>{g.name}</span></div> },
                { key: 'members', label: 'Members', render: g => <span style={{ fontSize: 13, color: A.accent, fontWeight: 700 }}>{g.memberCount || 0}</span> },
                { key: 'type',    label: 'Type',    render: g => <span style={{ fontSize: 11, color: A.muted }}>{g.isPrivate ? '🔒 Private' : '🌐 Public'}</span> },
                { key: 'desc',    label: 'Description', render: g => <span style={{ fontSize: 12, color: A.muted, display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description || '—'}</span> },
              ]}
              rows={groups}
              emptyMsg="No groups yet"
            />
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === 'events' && (
          <div style={panelStyle}>
            <SectionHeader title="Campus Events" subtitle={`${events.length} events created`} />
            <Table
              cols={[
                { key: 'title',    label: 'Event',    render: e => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{e.icon}</span><span style={{ fontWeight: 700 }}>{e.title}</span></div> },
                { key: 'date',     label: 'Date',     render: e => <span style={{ fontSize: 12, color: A.muted }}>{e.date} {e.time}</span> },
                { key: 'location', label: 'Location', render: e => <span style={{ fontSize: 12, color: A.muted }}>{e.location || '—'}</span> },
                { key: 'rsvp',     label: 'RSVPs',    render: e => <span style={{ fontSize: 13, color: A.green, fontWeight: 700 }}>✓ {e.rsvpCount || 0}</span> },
                { key: 'creator',  label: 'Created by', render: e => <span style={{ fontSize: 12, color: A.muted }}>{e.creatorName}</span> },
              ]}
              rows={events}
              emptyMsg="No events yet"
            />
          </div>
        )}

      </main>
    </div>
  )
}
