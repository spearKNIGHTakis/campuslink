// src/components/layout/PrivateRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui'
import { B } from '@/lib/theme'

export default function PrivateRoute({ children }) {
  const { user, profile, loading, isEmailVerified } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: 'var(--cl-text)' }}>Campus</span>
          <span style={{ color: B.vibrantPurple }}>Link</span>
        </div>
        <Spinner />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Only enforce email verification for email/password accounts
  // Google accounts are always verified
  const isGoogle = user.providerData?.[0]?.providerId === 'google.com'
  if (!isGoogle && !isEmailVerified) return <Navigate to="/verify-email" replace />

  if (profile?.status === 'pending' && profile?.verificationStep === 1)
    return <Navigate to="/upload-id" replace />
  if (profile?.status === 'pending' && profile?.verificationStep === 2)
    return <Navigate to="/pending-approval" replace />

  return children
}
