// src/pages/Marketplace.jsx
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadFile } from '@/lib/storage'
import { awardPoints } from '@/lib/reputation'
import { Card, Btn, Modal, Input, Textarea, Skeleton, Empty, Chip } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

const TYPES    = ['Past Paper', 'Lecture Notes', 'Textbook', 'Assignment Solution', 'Summary', 'Other']
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Engineering', 'Law', 'Medicine', 'Business', 'Other']

function ResourceCard({ item, uid, onBuy }) {
  const isMine = item.sellerId === uid
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, fontWeight: 700, background: `${B.vibrantPurple}20`, color: B.vibrantPurple, padding: '3px 10px', borderRadius: 20 }}>{item.type}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: item.price > 0 ? B.gold : B.mint }}>{item.price > 0 ? `GH₵${item.price}` : 'Free'}</span>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--cl-text)', marginBottom: 4 }}>{item.title}</div>
        {item.description && <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.5 }}>{item.description}</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item.courseCode && <Chip>{item.courseCode}</Chip>}
        {item.subject && <Chip>{item.subject}</Chip>}
        {item.year && <Chip>Year {item.year}</Chip>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid var(--cl-border)` }}>
        <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>
          By {item.sellerName} · {item.downloads || 0} downloads
        </div>
        {!isMine && (
          item.price > 0
            ? <Btn size="sm" onClick={() => onBuy(item)}>Buy GH₵{item.price}</Btn>
            : <a href={item.fileURL} target="_blank" rel="noreferrer" download>
                <Btn size="sm" variant="ghost">⬇ Download</Btn>
              </a>
        )}
        {isMine && <span style={{ fontSize: 11, color: B.vibrantPurple, fontWeight: 700 }}>Your listing</span>}
      </div>
    </Card>
  )
}

export default function Marketplace() {
  const { user, profile } = useAuth()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showCreate, setCreate] = useState(false)
  const [tab, setTab]           = useState('all')
  const [filterType, setFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setProgress] = useState(0)
  const fileRef = useRef()
  const [form, setForm] = useState({ title: '', description: '', courseCode: '', subject: '', type: 'Past Paper', price: '0', year: '' })
  const [file, setFile] = useState(null)

  useEffect(() => { loadItems() }, [tab, filterType])

  async function loadItems() {
    setLoading(true)
    try {
      let q = query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'), limit(30))
      if (tab === 'mine') q = query(collection(db, 'marketplace'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'))
      if (tab === 'free') q = query(collection(db, 'marketplace'), where('price', '==', 0), orderBy('createdAt', 'desc'), limit(30))
      const snap = await getDocs(q)
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (filterType) data = data.filter(i => i.type === filterType)
      setItems(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCreate() {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!file) return toast.error('Please upload a file')
    setUploading(true)
    try {
      const fileURL = await uploadFile(file, `marketplace/${user.uid}`, pct => setProgress(pct))
      await addDoc(collection(db, 'marketplace'), {
        ...form,
        price:      parseFloat(form.price) || 0,
        fileURL,
        sellerId:   user.uid,
        sellerName: profile.displayName,
        sellerPhoto:profile.photoURL || '',
        university: profile.university || '',
        downloads:  0,
        createdAt:  serverTimestamp(),
      })
      await awardPoints(user.uid, 'RESOURCE_SHARED')
      setForm({ title: '', description: '', courseCode: '', subject: '', type: 'Past Paper', price: '0', year: '' })
      setFile(null)
      setCreate(false)
      toast.success('Resource listed! +15 pts 🎉')
      loadItems()
    } catch (e) { toast.error('Failed to list resource') }
    finally { setUploading(false); setProgress(0) }
  }

  async function handleBuy(item) {
    // In production: integrate MTN MoMo / Vodafone Cash
    toast('MTN MoMo payment coming soon! 📱', { icon: '💳' })
  }

  const TABS = [
    { id: 'all',  label: 'All Resources' },
    { id: 'free', label: '✓ Free Only'   },
    { id: 'mine', label: '📁 My Listings' },
  ]

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)' }}>📚 Course Marketplace</div>
          <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginTop: 2 }}>Past papers, notes & study resources</div>
        </div>
        <Btn size="sm" onClick={() => setCreate(true)}>+ List Resource</Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: tab === t.id ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : `${B.vibrantPurple}15`, color: tab === t.id ? '#fff' : B.vibrantPurple, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        <Chip active={!filterType} onClick={() => setFilter('')}>All Types</Chip>
        {TYPES.map(t => <Chip key={t} active={filterType === t} onClick={() => setFilter(filterType === t ? '' : t)}>{t}</Chip>)}
      </div>

      {/* Items grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} height={160} />)}
        </div>
      ) : items.length === 0 ? (
        <Empty icon="📚" title="No resources yet" subtitle="Be the first to share course materials!" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {items.map(item => <ResourceCard key={item.id} item={item} uid={user.uid} onBuy={handleBuy} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setCreate(false)} title="List a Resource">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Title" placeholder="e.g. MATH 201 Past Papers 2019-2023" value={form.title} onChange={set('title')} />
          <Textarea label="Description (optional)" placeholder="What's included? Year range, topics covered…" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <Input label="Course Code" placeholder="e.g. CS 301" value={form.courseCode} onChange={set('courseCode')} style={{ flex: 1 }} />
            <Input label="Year" placeholder="e.g. 2023" value={form.year} onChange={set('year')} style={{ flex: 1 }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 6 }}>Type</label>
              <select value={form.type} onChange={set('type')} style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none' }}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 6 }}>Subject</label>
              <select value={form.subject} onChange={set('subject')} style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none' }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Input label="Price (GH₵) — enter 0 for free" type="number" min="0" step="0.50" value={form.price} onChange={set('price')} />

          {/* File upload */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 6 }}>Upload File (PDF, image)</label>
            <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${file ? B.mint : B.vibrantPurple}50`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: file ? `${B.mint}08` : `${B.vibrantPurple}08` }}>
              {file ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 13, color: B.mint, fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)', marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                  <div style={{ fontSize: 13, color: 'var(--cl-muted)' }}>Click to upload PDF or image</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          {uploading && (
            <div style={{ background: 'var(--cl-bg)', borderRadius: 8, overflow: 'hidden', height: 8 }}>
              <div style={{ height: '100%', width: `${uploadProgress}%`, background: `linear-gradient(90deg,${B.midPurple},${B.vibrantPurple})`, transition: 'width 0.3s' }} />
            </div>
          )}

          <Btn onClick={handleCreate} disabled={uploading} style={{ width: '100%', padding: 12 }}>
            {uploading ? `Uploading… ${uploadProgress}%` : 'List Resource (+15 pts)'}
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
