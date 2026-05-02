// src/pages/VerifyEmail.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Btn } from '@/components/ui'
import { B } from '@/lib/theme'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)

  async function resend() {
    setSending(true)
    try {
      await sendEmailVerification(auth.currentUser)
      toast.success('Verification email sent!')
    } catch {
      toast.error('Could not resend. Wait a moment and try again.')
    } finally {
      setSending(false)
    }
  }

  async function checkVerified() {
    await auth.currentUser?.reload()
    if (auth.currentUser?.emailVerified) {
      toast.success('Email verified!')
      navigate('/upload-id')
    } else {
      toast.error('Email not verified yet. Check your inbox.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cl-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 8 }}>Verify your email</div>
        <p style={{ color: 'var(--cl-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          We sent a verification link to
        </p>
        <div style={{ color: B.vibrantPurple, fontWeight: 700, fontSize: 15, marginBottom: 24 }}>
          {user?.email}
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          Open the link in your email, then come back here to continue.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn onClick={checkVerified} style={{ width: '100%', padding: 12, fontSize: 14 }}>
            I've verified my email ✓
          </Btn>
          <Btn onClick={resend} variant="outline" disabled={sending} style={{ width: '100%', padding: 12, fontSize: 14 }}>
            {sending ? 'Sending…' : 'Resend verification email'}
          </Btn>
          <Btn onClick={logout} variant="ghost" style={{ width: '100%', padding: 12, fontSize: 14 }}>
            Sign out
          </Btn>
        </div>
      </div>
    </div>
  )
}
