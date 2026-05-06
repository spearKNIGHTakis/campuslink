// src/components/layout/PrivateRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui'
import { B } from '@/lib/theme'

export default function PrivateRoute({ children }) {
  const { user, profile, loading, isEmailVerified } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--cl-bg)' }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: 'var(--cl-text)' }}>Campus</span>
          <span style={{ color: B.vibrantPurple }}>Link</span>
        </div>
        <Spinner />
      </div>
    )
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />

  // Email/password users must verify email first
  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com'
  if (!isGoogle && !isEmailVerified) return <Navigate to="/verify-email" replace />

  // Everyone else gets in — no pending/approval gate anymore
  return children
}
