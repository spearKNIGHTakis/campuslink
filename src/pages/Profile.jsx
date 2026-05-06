// src/pages/Profile.jsx
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateUserProfile } from '@/lib/db'
import { uploadProfilePhoto } from '@/lib/storage'
import { Avatar, Btn, Card, Input, Textarea, Chip, Modal, Spinner } from '@/components/ui'
import { B } from '@/lib/theme'
import VerificationBanner from '@/components/ui/VerificationBanner'
import toast from 'react-hot-toast'

const INTERESTS = ['AI & ML', 'Photography', 'Chess', 'Startups', 'Open Source', 'Reading', 'Music', 'Sports', 'Gaming', 'Arts', 'Business', 'Medicine', 'Law', 'Engineering']
const PROGRAMS  = ['BSc Computer Science', 'BSc Electrical Engineering', 'BSc Mechanical Engineering', 'BSc Civil Engineering', 'BSc Biochemistry', 'BSc Physics', 'BSc Mathematics', 'BA Economics', 'BA Sociology', 'BA English', 'BSc Nursing', 'BArch Architecture', 'BSc Agricultural Engineering', 'Other']
const YEARS     = ['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Level 500', 'Postgraduate']
const FACULTIES = ['COCS', 'CENG', 'FOBE', 'CASS', 'CANS', 'COHS', 'CAGRIC', 'Other']

/* ✅ Reusable Select Component */
function SelectField({ label, value, onChange, options }) {
  const style = {
    background: `${B.midPurple}12`,
    border: `1.5px solid ${B.inkLight}`,
    borderRadius: 12,
    padding: '11px 14px',
    color: 'var(--cl-text)',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    appearance: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)' }}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <select value={value} onChange={onChange} style={style}>
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <span style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: 12,
          color: 'var(--cl-muted)'
        }}>
          ▼
        </span>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, profile, refreshProfile, logout } = useAuth()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    program: '',
    year: '',
    faculty: '',
    interests: [],
  })

  const fileRef = useRef()

  /* ✅ Sync form with profile */
  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        program: profile.program || '',
        year: profile.year || '',
        faculty: profile.faculty || '',
        interests: profile.interests || [],
      })
    }
  }, [profile])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  function toggleInterest(tag) {
    setForm(f => {
      const exists = f.interests.includes(tag)
      return {
        ...f,
        interests: exists
          ? f.interests.filter(i => i !== tag)
          : [...f.interests, tag],
      }
    })
  }

  async function handleSave() {
    if (!form.displayName.trim()) return toast.error('Name is required')

    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        ...form,
        displayName: form.displayName.trim(),
        bio: form.bio.trim(),
      })
      await refreshProfile()
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image')
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Max size is 2MB')
    }

    setUploading(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      await updateUserProfile(user.uid, { photoURL: url })
      await refreshProfile()
      toast.success('Photo updated!')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  /* ✅ Loading state */
  if (!profile) return <Spinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header Card */}
      <Card style={{ padding: 0 }}>
        <div style={{ height: 110, background: `linear-gradient(135deg, ${B.deepPurple}, ${B.richPurple})` }} />

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
              {uploading ? <Spinner /> : <Avatar src={profile?.photoURL} initials={profile?.displayName} size={70} />}
              <input ref={fileRef} type="file" hidden onChange={handlePhotoUpload} />
            </div>

            <Btn disabled={saving} onClick={() => setEditing(true)}>Edit</Btn>
          </div>

          <h2>{profile?.displayName}</h2>
          <p>{profile?.program || 'No program set'}</p>

          {profile?.interests?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.interests.map(tag => <Chip key={tag} active>{tag}</Chip>)}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'gray' }}>No interests yet</p>
          )}
        </div>
      </Card>

      <VerificationBanner />

      <Btn variant="danger" onClick={logout}>Sign Out</Btn>

      {/* Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Input label="Full Name" value={form.displayName} onChange={set('displayName')} />
          <Textarea label="Bio" value={form.bio} onChange={set('bio')} />

          <SelectField label="Program" value={form.program} onChange={set('program')} options={PROGRAMS} />

          <div style={{ display: 'flex', gap: 10 }}>
            <SelectField label="Year" value={form.year} onChange={set('year')} options={YEARS} />
            <SelectField label="Faculty" value={form.faculty} onChange={set('faculty')} options={FACULTIES} />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {INTERESTS.map(tag => (
                <Chip key={tag} active={form.interests.includes(tag)} onClick={() => toggleInterest(tag)}>
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          <Btn onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Btn>

        </div>
      </Modal>
    </div>
  )
}
