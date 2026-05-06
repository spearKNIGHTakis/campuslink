// src/components/layout/AppShell.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import NotifDropdown from '@/components/ui/NotifDropdown'
import { B } from '@/lib/theme'
import { getBadge } from '@/lib/reputation'

const NAV = [
  { path: '/feed',          icon: 'home',          label: 'Home'          },
  { path: '/explore',       icon: 'explore',       label: 'Explore'       },
  { path: '/search',        icon: 'search',        label: 'Search'        },
  { path: '/friends',       icon: 'friends',       label: 'Friends'       },
  { path: '/groups',        icon: 'groups',        label: 'Groups'        },
  { path: '/events',        icon: 'events',        label: 'Events'        },
  { path: '/messages',      icon: 'messages',      label: 'Messages'      },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
  { path: '/marketplace',   icon: 'marketplace',   label: 'Marketplace'   },
  { path: '/leaderboard',   icon: 'leaderboard',   label: 'Leaderboard'   },
  { path: '/assignments',   icon: 'assignments',   label: 'Assignments'   },
  { path: '/gpa',           icon: 'gpa',           label: 'GPA Tracker'   },
  { path: '/studyrooms',    icon: 'studyrooms',    label: 'Study Rooms'   },
  { path: '/profile',       icon: 'profile',       label: 'Profile'       },
]

const MOBILE_NAV = [
  { path: '/feed',          icon: 'home',          label: 'Home'     },
  { path: '/explore',       icon: 'explore',       label: 'Explore'  },
  { path: '/friends',       icon: 'friends',       label: 'Friends'  },
  { path: '/messages',      icon: 'messages',      label: 'Messages' },
  { path: '/notifications', icon: 'notifications', label: 'Alerts'   },
]

