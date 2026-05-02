// src/components/ui/NotifDropdown.jsx
import { useNotifications } from '@/hooks/useNotifications'
import Icon from './Icon'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'

const NOTIF_ICONS = {
  like:          { name: 'like',     color: B.coral          },
  comment:       { name: 'comment',  color: B.vibrantPurple  },
  friendRequest: { name: 'friends',  color: B.blue           },
  friendAccept:  { name: 'verified', color: B.mint           },
  event:         { name: 'events',   color: B.gold           },
  group:         { name: 'groups',   color: B.vibrantPurple  },
  default:       { name: 'bell',     color: 'var(--cl-muted)'},
}

export default function NotifDropdown({ onClose }) {
  const { notifications, markRead } = useNotifications()

  async function handleClick(notif) {
    if (!notif.read) await markRead(notif.id)
    onClose()
  }

  return (
    <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 300, width: 320, maxHeight: 440, overflowY: 'auto', background: 'var(--cl-surface)', border: '1px solid var(--cl-border)', borderRadius: 18, boxShadow: `0 16px 48px ${B.deepPurple}90` }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--cl-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14 }}>Notifications</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cl-muted)' }}>
          <Icon name="close" size={14} />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--cl-muted)' }}>
          <Icon name="bell" size={32} style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 13 }}>No notifications yet</div>
        </div>
      ) : notifications.map(n => {
        const iconDef = NOTIF_ICONS[n.type] || NOTIF_ICONS.default
        const ts      = n.createdAt?.toDate?.()
        return (
          <div key={n.id} onClick={() => handleClick(n)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', cursor: 'pointer', background: n.read ? 'transparent' : `${B.vibrantPurple}08`, borderBottom: '1px solid var(--cl-border)', transition: 'background 0.15s' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${iconDef.color}18`, border: `1px solid ${iconDef.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={iconDef.name} size={14} color={iconDef.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--cl-text)', lineHeight: 1.45 }}>{n.message}</div>
              {ts && <div style={{ fontSize: 10, color: 'var(--cl-muted)', marginTop: 4 }}>{formatDistanceToNow(ts, { addSuffix: true })}</div>}
            </div>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: B.vibrantPurple, flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${B.vibrantPurple}` }} />}
          </div>
        )
      })}
    </div>
  )
}
