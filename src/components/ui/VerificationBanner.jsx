// src/components/ui/VerificationBanner.jsx
// Shows on profile if user is not yet verified as a student
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Icon from './Icon'
import { B } from '@/lib/theme'

export default function VerificationBanner() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if verified or dismissed or pending review
  if (profile?.isVerified)              return null
  if (profile?.verificationStep === 2)  return null // submitted, awaiting review
  if (dismissed)                        return null

  return (
    <div style={{
      background: `linear-gradient(135deg, #1C1040, #2A1555)`,
      border: `1px solid ${B.vibrantPurple}40`,
      borderRadius: 16, padding: 16, marginBottom: 16,
      position: 'relative',
    }}>
      {/* Dismiss */}
      <button onClick={() => setDismissed(true)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: 'var(--cl-muted)', cursor: 'pointer', fontSize: 16 }}>
        <Icon name="close" size={13} color="var(--cl-muted)" />
      </button>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${B.vibrantPurple}20`, border: `1.5px solid ${B.vibrantPurple}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="badge" size={20} color={B.vibrantPurple} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--cl-text)', marginBottom: 4 }}>
            Get your Student Verified badge
          </div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Upload your student ID to earn the <span style={{ color: B.mint, fontWeight: 700 }}>✓ Verified</span> badge.
            It appears on your profile and all your posts — letting other students know you're the real deal.
          </div>

          {/* Perks */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {[
              { icon: 'verified', label: '✓ badge on profile' },
              { icon: 'star',     label: '+50 reputation pts' },
              { icon: 'users',    label: 'More friend suggestions' },
              { icon: 'medal',    label: 'Leaderboard priority' },
            ].map(perk => (
              <span key={perk.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: B.vibrantPurple, background: `${B.vibrantPurple}15`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${B.vibrantPurple}25` }}>
                <Icon name={perk.icon} size={9} color={B.vibrantPurple} />
                {perk.label}
              </span>
            ))}
          </div>

          <button onClick={() => navigate('/get-verified')} style={{
            background: `linear-gradient(135deg, ${B.midPurple}, ${B.vibrantPurple})`,
            border: 'none', borderRadius: 10, padding: '9px 18px',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: `0 4px 14px ${B.midPurple}60`,
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Icon name="upload" size={12} color="#fff" />
            Get Verified — It's Free
          </button>
        </div>
      </div>
    </div>
  )
}
