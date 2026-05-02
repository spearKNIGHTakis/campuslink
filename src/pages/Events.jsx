// src/pages/Events.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listenEvents, createEvent, toggleRSVP, hasRSVPd } from '@/lib/db'
import { Card, Btn, Modal, Input, Textarea, Empty, Skeleton } from '@/components/ui'
import { B } from '@/lib/theme'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const EVENT_ICONS = ['💼','🎓','🗳️','⚡','🎉','🏆','🎤','🔬','🎨','🌍','📚','🍕','🏃','🎸']

function EventCard({ event, uid }) {
  const [rsvpd, setRsvpd]     = useState(false)
  const [count, setCount]     = useState(event.rsvpCount || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    hasRSVPd(event.id, uid).then(setRsvpd)
  }, [event.id, uid])

  async function handleRSVP() {
    setLoading(true)
    const newState = !rsvpd
    setRsvpd(newState)
    setCount(c => newState ? c + 1 : c - 1)
    try { await toggleRSVP(event.id, uid) }
    catch { setRsvpd(!newState); setCount(c => newState ? c - 1 : c + 1); toast.error('Failed to RSVP') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--cl-border)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${B.midPurple}50,${B.vibrantPurple}30)`, border: `1px solid ${B.vibrantPurple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {event.icon || '📅'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14 }}>{event.title}</div>
          {event.description && <p style={{ color: 'var(--cl-muted)', fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{event.description}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--cl-muted)' }}>📅 {event.date}{event.time ? ` · ${event.time}` : ''}</span>
            {event.location && <span style={{ fontSize: 11, color: 'var(--cl-muted)' }}>📍 {event.location}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: B.mint, fontWeight: 600 }}>✓ {count} going</span>
            <Btn size="sm" variant={rsvpd ? 'outline' : 'primary'} onClick={handleRSVP} disabled={loading}>
              {loading ? '…' : rsvpd ? '✓ Going' : 'RSVP'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Events() {
  const { user, profile } = useAuth()
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', location: '', date: '', time: '', icon: '📅' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const unsub = listenEvents(e => { setEvents(e); setLoading(false) })
    return unsub
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }))

  async function handleCreate() {
    if (!form.title.trim() || !form.date) return toast.error('Title and date are required')
    setCreating(true)
    try {
      await createEvent(user.uid, profile, form)
      setForm({ title: '', description: '', location: '', date: '', time: '', icon: '📅' })
      setCreate(false)
      toast.success('Event created!')
    } catch { toast.error('Could not create event') }
    finally { setCreating(false) }
  }

  // Featured = most RSVPs
  const featured = [...events].sort((a, b) => (b.rsvpCount || 0) - (a.rsvpCount || 0))[0]
  const rest      = events.filter(e => e.id !== featured?.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--cl-text)' }}>Campus Events</div>
        <Btn size="sm" onClick={() => setCreate(true)}>+ Create</Btn>
      </div>

      {/* Featured banner */}
      {!loading && featured && (
        <div style={{ borderRadius: 18, padding: 20, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${B.deepPurple} 0%, ${B.richPurple} 60%, ${B.midPurple} 100%)`, boxShadow: `0 8px 32px ${B.richPurple}50` }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${B.vibrantPurple}25`, filter: 'blur(25px)' }} />
          <div style={{ fontSize: 10, color: B.vibrantPurple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>⭐ Featured Event</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{featured.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
            📅 {featured.date}{featured.time ? ` · ${featured.time}` : ''}
            {featured.location ? ` · 📍 ${featured.location}` : ''}
          </div>
          <div style={{ fontSize: 12, color: B.mint, marginBottom: 14 }}>✓ {featured.rsvpCount || 0} students going</div>
          <Btn size="sm">RSVP Now →</Btn>
        </div>
      )}

      {/* All events */}
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 4 }}>All Events</div>
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} height={70} style={{ marginBottom: 10 }} />)
          : events.length === 0
            ? <Empty icon="📅" title="No events yet" subtitle="Create the first campus event!" />
            : events.map(ev => <EventCard key={ev.id} event={ev} uid={user.uid} />)
        }
      </Card>

      {/* Create event modal */}
      <Modal open={showCreate} onClose={() => setCreate(false)} title="Create Event">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Event Title" placeholder="e.g. Career Fair 2025" value={form.title} onChange={set('title')} />
          <Textarea label="Description (optional)" placeholder="Tell students what to expect…" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <Input label="Date" type="date" value={form.date} onChange={set('date')} style={{ flex: 1 }} />
            <Input label="Time" type="time" value={form.time} onChange={set('time')} style={{ flex: 1 }} />
          </div>

          <Input label="Location" placeholder="e.g. Great Hall, KNUST" value={form.location} onChange={set('location')} />

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-muted)', marginBottom: 8 }}>Event Icon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EVENT_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{ width: 38, height: 38, borderRadius: 10, border: `2px solid ${form.icon === icon ? B.vibrantPurple : 'var(--cl-border)'}`, background: form.icon === icon ? `${B.vibrantPurple}20` : 'transparent', fontSize: 18, cursor: 'pointer' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Btn onClick={handleCreate} disabled={creating} style={{ width: '100%', padding: 12 }}>
            {creating ? 'Creating…' : 'Create Event'}
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
