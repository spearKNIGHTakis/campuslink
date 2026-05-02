// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Input, Btn } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return toast.error('Enter your email address')
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch { toast.error('Could not send reset email. Check the address.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cl-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)' }}>Reset your password</div>
          <div style={{ color: 'var(--cl-muted)', fontSize: 13, marginTop: 6 }}>We'll send you a reset link</div>
        </div>

        {sent ? (
          <div style={{ background: 'var(--cl-surface)', border: `1px solid ${B.mint}50`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', marginBottom: 8 }}>Check your email</div>
            <p style={{ color: 'var(--cl-muted)', fontSize: 13, lineHeight: 1.6 }}>
              A password reset link has been sent to <strong style={{ color: B.vibrantPurple }}>{email}</strong>.
            </p>
            <Link to="/login" style={{ display: 'block', marginTop: 20, color: B.vibrantPurple, fontWeight: 700, textDecoration: 'none' }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <div style={{ background: 'var(--cl-surface)', border: '1px solid var(--cl-border)', borderRadius: 20, padding: 24 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Email address" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              <Btn type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Btn>
            </form>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: B.vibrantPurple, fontWeight: 700, textDecoration: 'none' }}>
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
