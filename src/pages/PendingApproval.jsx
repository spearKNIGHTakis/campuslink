// src/pages/PendingApproval.jsx
import { useAuth } from '@/hooks/useAuth'
import { Btn } from '@/components/ui'
import { B } from '@/lib/theme'
import { useNavigate } from 'react-router-dom'

export default function PendingApproval() {
  const { logout, refreshProfile } = useAuth()
  const navigate = useNavigate()

  async function checkStatus() {
    await refreshProfile()
    navigate('/feed')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cl-bg)', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 10 }}>
        Verification in progress
      </div>
      <p style={{ color: 'var(--cl-muted)', fontSize: 14, lineHeight: 1.65, maxWidth: 340, marginBottom: 28 }}>
        Your student ID has been submitted. Our team reviews submissions within <strong style={{ color: B.vibrantPurple }}>24 hours</strong>. You'll get access as soon as you're approved.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        <Btn onClick={checkStatus} style={{ width: '100%', padding: 12 }}>Check my status</Btn>
        <Btn onClick={logout} variant="ghost" style={{ width: '100%', padding: 12 }}>Sign out</Btn>
      </div>
    </div>
  )
}
