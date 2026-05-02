// src/pages/UploadID.jsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '@/hooks/useAuth'
import { uploadStudentId } from '@/lib/storage'
import { submitVerification } from '@/lib/db'
import { Btn } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

export default function UploadID() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(accepted => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  async function handleUpload() {
    if (!file) return toast.error('Select your student ID first')
    setUploading(true)
    try {
      const url = await uploadStudentId(user.uid, file, pct => setProgress(pct))
      await submitVerification(user.uid, url)
      await refreshProfile()
      toast.success('ID submitted! Awaiting admin approval.')
      navigate('/pending-approval')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cl-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {[{ n: 1, label: 'Email' }, { n: 2, label: 'Student ID' }, { n: 3, label: 'Approval' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.n <= 2
                  ? `linear-gradient(135deg, ${B.midPurple}, ${B.vibrantPurple})`
                  : B.inkLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: s.n <= 2 ? '#fff' : 'var(--cl-muted)',
              }}>{s.n <= 1 ? '✓' : s.n}</div>
              <span style={{ fontSize: 11, color: s.n === 2 ? B.vibrantPurple : 'var(--cl-muted)', fontWeight: s.n === 2 ? 700 : 400 }}>{s.label}</span>
              {i < 2 && <div style={{ width: 20, height: 1, background: 'var(--cl-border)' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--cl-surface)', border: '1px solid var(--cl-border)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 6 }}>
            Upload your Student ID
          </div>
          <p style={{ color: 'var(--cl-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            Upload a clear photo or scan of your KNUST student ID card. This is reviewed by our team within 24 hours.
          </p>

          {/* Dropzone */}
          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? B.vibrantPurple : B.inkLight}`,
            borderRadius: 14, padding: '28px 20px',
            textAlign: 'center', cursor: 'pointer',
            background: isDragActive ? `${B.vibrantPurple}10` : `${B.midPurple}08`,
            transition: 'all 0.2s', marginBottom: 16,
          }}>
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="ID preview" style={{ maxHeight: 160, borderRadius: 10, objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🪪</div>
                <div style={{ color: 'var(--cl-text)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {isDragActive ? 'Drop it here' : 'Drag & drop your student ID'}
                </div>
                <div style={{ color: 'var(--cl-muted)', fontSize: 12 }}>
                  or tap to browse — JPG, PNG or PDF, max 10MB
                </div>
              </>
            )}
          </div>

          {file && (
            <div style={{ fontSize: 12, color: B.mint, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </div>
          )}

          {uploading && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--cl-muted)', marginBottom: 6 }}>
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div style={{ height: 4, background: B.inkLight, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${B.midPurple}, ${B.vibrantPurple})`, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          <Btn onClick={handleUpload} disabled={!file || uploading} style={{ width: '100%', padding: 12, fontSize: 14 }}>
            {uploading ? 'Submitting…' : 'Submit ID for Review →'}
          </Btn>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.5 }}>
          Your ID is stored securely and only viewed by authorised admins. It is never shared publicly.
        </p>
      </div>
    </div>
  )
}
