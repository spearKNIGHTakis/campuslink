// src/pages/Assignments.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, Btn, Modal, Input, Textarea } from '@/components/ui'
import { B } from '@/lib/theme'
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns'
import toast from 'react-hot-toast'

const PRIORITIES = [
  { id: 'high',   label: '🔴 High',   color: B.coral },
  { id: 'medium', label: '🟡 Medium', color: B.gold  },
  { id: 'low',    label: '🟢 Low',    color: B.mint  },
]

function urgencyLabel(dueDate) {
  const d = new Date(dueDate)
  if (isPast(d))     return { label: 'Overdue!', color: B.coral }
  if (isToday(d))    return { label: 'Due today', color: B.coral }
  if (isTomorrow(d)) return { label: 'Due tomorrow', color: B.gold }
  return { label: `Due ${format(d, 'MMM d')}`, color: 'var(--cl-muted)' }
}

function AssignmentCard({ item, onComplete, onDelete }) {
  const urgency = urgencyLabel(item.dueDate)
  const priority = PRIORITIES.find(p => p.id === item.priority) || PRIORITIES[1]

  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid var(--cl-border)`, opacity: item.completed ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      {/* Checkbox */}
      <button onClick={() => onComplete(item.id, !item.completed)} style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${item.completed ? B.mint : 'var(--cl-border)'}`, background: item.completed ? B.mint : 'transparent', flexShrink: 0, marginTop: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>
        {item.completed ? '✓' : ''}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--cl-text)', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</div>
          <span style={{ fontSize: 10, fontWeight: 700, color: priority.color, background: `${priority.color}18`, padding: '2px 8px', borderRadius: 8, flexShrink: 0, marginLeft: 8 }}>{priority.label}</span>
        </div>

        {item.courseCode && <div style={{ fontSize: 12, color: B.vibrantPurple, fontWeight: 600, marginBottom: 3 }}>{item.courseCode}</div>}
        {item.description && <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.5, marginBottom: 6 }}>{item.description}</div>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: urgency.color }}>{urgency.label}</span>
          {!item.completed && (
            <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--cl-muted)', cursor: 'pointer', fontSize: 14 }}>🗑</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Assignments() {
  const { user } = useAuth()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [tab, setTab]           = useState('pending')
  const [form, setForm] = useState({ title: '', courseCode: '', description: '', dueDate: '', priority: 'medium' })

  useEffect(() => { loadItems() }, [user.uid])
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function loadItems() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'assignments'), where('userId', '==', user.uid), orderBy('dueDate', 'asc')))
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleAdd() {
    if (!form.title.trim() || !form.dueDate) return toast.error('Title and due date required')
    try {
      await addDoc(collection(db, 'assignments'), { ...form, userId: user.uid, completed: false, createdAt: serverTimestamp() })
      setForm({ title: '', courseCode: '', description: '', dueDate: '', priority: 'medium' })
      setShowAdd(false)
      toast.success('Assignment added!')
      loadItems()
    } catch { toast.error('Failed to add assignment') }
  }

  async function handleComplete(id, completed) {
    await updateDoc(doc(db, 'assignments', id), { completed })
    setItems(items.map(i => i.id === id ? { ...i, completed } : i))
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'assignments', id))
    setItems(items.filter(i => i.id !== id))
    toast.success('Removed')
  }

  const pending   = items.filter(i => !i.completed)
  const completed = items.filter(i => i.completed)
  const overdue   = pending.filter(i => isPast(new Date(i.dueDate)))
  const shown     = tab === 'pending' ? pending : completed

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)' }}>📋 Assignments</div>
          <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginTop: 2 }}>{pending.length} pending · {overdue.length} overdue</div>
        </div>
        <Btn size="sm" onClick={() => setShowAdd(true)}>+ Add</Btn>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[['📋', 'Total', items.length, B.vibrantPurple], ['⏳', 'Pending', pending.length, B.gold], ['🔴', 'Overdue', overdue.length, B.coral]].map(([icon, label, val, color]) => (
          <div key={label} style={{ background: 'var(--cl-surface)', border: `1px solid var(--cl-border)`, borderRadius: 14, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['pending', 'Pending'], ['completed', 'Completed']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: tab === id ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : `${B.vibrantPurple}15`, color: tab === id ? '#fff' : B.vibrantPurple, fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--cl-muted)' }}>Loading…</div>
         : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === 'pending' ? '✅' : '📋'}</div>
            <div style={{ fontWeight: 700, color: 'var(--cl-text)', marginBottom: 6 }}>{tab === 'pending' ? 'All caught up!' : 'Nothing completed yet'}</div>
            <div style={{ fontSize: 13, color: 'var(--cl-muted)' }}>{tab === 'pending' ? 'No pending assignments' : 'Complete assignments to see them here'}</div>
          </div>
         ) : shown.map(item => (
          <AssignmentCard key={item.id} item={item} onComplete={handleComplete} onDelete={handleDelete} />
        ))}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Assignment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Assignment Title" placeholder="e.g. Lab Report — Organic Chemistry" value={form.title} onChange={set('title')} />
          <Input label="Course Code (optional)" placeholder="e.g. CHEM 302" value={form.courseCode} onChange={set('courseCode')} />
          <Textarea label="Notes (optional)" placeholder="Additional details, submission requirements…" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />
          <Input label="Due Date & Time" type="datetime-local" value={form.dueDate} onChange={set('dueDate')} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', display: 'block', marginBottom: 8 }}>Priority</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map(p => (
                <button key={p.id} onClick={() => setForm(f => ({ ...f, priority: p.id }))} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `2px solid ${form.priority === p.id ? p.color : 'var(--cl-border)'}`, background: form.priority === p.id ? `${p.color}15` : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: p.color, fontFamily: 'inherit' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={handleAdd} style={{ width: '100%', padding: 12 }}>Add Assignment</Btn>
        </div>
      </Modal>
    </div>
  )
}
