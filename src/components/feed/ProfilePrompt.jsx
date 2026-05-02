// src/components/feed/ProfilePrompt.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'

export default function ProfilePrompt() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const checks = [
    { label: 'Profile photo',  done: !!profile?.photoURL,                         icon: 'image'    },
    { label: 'Bio',            done: !!profile?.bio,                               icon: 'pen'      },
    { label: 'Program & year', done: !!(profile?.program && profile?.year),        icon: 'book'     },
    { label: '3+ interests',   done: (profile?.interests?.length || 0) >= 3,       icon: 'star'     },
  ]
  const completed = checks.filter(c => c.done).length
  const pct       = Math.round((completed / checks.length) * 100)
  if (pct === 100) return null

  return (
    <div style={{ background: `linear-gradient(135deg, ${B.deepPurple}, ${B.richPurple})`, border: `1px solid ${B.midPurple}50`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>
            <Icon name="user" size={12} color="#fff" style={{ marginRight: 6 }} />
            Complete your profile
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{pct}% done · {4 - completed} step{4 - completed !== 1 ? 's' : ''} remaining</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: B.vibrantPurple }}>{pct}%</div>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${B.midPurple},${B.vibrantPurple})`, borderRadius: 3, transition: 'width 0.5s', boxShadow: `0 0 8px ${B.vibrantPurple}` }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {checks.map(c => (
          <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, background: c.done ? `${B.mint}25` : 'rgba(255,255,255,0.1)', color: c.done ? B.mint : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            <Icon name={c.done ? 'check' : c.icon} size={9} color={c.done ? B.mint : 'rgba(255,255,255,0.4)'} />
            {c.label}
          </span>
        ))}
      </div>
      <button onClick={() => navigate('/profile')} style={{ background: `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})`, border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="edit" size={11} color="#fff" />
        Complete Profile
      </button>
    </div>
  )
}
