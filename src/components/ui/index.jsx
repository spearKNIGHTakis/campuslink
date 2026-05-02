// src/components/ui/index.jsx
import { B } from '@/lib/theme'

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ src, initials = '?', size = 40, glow = false, online = false }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {src ? (
        <img src={src} alt={initials}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
            border: `2px solid ${B.vibrantPurple}40`,
            boxShadow: glow ? `0 0 16px ${B.vibrantPurple}60` : 'none' }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: `linear-gradient(135deg, ${B.midPurple}, ${B.vibrantPurple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.34, fontWeight: 800, color: '#fff',
          border: `2px solid ${B.vibrantPurple}40`,
          boxShadow: glow ? `0 0 16px ${B.vibrantPurple}60` : 'none',
        }}>
          {(initials || '?').slice(0, 2).toUpperCase()}
        </div>
      )}
      {online && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.25, height: size * 0.25, borderRadius: '50%',
          background: B.mint, border: `2px solid var(--cl-bg)`,
          boxShadow: `0 0 6px ${B.mint}`,
        }} />
      )}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, type = 'button' }) {
  const sizes = { sm: '5px 12px', md: '9px 20px', lg: '12px 28px' }
  const fontSize = { sm: 12, md: 13, lg: 15 }
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${B.midPurple} 0%, ${B.vibrantPurple} 100%)`,
      color: '#fff', border: 'none',
      boxShadow: `0 4px 16px ${B.midPurple}60`,
    },
    outline: {
      background: 'transparent', color: B.vibrantPurple,
      border: `1.5px solid ${B.vibrantPurple}60`,
    },
    ghost: {
      background: `${B.vibrantPurple}12`, color: B.vibrantPurple,
      border: `1px solid ${B.vibrantPurple}25`,
    },
    danger: {
      background: `${B.coral}20`, color: B.coral,
      border: `1px solid ${B.coral}40`,
    },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...variants[variant],
      padding: sizes[size], fontSize: fontSize[size],
      fontWeight: 700, borderRadius: 10,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.18s',
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)' }}>{label}</label>}
      <input {...props} style={{
        background: `${B.midPurple}12`,
        border: `1.5px solid ${error ? B.coral : B.inkLight}`,
        borderRadius: 12, padding: '11px 14px',
        color: 'var(--cl-text)', fontSize: 14, outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s',
        ...style,
      }} />
      {error && <span style={{ fontSize: 12, color: B.coral }}>{error}</span>}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)' }}>{label}</label>}
      <textarea {...props} style={{
        background: `${B.midPurple}12`,
        border: `1.5px solid ${error ? B.coral : B.inkLight}`,
        borderRadius: 12, padding: '11px 14px',
        color: 'var(--cl-text)', fontSize: 14, outline: 'none',
        resize: 'none', width: '100%',
        ...style,
      }} />
      {error && <span style={{ fontSize: 12, color: B.coral }}>{error}</span>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--cl-surface)',
      border: '1px solid var(--cl-border)',
      borderRadius: 18, padding: 16,
      boxShadow: `0 2px 16px ${B.deepPurple}40`,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ count }) {
  if (!count) return null
  return (
    <span style={{
      background: B.coral, color: '#fff', borderRadius: 10,
      fontSize: 10, fontWeight: 800, padding: '1px 7px',
      boxShadow: `0 2px 8px ${B.coral}60`,
      minWidth: 18, textAlign: 'center', display: 'inline-block',
    }}>{count > 99 ? '99+' : count}</span>
  )
}

// ── Chip / Tag ────────────────────────────────────────────────────────────────
export function Chip({ children, active, onClick }) {
  return (
    <span onClick={onClick} style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, cursor: onClick ? 'pointer' : 'default',
      background: active
        ? `linear-gradient(135deg, ${B.midPurple}, ${B.vibrantPurple})`
        : `${B.vibrantPurple}18`,
      color: active ? '#fff' : B.vibrantPurple,
      border: `1px solid ${active ? 'transparent' : B.vibrantPurple + '40'}`,
      transition: 'all 0.2s',
    }}>{children}</span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: 'var(--cl-border)', margin: '8px 0' }} />
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--cl-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      {title && <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cl-text)', marginBottom: 6 }}>{title}</div>}
      {subtitle && <div style={{ fontSize: 13 }}>{subtitle}</div>}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid ${B.inkLight}`,
      borderTopColor: B.vibrantPurple,
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10,2,22,0.85)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--cl-surface)',
        border: '1px solid var(--cl-border)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 32px',
        width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--cl-text)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--cl-muted)', fontSize: 22 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── FA Icon re-export convenience ─────────────────────────────────────────────
export { default as Icon } from './Icon'