function SidebarNavItem({ item, active, unreadCount }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(item.path)} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
      border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left',
      background: active ? `${B.vibrantPurple}18` : 'transparent',
      borderLeft: `3px solid ${active ? B.vibrantPurple : 'transparent'}`,
      borderRadius: '0 12px 12px 0',
      color: active ? B.vibrantPurple : 'var(--cl-muted)',
      fontWeight: active ? 700 : 500, fontSize: 13,
      transition: 'all 0.18s', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Icon name={item.icon} size={15} color={active ? B.vibrantPurple : 'var(--cl-muted)'} style={{ width: 20, textAlign: 'center' }} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {unreadCount > 0 && (
        <span style={{ background: B.coral, color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export default function AppShell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const { unreadCount } = useNotifications()
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef()
  const badge = getBadge(profile?.reputationPoints || 0)

  useEffect(() => {
    function handle(e) { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const isActive = path => location.pathname.startsWith(path)

  return (
    <div className="app-layout">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--cl-border)' }}>
          <div onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="graduation" size={20} color={B.vibrantPurple} />
              <span>
                <span style={{ color: 'var(--cl-text)' }}>Campus</span>
                <span style={{ color: B.vibrantPurple }}>Link</span>
              </span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--cl-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
              Ghana University Network
            </div>
          </div>
        </div>

        {/* User mini-profile */}
        <div onClick={() => navigate('/profile')} style={{ padding: '14px 16px', borderBottom: '1px solid var(--cl-border)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Avatar src={profile?.photoURL} initials={profile?.displayName} size={38} glow />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              {profile?.displayName || 'Student'}
              {profile?.isVerified && <Icon name="verified" size={12} color={B.mint} />}
            </div>
            <div style={{ fontSize: 11, color: 'var(--cl-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.university || 'University'} · {profile?.year || ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <span style={{ fontSize: 10 }}>{badge.icon}</span>
              <span style={{ fontSize: 10, color: badge.color, fontWeight: 700 }}>{badge.label}</span>
              <span style={{ fontSize: 10, color: 'var(--cl-muted)' }}>· {profile?.reputationPoints || 0}pts</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--cl-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 20px 4px' }}>Main</div>
          {NAV.slice(0, 8).map(item => (
            <SidebarNavItem key={item.path} item={item} active={isActive(item.path)}
              unreadCount={item.path === '/messages' ? unreadCount : 0} />
          ))}
          <div style={{ fontSize: 10, color: 'var(--cl-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 20px 4px' }}>Academic</div>
          {NAV.slice(8).map(item => (
            <SidebarNavItem key={item.path} item={item} active={isActive(item.path)} unreadCount={0} />
          ))}
        </nav>

        {/* Admin */}
        {profile?.isAdmin && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--cl-border)' }}>
            <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', border: `1px solid ${B.vibrantPurple}40`, borderRadius: 10, width: '100%', background: `${B.vibrantPurple}10`, color: B.vibrantPurple, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Icon name="admin" size={13} color={B.vibrantPurple} />
              Admin Dashboard
            </button>
          </div>
        )}

        {/* University badge */}
        {profile?.university && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--cl-border)' }}>
            <div style={{ background: `${B.midPurple}20`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: B.vibrantPurple, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Icon name="university" size={11} color={B.vibrantPurple} />
                {profile.university}
              </div>
              {profile?.faculty && <div style={{ fontSize: 10, color: 'var(--cl-muted)', marginTop: 2 }}>{profile.faculty}</div>}
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">

        {/* Mobile header */}
        <header className="mobile-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => navigate('/feed')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="graduation" size={18} color={B.vibrantPurple} />
            <span style={{ fontSize: 18, fontWeight: 800 }}>
              <span style={{ color: 'var(--cl-text)' }}>Campus</span>
              <span style={{ color: B.vibrantPurple }}>Link</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button onClick={() => setShowNotif(s => !s)} style={{ background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bell" size={15} color={B.vibrantPurple} />
              </button>
              {unreadCount > 0 && <div style={{ position: 'absolute', top: 3, right: 3, width: 9, height: 9, borderRadius: '50%', background: B.coral, border: '2px solid var(--cl-surface)' }} />}
              {showNotif && <NotifDropdown onClose={() => setShowNotif(false)} />}
            </div>
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <Avatar src={profile?.photoURL} initials={profile?.displayName} size={34} />
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="desktop-only" style={{ height: 'var(--header-h)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 28px', borderBottom: '1px solid var(--cl-border)', background: 'var(--cl-surface)', position: 'sticky', top: 0, zIndex: 40, gap: 12 }}>
          {/* Search bar */}
          <div onClick={() => navigate('/search')} style={{ flex: 1, maxWidth: 420, display: 'flex', alignItems: 'center', gap: 10, background: `${B.midPurple}15`, border: `1px solid var(--cl-border)`, borderRadius: 12, padding: '9px 14px', cursor: 'text' }}>
            <Icon name="search" size={14} color="var(--cl-muted)" />
            <span style={{ fontSize: 13, color: 'var(--cl-muted)' }}>Search students, groups, events…</span>
          </div>

          {/* Notification */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => setShowNotif(s => !s)} style={{ background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bell" size={15} color={B.vibrantPurple} />
            </button>
            {unreadCount > 0 && <div style={{ position: 'absolute', top: 4, right: 4, width: 9, height: 9, borderRadius: '50%', background: B.coral, border: '2px solid var(--cl-surface)', boxShadow: `0 0 6px ${B.coral}` }} />}
            {showNotif && <NotifDropdown onClose={() => setShowNotif(false)} />}
          </div>

          {/* Admin shortcut */}
          {profile?.isAdmin && (
            <button onClick={() => navigate('/admin')} style={{ background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, padding: '8px 14px', color: B.vibrantPurple, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="admin" size={13} color={B.vibrantPurple} />
              Admin
            </button>
          )}
        </header>

        {/* Page */}
        <main style={{ flex: 1 }}>{children}</main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-nav" style={{ justifyContent: 'space-around' }}>
        {MOBILE_NAV.map(({ path, icon, label }) => {
          const active = isActive(path)
          return (
            <button key={path} onClick={() => navigate(path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 10px', border: 'none', background: 'none', color: active ? B.vibrantPurple : 'var(--cl-muted)', fontFamily: 'inherit', cursor: 'pointer', position: 'relative', minWidth: 52 }}>
              <Icon name={icon} size={18} color={active ? B.vibrantPurple : 'var(--cl-muted)'} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em' }}>{label}</span>
              {active && <div style={{ position: 'absolute', bottom: -2, width: 20, height: 3, borderRadius: 2, background: `linear-gradient(90deg,${B.midPurple},${B.vibrantPurple})`, boxShadow: `0 0 8px ${B.vibrantPurple}` }} />}
              {path === '/messages' && unreadCount > 0 && (
                <div style={{ position: 'absolute', top: 2, right: 6, width: 8, height: 8, borderRadius: '50%', background: B.coral, boxShadow: `0 0 6px ${B.coral}` }} />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
