// src/pages/Notifications.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar, Card, Skeleton, Empty } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'

const NOTIF_CONFIG = {
  like:          { icon: 'like',       color: B.coral,         bg: `${B.coral}15`          },
  comment:       { icon: 'comment',    color: B.vibrantPurple, bg: `${B.vibrantPurple}15`  },
  friendRequest: { icon: 'userPlus',   color: B.blue,          bg: `${B.blue}15`            },
  friendAccept:  { icon: 'userCheck',  color: B.mint,          bg: `${B.mint}15`            },
  group:         { icon: 'groups',     color: B.vibrantPurple, bg: `${B.vibrantPurple}15`  },
  event:         { icon: 'events',     color: B.gold,          bg: `${B.gold}15`            },
  message:       { icon: 'messages',   color: B.blue,          bg: `${B.blue}15`            },
  verified:      { icon: 'verified',   color: B.mint,          bg: `${B.mint}15`            },
  default:       { icon: 'notifications', color: 'var(--cl-muted)', bg: 'var(--cl-surface)'},
}

function NotifItem({ notif, onRead, navigate }) {
  const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.default
  const ts  = notif.createdAt?.toDate?.()

  return (
    <div
      onClick={() => { onRead(notif.id); if (notif.link) navigate(notif.link) }}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '14px 16px', cursor: 'pointer',
        background: notif.read ? 'transparent' : `${B.vibrantPurple}06`,
        borderBottom: '1px solid var(--cl-border)',
        transition: 'background 0.2s',
        position: 'relative',
      }}
    >
      {/* Icon bubble */}
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: cfg.bg, border: `1.5px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={cfg.icon} size={17} color={cfg.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--cl-text)', lineHeight: 1.5, marginBottom: 4 }}>{notif.message}</div>
        {ts && (
          <div style={{ fontSize: 11, color: 'var(--cl-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={10} color="var(--cl-muted)" />
            {formatDistanceToNow(ts, { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: B.vibrantPurple, flexShrink: 0, marginTop: 4, boxShadow: `0 0 6px ${B.vibrantPurple}` }} />
      )}
    </div>
  )
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead } = useNotifications()

  const unread = notifications.filter(n => !n.read)
  const read   = notifications.filter(n => n.read)

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="notifications" size={20} color={B.vibrantPurple} />
            Notifications
          </div>
          {unreadCount > 0 && (
            <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginTop: 2 }}>{unreadCount} unread</div>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => unread.forEach(n => markRead(n.id))}
            style={{ background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, padding: '7px 14px', color: B.vibrantPurple, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="check" size={11} color={B.vibrantPurple} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <Empty icon="notifications" title="No notifications yet" subtitle="When someone likes your post or sends a friend request, you'll see it here" />
        </Card>
      ) : (
        <>
          {unread.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cl-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>New</div>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {unread.map(n => <NotifItem key={n.id} notif={n} onRead={markRead} navigate={navigate} />)}
              </Card>
            </div>
          )}
          {read.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cl-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Earlier</div>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {read.map(n => <NotifItem key={n.id} notif={n} onRead={markRead} navigate={navigate} />)}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
