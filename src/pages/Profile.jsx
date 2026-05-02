// src/pages/Profile.jsx
import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateUserProfile } from '@/lib/db'
import { uploadProfilePhoto } from '@/lib/storage'
import { Avatar, Btn, Card, Input, Textarea, Chip, Modal, Spinner } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

const INTERESTS = ['AI & ML', 'Photography', 'Chess', 'Startups', 'Open Source', 'Reading', 'Music', 'Sports', 'Gaming', 'Arts', 'Business', 'Medicine', 'Law', 'Engineering']
const PROGRAMS  = ['BSc Computer Science', 'BSc Electrical Engineering', 'BSc Mechanical Engineering', 'BSc Civil Engineering', 'BSc Biochemistry', 'BSc Physics', 'BSc Mathematics', 'BA Economics', 'BA Sociology', 'BA English', 'BSc Nursing', 'BArch Architecture', 'BSc Agricultural Engineering', 'Other']
const YEARS     = ['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Level 500', 'Postgraduate']
const FACULTIES = ['COCS', 'CENG', 'FOBE', 'CASS', 'CANS', 'COHS', 'CAGRIC', 'Other']

export default function Profile() {
  const { user, profile, refreshProfile, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({
    displayName: profile?.displayName || '',
    bio:         profile?.bio || '',
    program:     profile?.program || '',
    year:        profile?.year || '',
    faculty:     profile?.faculty || '',
    interests:   profile?.interests || [],
  })
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function toggleInterest(tag) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(tag)
        ? f.interests.filter(i => i !== tag)
        : [...f.interests, tag],
    }))
  }

  async function handleSave() {
    if (!form.displayName.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        displayName: form.displayName.trim(),
        bio:         form.bio.trim(),
        program:     form.program,
        year:        form.year,
        faculty:     form.faculty,
        interests:   form.interests,
      })
      await refreshProfile()
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Could not save profile') }
    finally { setSaving(false) }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      await updateUserProfile(user.uid, { photoURL: url })
      await refreshProfile()
      toast.success('Photo updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Cover + avatar card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Cover gradient */}
        <div style={{ height: 110, background: `linear-gradient(135deg, ${B.deepPurple} 0%, ${B.richPurple} 55%, ${B.midPurple} 100%)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, right: 16, width: 80, height: 80, borderRadius: '50%', background: `${B.vibrantPurple}25`, filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: -10, left: 40, width: 50, height: 50, borderRadius: '50%', background: `${B.coral}20`, filter: 'blur(12px)' }} />
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -34 }}>
            {/* Avatar with upload */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              {uploading ? (
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: B.inkMid, border: `3px solid var(--cl-surface)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spinner size={22} />
                </div>
              ) : (
                <Avatar src={profile?.photoURL} initials={profile?.displayName} size={70} glow />
              )}
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: B.vibrantPurple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, border: `2px solid var(--cl-surface)` }}>📷</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </div>
            <Btn variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Btn>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)' }}>{profile?.displayName}</div>
            <div style={{ color: 'var(--cl-muted)', fontSize: 13, marginTop: 2 }}>
              {profile?.program || 'Program not set'} {profile?.year ? `· ${profile.year}` : ''}
            </div>
            {profile?.bio && (
              <p style={{ color: 'var(--cl-text)', fontSize: 13, lineHeight: 1.55, marginTop: 8 }}>{profile.bio}</p>
            )}
            {profile?.interests?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {profile.interests.map(tag => <Chip key={tag} active>{tag}</Chip>)}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 28, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--cl-border)' }}>
            {[['Posts', profile?.postCount || 0], ['Friends', profile?.friendCount || 0], ['Groups', profile?.groupCount || 0]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* About card */}
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 12 }}>About</div>
        {[
          ['🏫', 'KNUST – Kumasi, Ghana'],
          ['📚', profile?.program || 'Program not set'],
          ['🎓', profile?.faculty || 'Faculty not set'],
          ['📈', profile?.year || 'Year not set'],
          ['✉️', user?.email],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 9, fontSize: 13, color: 'var(--cl-muted)' }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </Card>

      {/* Sign out */}
      <Btn variant="danger" onClick={logout} style={{ width: '100%', padding: 12 }}>Sign Out</Btn>

      {/* Edit modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={form.displayName} onChange={set('displayName')} />
          <Textarea label="Bio" value={form.bio} onChange={set('bio')} placeholder="Tell your fellow students about yourself…" style={{ minHeight: 80 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)' }}>Program</label>
            <select value={form.program} onChange={set('program')} style={{ background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none' }}>
              <option value="">Select program</option>
              {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)' }}>Year</label>
              <select value={form.year} onChange={set('year')} style={{ background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', width: '100%' }}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)' }}>Faculty</label>
              <select value={form.faculty} onChange={set('faculty')} style={{ background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', width: '100%' }}>
                <option value="">Faculty</option>
                {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', marginBottom: 8 }}>Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {INTERESTS.map(tag => (
                <Chip key={tag} active={form.interests.includes(tag)} onClick={() => toggleInterest(tag)}>{tag}</Chip>
              ))}
            </div>
          </div>

          <Btn onClick={handleSave} disabled={saving} style={{ width: '100%', padding: 12 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
