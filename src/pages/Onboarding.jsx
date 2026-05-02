// src/pages/Onboarding.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { updateUserProfile } from '@/lib/db'
import { awardPoints } from '@/lib/reputation'
import { UNIVERSITIES, getDepartments, YEARS } from '@/lib/universities'
import { Btn } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

const INTERESTS = ['AI & ML','Photography','Chess','Startups','Open Source','Reading','Music','Sports','Gaming','Arts','Business','Medicine','Law','Engineering','Robotics','Entrepreneurship','Design','Research']

const STEPS = ['Welcome','University','Program','Interests','Done']

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]   = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm]   = useState({
    university: '', faculty: '', program: '', year: '', interests: [], bio: '',
  })

  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const departments = getDepartments(form.university)

  function toggleInterest(tag) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(tag) ? f.interests.filter(i => i !== tag) : [...f.interests, tag]
    }))
  }

  async function finish() {
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        ...form,
        status: 'approved', // auto-approve after onboarding for now
        isVerified: true,
        updatedAt: new Date(),
      })
      await awardPoints(user.uid, 'PROFILE_COMPLETE')
      await refreshProfile()
      toast.success('Welcome to CampusLink! 🎉')
      navigate('/feed')
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cl-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

      {/* Decorative orbs */}
      <div style={{ position: 'fixed', top: '5%', left: '10%', width: 250, height: 250, borderRadius: '50%', background: `${B.midPurple}15`, filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 180, height: 180, borderRadius: '50%', background: `${B.vibrantPurple}10`, filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            <span style={{ color: 'var(--cl-text)' }}>Campus</span>
            <span style={{ color: B.vibrantPurple }}>Link</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: B.vibrantPurple }}>Step {step + 1} of {STEPS.length}</span>
            <span style={{ fontSize: 12, color: 'var(--cl-muted)' }}>{STEPS[step]}</span>
          </div>
          <div style={{ height: 6, background: 'var(--cl-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${B.midPurple}, ${B.vibrantPurple})`, borderRadius: 3, transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: `0 0 10px ${B.vibrantPurple}60` }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? B.vibrantPurple : 'var(--cl-border)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--cl-surface)', border: '1px solid var(--cl-border)', borderRadius: 24, padding: 28 }}>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 12 }}>Welcome to CampusLink!</div>
              <p style={{ color: 'var(--cl-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Ghana's first university-only social network. Connect with students across all Ghanaian universities, join study groups, discover campus events, and build your academic network.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[['🔒 Verified students only', 'Every account is verified for authenticity'],['📚 Academic tools', 'GPA tracker, marketplace, study rooms'],['🏆 Earn reputation', 'Get recognised for your contributions']].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: `${B.midPurple}15`, borderRadius: 12, padding: '12px 14px', textAlign: 'left' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'var(--cl-muted)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Btn onClick={() => setStep(1)} style={{ width: '100%', padding: 14, fontSize: 15 }}>Let's get started →</Btn>
            </div>
          )}

          {/* Step 1: University */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 6 }}>🏫 Your University</div>
              <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginBottom: 20 }}>Which Ghanaian university do you attend?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {UNIVERSITIES.map(uni => (
                  <button key={uni.id} onClick={() => set('university')(uni.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 14, border: `2px solid ${form.university === uni.id ? B.vibrantPurple : 'var(--cl-border)'}`, background: form.university === uni.id ? `${B.vibrantPurple}15` : 'var(--cl-bg)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.18s' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>{uni.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{uni.location} · {uni.full}</div>
                    </div>
                    {form.university === uni.id && <span style={{ color: B.vibrantPurple, fontSize: 18 }}>✓</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={() => setStep(0)} style={{ flex: 1, padding: 12 }}>← Back</Btn>
                <Btn onClick={() => form.university ? setStep(2) : toast.error('Select a university')} style={{ flex: 2, padding: 12 }}>Continue →</Btn>
              </div>
            </div>
          )}

          {/* Step 2: Program */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 6 }}>📚 Your Program</div>
              <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginBottom: 20 }}>Tell us what you're studying</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 6 }}>Faculty / Department</label>
                  <select value={form.faculty} onChange={e => set('faculty')(e.target.value)} style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none' }}>
                    <option value="">Select department…</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 6 }}>Program Name</label>
                  <input value={form.program} onChange={e => set('program')(e.target.value)} placeholder="e.g. BSc Computer Science" style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 6 }}>Year / Level</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {YEARS.map(y => (
                      <button key={y} onClick={() => set('year')(y)} style={{ padding: '7px 14px', borderRadius: 20, border: `2px solid ${form.year === y ? B.vibrantPurple : 'var(--cl-border)'}`, background: form.year === y ? `${B.vibrantPurple}20` : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: form.year === y ? B.vibrantPurple : 'var(--cl-muted)', fontFamily: 'inherit', transition: 'all 0.18s' }}>{y}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex: 1, padding: 12 }}>← Back</Btn>
                <Btn onClick={() => form.program && form.year ? setStep(3) : toast.error('Fill in your program and year')} style={{ flex: 2, padding: 12 }}>Continue →</Btn>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 6 }}>✨ Your Interests</div>
              <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginBottom: 20 }}>Pick at least 3 — we'll personalise your feed</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {INTERESTS.map(tag => (
                  <button key={tag} onClick={() => toggleInterest(tag)} style={{ padding: '7px 14px', borderRadius: 20, border: `2px solid ${form.interests.includes(tag) ? B.vibrantPurple : 'var(--cl-border)'}`, background: form.interests.includes(tag) ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: form.interests.includes(tag) ? '#fff' : 'var(--cl-muted)', fontFamily: 'inherit', transition: 'all 0.18s' }}>
                    {tag}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginBottom: 16 }}>{form.interests.length} selected</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={() => setStep(2)} style={{ flex: 1, padding: 12 }}>← Back</Btn>
                <Btn onClick={() => form.interests.length >= 3 ? setStep(4) : toast.error('Pick at least 3 interests')} style={{ flex: 2, padding: 12 }}>Continue →</Btn>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', marginBottom: 12 }}>You're all set!</div>
              <p style={{ color: 'var(--cl-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                Welcome to CampusLink, {user?.displayName?.split(' ')[0]}. Your profile is ready. Join study groups, connect with classmates, and explore campus events.
              </p>
              <div style={{ background: `${B.mint}15`, border: `1px solid ${B.mint}30`, borderRadius: 14, padding: '12px 16px', marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: B.mint, marginBottom: 6 }}>🎁 You earned 20 reputation points for completing your profile!</div>
                <div style={{ fontSize: 12, color: 'var(--cl-muted)' }}>Keep earning points by posting, joining groups, and helping others.</div>
              </div>
              <Btn onClick={finish} disabled={saving} style={{ width: '100%', padding: 14, fontSize: 15 }}>
                {saving ? 'Setting up…' : 'Enter CampusLink →'}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
