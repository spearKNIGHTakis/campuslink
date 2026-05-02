// src/pages/Messages.jsx
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  listenConversations, listenMessages, sendMessage,
  getOrCreateConversation, markConversationRead, getUserProfile
} from '@/lib/db'
import { Avatar, Card, Skeleton, Empty, Spinner } from '@/components/ui'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

// ── Chat view ─────────────────────────────────────────────────────────────────
function ChatView({ convId, otherUid, onBack }) {
  const { user, profile } = useAuth()
  const [messages, setMessages]   = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [text, setText]           = useState('')
  const [sending, setSending]     = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    getUserProfile(otherUid).then(setOtherUser)
    markConversationRead(convId, user.uid)
    const unsub = listenMessages(convId, msgs => {
      setMessages(msgs)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
    return unsub
  }, [convId, otherUid, user.uid])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    const msg = text.trim()
    setText('')
    setSending(true)
    try { await sendMessage(convId, user.uid, msg, otherUid) }
    catch { toast.error('Failed to send'); setText(msg) }
    finally { setSending(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      {/* Chat header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--cl-border)', marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: B.vibrantPurple, cursor: 'pointer', fontSize: 24, padding: '0 4px' }}>←</button>
        <Avatar src={otherUser?.photoURL} initials={otherUser?.displayName} size={38} online />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14 }}>{otherUser?.displayName || '…'}</div>
          <div style={{ fontSize: 11, color: B.mint, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: B.mint, boxShadow: `0 0 5px ${B.mint}` }} />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--cl-muted)', fontSize: 13, padding: 24 }}>
            Start the conversation 👋
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.senderId === user.uid
          const ts   = msg.createdAt?.toDate?.()
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '76%', padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
                borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: mine
                  ? `linear-gradient(135deg, ${B.midPurple}, ${B.vibrantPurple})`
                  : 'var(--cl-surface)',
                color: mine ? '#fff' : 'var(--cl-text)',
                border: mine ? 'none' : '1px solid var(--cl-border)',
                boxShadow: mine ? `0 4px 12px ${B.midPurple}50` : 'none',
              }}>{msg.text}</div>
              {ts && <div style={{ fontSize: 9, color: 'var(--cl-muted)', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                {formatDistanceToNow(ts, { addSuffix: true })}
              </div>}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, background: 'var(--cl-surface)', border: `1.5px solid ${B.vibrantPurple}40`, borderRadius: 14, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 13, outline: 'none' }}
        />
        <button type="submit" disabled={sending || !text.trim()} style={{ background: `linear-gradient(135deg, ${B.midPurple}, ${B.vibrantPurple})`, border: 'none', borderRadius: 14, width: 46, cursor: 'pointer', fontSize: 18, color: '#fff', boxShadow: `0 4px 12px ${B.midPurple}50`, opacity: !text.trim() ? 0.5 : 1 }}>
          {sending ? '…' : '↑'}
        </button>
      </form>
    </div>
  )
}

// ── Conversation list item ────────────────────────────────────────────────────
function ConvItem({ conv, uid, onClick }) {
  const otherId  = conv.participants?.find(p => p !== uid)
  const unread   = conv.unreadCount?.[uid] || 0
  const ts       = conv.lastMessageAt?.toDate?.()
  const [other, setOther] = useState(null)

  useEffect(() => {
    if (otherId) getUserProfile(otherId).then(setOther)
  }, [otherId])

  return (
    <button onClick={onClick} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--cl-border)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
      <Avatar src={other?.photoURL} initials={other?.displayName} size={46} online={false} />
      <div style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13 }}>{other?.displayName || '…'}</span>
          {ts && <span style={{ fontSize: 10, color: 'var(--cl-muted)' }}>{formatDistanceToNow(ts, { addSuffix: true })}</span>}
        </div>
        <div style={{ fontSize: 12, color: unread ? 'var(--cl-text)' : 'var(--cl-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: unread ? 600 : 400 }}>
          {conv.lastMessage || 'Start a conversation'}
        </div>
      </div>
      {unread > 0 && (
        <span style={{ background: B.coral, color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, padding: '2px 7px', flexShrink: 0 }}>{unread}</span>
      )}
    </button>
  )
}

// ── Messages page ─────────────────────────────────────────────────────────────
export default function Messages() {
  const { user } = useAuth()
  const [convs, setConvs]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeConv, setActive] = useState(null) // { convId, otherUid }
  const [search, setSearch]     = useState('')

  useEffect(() => {
    const unsub = listenConversations(user.uid, c => { setConvs(c); setLoading(false) })
    return unsub
  }, [user.uid])

  if (activeConv) {
    return (
      <ChatView
        convId={activeConv.convId}
        otherUid={activeConv.otherUid}
        onBack={() => setActive(null)}
      />
    )
  }

  const filtered = convs.filter(c => {
    if (!search) return true
    return c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--cl-text)', marginBottom: 14 }}>Messages</div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Search conversations…"
        style={{ width: '100%', background: 'var(--cl-surface)', border: '1.5px solid var(--cl-border)', borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
      />

      <Card>
        {loading ? (
          [1,2,3].map(i => <Skeleton key={i} height={60} style={{ marginBottom: 10 }} />)
        ) : filtered.length === 0 ? (
          <Empty icon="✉️" title="No conversations" subtitle="Connect with friends to start messaging" />
        ) : (
          filtered.map(conv => {
            const otherId = conv.participants?.find(p => p !== user.uid)
            return (
              <ConvItem
                key={conv.id}
                conv={conv}
                uid={user.uid}
                onClick={async () => {
                  const convId = await getOrCreateConversation(user.uid, otherId)
                  setActive({ convId, otherUid: otherId })
                }}
              />
            )
          })
        )}
      </Card>
    </div>
  )
}
