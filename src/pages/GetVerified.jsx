// src/pages/GetVerified.jsx
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { submitVerification } from '@/lib/db'
import { uploadStudentId } from '@/lib/storage'
import { awardPoints } from '@/lib/reputation'
import { Btn, Card } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 'intro',    label: 'Overview'   },
  { id: 'upload',   label: 'Upload ID'  },
  { id: 'done',     label: 'Submitted'  },
]

export default function GetVerified() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  // Already submitted
  if (profile?.verificationStep === 2 || profile?.isVerified) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cl-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{profile?.isVerified ? '✅' : '⏳'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 8 }}>
            {profile?.isVerified ? 'You\'re verified!' : 'Verification pending'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--cl-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            {profile?.isVerified
              ? 'Your student ID has been verified. Your ✓ badge is now live on your profile and posts.'
              : 'Your student ID is under review. We\'ll update your badge within 24 hours.'}
          </div>
          <Btn onClick={() => navigate('/profile')} style={{ width: '100%', padding: 12 }}>
            Back to Profile
          </Btn>
        </div>
      </div>
    )
  }

  function handleFilePick(f) {
    if (!f) return
    const allowed = ['image/jpeg','image/png','image/webp','application/pdf']
    if (!allowed.includes(f.type)) { toast.error('Please upload an image or PDF'); return }
    if (f.size > 10 * 1024 * 1024)  { toast.error('File must be under 10MB'); return }
    setFile(f)
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    handleFilePick(f)
  }, [])

  async function handleSubmit() {
    if (!file) return toast.error('Please upload your student ID first')
    setUploading(true)
    try {
      const url = await uploadStudentId(user.uid, file, pct => setProgress(pct))
      await submitVerification(user.uid, url)
      await awardPoints(user.uid, 'PROFILE_COMPLETE') // +20 for submitting
      await refreshProfile()
      setStep(2)
      toast.success('Submitted! We\'ll review within 24 hours.')
    } catch (e) {
      toast.error('Upload failed — try again')
      console.error(e)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cl-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', width: 60, height: 60, borderRadius: 18, background: `${B.vibrantPurple}20`, border: `2px solid ${B.vibrantPurple}50`, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon name="badge" size={26} color={B.vibrantPurple} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 4 }}>Get Student Verified</div>
          <div style={{ fontSize: 13, color: 'var(--cl-muted)' }}>Earn the <span style={{ color: B.mint, fontWeight: 700 }}>✓ Verified</span> badge on your profile</div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: '100%', height: 3, borderRadius: 2, background: i <= step ? B.vibrantPurple : 'var(--cl-border)', transition: 'background 0.3s', boxShadow: i <= step ? `0 0 6px ${B.vibrantPurple}` : 'none' }} />
              <span style={{ fontSize: 10, color: i <= step ? B.vibrantPurple : 'var(--cl-muted)', fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Intro */}
        {step === 0 && (
          <Card>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--cl-text)', marginBottom: 16 }}>What you'll get</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                { icon: 'verified', color: B.mint,          title: '✓ Verified badge',           desc: 'Shown on your profile, all posts, and in search results' },
                { icon: 'star',     color: B.gold,          title: '+50 reputation points',       desc: 'Instant boost on the leaderboard when approved' },
                { icon: 'users',    color: B.vibrantPurple, title: 'Priority in suggestions',     desc: 'Verified students appear higher in friend discovery' },
                { icon: 'shield',   color: B.blue,          title: 'Trusted community member',    desc: 'Others know you\'re a real student — not a bot' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={item.icon} size={15} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: `${B.gold}10`, border: `1px solid ${B.gold}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="info" size={14} color={B.gold} style={{ marginTop: 1 }} />
                <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: B.gold }}>What we accept:</strong> Any valid university student ID card — physical card photo, digital ID screenshot, or enrollment confirmation letter. Reviews take up to 24 hours.
                </div>
              </div>
            </div>

            <Btn onClick={() => setStep(1)} style={{ width: '100%', padding: 13, fontSize: 14 }}>
              <Icon name="chevronRight" size={13} color="#fff" style={{ marginRight: 6 }} />
              Start Verification
            </Btn>
          </Card>
        )}

        {/* Step 1 — Upload */}
        {step === 1 && (
          <Card>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--cl-text)', marginBottom: 6 }}>Upload your Student ID</div>
            <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Upload a clear photo or scan of your student ID card. All submissions are kept private and only seen by CampusLink admins.
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              style={{
                border: `2px dashed ${dragOver ? B.vibrantPurple : file ? B.mint : 'var(--cl-border)'}`,
                borderRadius: 16, padding: '28px 20px', textAlign: 'center',
                background: dragOver ? `${B.vibrantPurple}08` : file ? `${B.mint}08` : `${B.midPurple}08`,
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: 16,
              }}
            >
              {preview ? (
                <div>
                  <img src={preview} alt="ID preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, objectFit: 'contain', marginBottom: 10 }} />
                  <div style={{ fontSize: 12, color: B.mint, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Icon name="check" size={12} color={B.mint} /> {file.name}
                  </div>
                </div>
              ) : file ? (
                <div>
                  <Icon name="pdf" size={36} color={B.coral} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 13, color: B.mint, fontWeight: 700 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)', marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <div>
                  <Icon name="upload" size={32} color="var(--cl-muted)" style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cl-text)', marginBottom: 4 }}>
                    {dragOver ? 'Drop here' : 'Click or drag to upload'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cl-muted)' }}>JPG, PNG, WEBP or PDF · Max 10MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFilePick(e.target.files?.[0])} />

            {/* Tips */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cl-muted)', marginBottom: 8 }}>Tips for a successful upload:</div>
              {[
                'Make sure your name and university are clearly visible',
                'Good lighting — no glare or shadows',
                'Entire card in frame — don\'t crop the edges',
              ].map(tip => (
                <div key={tip} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
                  <Icon name="check" size={11} color={B.mint} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Upload progress */}
            {uploading && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--cl-muted)' }}>Uploading…</span>
                  <span style={{ fontSize: 12, color: B.vibrantPurple, fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--cl-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${B.midPurple},${B.vibrantPurple})`, borderRadius: 3, transition: 'width 0.2s', boxShadow: `0 0 8px ${B.vibrantPurple}60` }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep(0)} style={{ flex: 1, padding: 12 }} disabled={uploading}>
                <Icon name="back" size={12} style={{ marginRight: 5 }} /> Back
              </Btn>
              <Btn onClick={handleSubmit} disabled={!file || uploading} style={{ flex: 2, padding: 12 }}>
                {uploading ? `Uploading… ${progress}%` : 'Submit for Review'}
              </Btn>
            </div>
          </Card>
        )}

        {/* Step 2 — Done */}
        {step === 2 && (
          <Card style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${B.mint}18`, border: `2px solid ${B.mint}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon name="check" size={32} color={B.mint} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 8 }}>Submitted!</div>
            <div style={{ fontSize: 14, color: 'var(--cl-muted)', lineHeight: 1.7, marginBottom: 28 }}>
              Your student ID is under review. We'll update your profile with the <span style={{ color: B.mint, fontWeight: 700 }}>✓ Verified</span> badge within 24 hours.
            </div>
            <div style={{ background: `${B.vibrantPurple}10`, border: `1px solid ${B.vibrantPurple}25`, borderRadius: 14, padding: '14px 16px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: 'var(--cl-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="info" size={12} color={B.vibrantPurple} /> What happens next
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {['An admin reviews your ID — usually within 24h', 'You\'ll see the ✓ badge appear on your profile', 'You earn +50 reputation points automatically'].map(s => (
                    <div key={s} style={{ display: 'flex', gap: 6 }}>
                      <Icon name="chevronRight" size={10} color={B.vibrantPurple} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Btn onClick={() => navigate('/feed')} style={{ width: '100%', padding: 13 }}>
              Back to Feed
            </Btn>
          </Card>
        )}
      </div>
    </div>
  )
}
