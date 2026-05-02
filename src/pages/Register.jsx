// src/pages/Register.jsx
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
      {loading ? 'Signing up…' : 'Sign up with Google'}
    </button>
  )
}

export default function Register() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.displayName.trim()) e.displayName = 'Full name is required'
    if (!form.email.includes('@'))  e.email = 'Enter a valid email address'
    if (form.password.length < 8)   e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.email.trim(), form.password, form.displayName.trim())
      toast.success('Account created! Please verify your email.')
      navigate('/verify-email')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.message
      toast.error(msg)
    } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setGLoading(true)
    try {
      await loginWithGoogle()
      // Page will redirect to Google then back — no navigate() needed
    } catch (err) {
      toast.error('Google sign-up failed')
      setGLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'var(--cl-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
            <span style={{ color: 'var(--cl-text)' }}>Campus</span>
            <span style={{ color: B.vibrantPurple }}>Link</span>
          </div>
          <div style={{ color: 'var(--cl-muted)', fontSize: 13, marginTop: 6 }}>Join the KNUST student network</div>
        </div>

        <div style={{ background: 'var(--cl-surface)', border: '1px solid var(--cl-border)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--cl-text)', marginBottom: 20 }}>Create your account</div>

          {/* Google button */}
          <GoogleBtn onClick={handleGoogle} loading={gLoading} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--cl-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--cl-muted)', fontWeight: 600 }}>or sign up with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--cl-border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Full Name" placeholder="e.g. Ama Owusu" value={form.displayName} onChange={set('displayName')} error={errors.displayName} />
            <Input label="Email" type="email" placeholder="name@st.knust.edu.gh" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} error={errors.password} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

            <p style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.5 }}>
              By registering you agree to our Terms of Service. Your student identity will be verified before full access is granted.
            </p>

            <Btn type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 14 }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </Btn>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--cl-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: B.vibrantPurple, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
