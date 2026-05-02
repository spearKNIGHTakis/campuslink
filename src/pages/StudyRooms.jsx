// src/pages/StudyRooms.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, Btn, Modal, Input } from '@/components/ui'
import { B } from '@/lib/theme'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const ROOMS = [
  { id: 'lib-a', name: 'Library Wing A', capacity: 8,  floor: 'Ground Floor', building: 'Main Library'   },
  { id: 'lib-b', name: 'Library Wing B', capacity: 12, floor: '1st Floor',    building: 'Main Library'   },
  { id: 'sci-1', name: 'Science Lab 1',  capacity: 6,  floor: 'Ground Floor', building: 'Science Block'  },
  { id: 'sci-2', name: 'Science Lab 2',  capacity: 6,  floor: 'Ground Floor', building: 'Science Block'  },
  { id: 'eng-1', name: 'Eng Study Room', capacity: 10, floor: '2nd Floor',    building: 'Engineering Block'},
  { id: 'ict-1', name: 'ICT Lab A',      capacity: 20, floor: '1st Floor',    building: 'ICT Centre'     },
]

function RoomCard({ room, bookings, uid, onBook, onCancel }) {
  const mine = bookings.filter(b => b.userId === uid)
  const others = bookings.filter(b => b.userId !== uid)
  const isBooked = mine.length > 0

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--cl-text)' }}>{room.name}</div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginTop: 2 }}>{room.building} · {room.floor}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.vibrantPurple }}>Max {room.capacity} people</div>
          <div style={{ fontSize: 11, color: 'var(--cl-muted)', marginTop: 2 }}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} today</div>
        </div>
      </div>

      {/* Existing bookings */}
      {bookings.length > 0 && (
        <div style={{ background: 'var(--cl-bg)', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cl-muted)', marginBottom: 6 }}>Booked slots</div>
          {bookings.map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: b.userId === uid ? B.vibrantPurple : 'var(--cl-text)' }}>{b.bookerName}{b.userId === uid ? ' (You)' : ''}</span>
              <span style={{ color: 'var(--cl-muted)' }}>{b.startTime} – {b.endTime}</span>
            </div>
          ))}
        </div>
      )}

      {isBooked
        ? <Btn variant="danger" size="sm" onClick={() => onCancel(mine[0].id)}>Cancel My Booking</Btn>
        : <Btn size="sm" onClick={() => onBook(room)}>Book This Room</Btn>
      }
    </Card>
  )
}

export default function StudyRooms() {
  const { user, profile } = useAuth()
  const [bookings, setBookings]   = useState([])
  const [showBook, setShowBook]   = useState(false)
  const [selectedRoom, setSelected] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '11:00', purpose: '' })

  useEffect(() => { loadBookings() }, [])
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function loadBookings() {
    setLoading(true)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const snap = await getDocs(query(collection(db, 'roomBookings'), where('date', '>=', today), orderBy('date', 'asc')))
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openBook(room) {
    setSelected(room)
    setShowBook(true)
  }

  async function handleBook() {
    if (!form.date || !form.startTime || !form.endTime) return toast.error('Fill all fields')
    if (form.startTime >= form.endTime) return toast.error('End time must be after start time')
    try {
      await addDoc(collection(db, 'roomBookings'), {
        roomId:     selectedRoom.id,
        roomName:   selectedRoom.name,
        userId:     user.uid,
        bookerName: profile.displayName,
        date:       form.date,
        startTime:  form.startTime,
        endTime:    form.endTime,
        purpose:    form.purpose,
        createdAt:  serverTimestamp(),
      })
      setShowBook(false)
      toast.success(`${selectedRoom.name} booked!`)
      loadBookings()
    } catch { toast.error('Booking failed') }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm('Cancel this booking?')) return
    await deleteDoc(doc(db, 'roomBookings', bookingId))
    toast.success('Booking cancelled')
    loadBookings()
  }

  const getRoomBookings = roomId => bookings.filter(b => b.roomId === roomId)

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)' }}>🏛️ Study Rooms</div>
        <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginTop: 2 }}>Book a campus study room for your group</div>
      </div>

      <Card style={{ marginBottom: 16, background: `${B.gold}10`, border: `1px solid ${B.gold}30` }}>
        <div style={{ fontSize: 12, color: B.gold, fontWeight: 700, marginBottom: 4 }}>📌 Booking Rules</div>
        <div style={{ fontSize: 12, color: 'var(--cl-muted)', lineHeight: 1.6 }}>
          Max 2 hours per booking · Cancel at least 1 hour before · Rooms open 7am–10pm · Verified students only
        </div>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--cl-muted)' }}>Loading rooms…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {ROOMS.map(room => (
            <RoomCard key={room.id} room={room} bookings={getRoomBookings(room.id)} uid={user.uid} onBook={openBook} onCancel={handleCancel} />
          ))}
        </div>
      )}

      <Modal open={showBook} onClose={() => setShowBook(false)} title={`Book ${selectedRoom?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Date" type="date" value={form.date} onChange={set('date')} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Input label="Start Time" type="time" value={form.startTime} onChange={set('startTime')} style={{ flex: 1 }} />
            <Input label="End Time" type="time" value={form.endTime} onChange={set('endTime')} style={{ flex: 1 }} />
          </div>
          <Input label="Purpose (optional)" placeholder="e.g. MATH 301 group study" value={form.purpose} onChange={set('purpose')} />
          <Btn onClick={handleBook} style={{ width: '100%', padding: 12 }}>Confirm Booking</Btn>
        </div>
      </Modal>
    </div>
  )
}
