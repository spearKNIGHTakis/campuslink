// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Input, Btn } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

function GoogleBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '11px 16px', borderRadius: 12, cursor: 'pointer',
      background: '#fff', border: '1.5px solid #E2E8F0',
      fontWeight: 700, fontSize: 14, color: '#1A1A2E',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      opacity: loading ? 0.7 : 1,
    }}>
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      {loading ? 'Signing in…' : 'Continue with Google'}
    </button>
  )
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/feed')
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
        err.code === 'auth/too-many-requests'   ? 'Too many attempts. Try again later.' :
        err.message
      toast.error(msg)
    } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setGLoading(true)
    try {
      await loginWithGoogle()
      // Page will redirect to Google then back — no navigate() needed
    } catch (err) {
      toast.error('Google sign-in failed')
      setGLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'var(--cl-bg)' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: `${B.midPurple}18`, filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '5%', width: 150, height: 150, borderRadius: '50%', background: `${B.vibrantPurple}12`, filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
            <span style={{ color: 'var(--cl-text)' }}>Campus</span>
            <span style={{ color: B.vibrantPurple }}>Link</span>
          </div>
          <div style={{ color: 'var(--cl-muted)', fontSize: 13, marginTop: 6 }}>Welcome back, student</div>
        </div>

        <div style={{ background: 'var(--cl-surface)', border: '1px solid var(--cl-border)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--cl-text)', marginBottom: 20 }}>Sign in to your account</div>

          {/* Google button */}
          <GoogleBtn onClick={handleGoogle} loading={gLoading} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--cl-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--cl-muted)', fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--cl-border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
            <Input label="Password" type="password" placeholder="Your password" value={form.password} onChange={set('password')} />
            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: B.vibrantPurple, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
            </div>
            <Btn type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 14 }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </Btn>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--cl-muted)' }}>
          New student?{' '}
          <Link to="/register" style={{ color: B.vibrantPurple, fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
