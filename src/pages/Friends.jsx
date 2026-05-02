// src/pages/Friends.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  listenIncomingRequests, acceptFriendRequest, declineFriendRequest,
  sendFriendRequest, getSuggestedUsers, getFriends, searchUsers
} from '@/lib/db'
import { Avatar, Card, Btn, Badge, Skeleton, Empty } from '@/components/ui'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

function UserRow({ user, action, actionLabel, actionVariant = 'primary', secondAction, secondLabel }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  async function handleAction() {
    setLoading(true)
    try { await action(); setDone(true) }
    catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  if (done) return null

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--cl-border)' }}>
      <Avatar src={user.photoURL} initials={user.displayName} size={44} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</div>
        <div style={{ color: 'var(--cl-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.program || 'KNUST Student'}</div>
        {user.mutual != null && <div style={{ fontSize: 10, color: B.vibrantPurple, marginTop: 1 }}>{user.mutual} mutual friends</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {secondAction && (
          <Btn variant="danger" size="sm" onClick={async () => { setLoading(true); try { await secondAction(); setDone(true) } catch {} finally { setLoading(false) } }}>{secondLabel}</Btn>
        )}
        <Btn variant={actionVariant} size="sm" onClick={handleAction} disabled={loading}>
          {loading ? '…' : actionLabel}
        </Btn>
      </div>
    </div>
  )
}

export default function Friends() {
  const { user, profile } = useAuth()
  const [tab, setTab]         = useState('requests')
  const [requests, setReqs]   = useState([])
  const [friends, setFriends] = useState([])
  const [suggested, setSugg]  = useState([])
  const [searchQ, setSearch]  = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // Listen to incoming friend requests
  useEffect(() => {
    const unsub = listenIncomingRequests(user.uid, reqs => {
      setReqs(reqs)
      setLoading(false)
    })
    return unsub
  }, [user.uid])

  // Load friends + suggestions
  useEffect(() => {
    if (tab === 'friends') {
      getFriends(user.uid).then(setFriends)
    }
    if (tab === 'discover') {
      getSuggestedUsers(user.uid, profile?.program || '').then(setSugg)
    }
  }, [tab, user.uid, profile?.program])

  // Search
  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      const res = await searchUsers(searchQ)
      setResults(res.filter(u => u.uid !== user.uid))
      setSearching(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQ, user.uid])

  const TABS = [
    { id: 'requests', label: 'Requests', count: requests.length },
    { id: 'friends',  label: 'Friends' },
    { id: 'discover', label: 'Discover' },
    { id: 'search',   label: '🔍' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: tab === t.id ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : `${B.vibrantPurple}15`,
            color: tab === t.id ? '#fff' : B.vibrantPurple, fontWeight: 700, fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {t.label}
            {t.count > 0 && <Badge count={t.count} />}
          </button>
        ))}
      </div>

      {/* Requests */}
      {tab === 'requests' && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 2 }}>
            Friend Requests {requests.length > 0 && <Badge count={requests.length} />}
          </div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginBottom: 12 }}>From other KNUST students</div>
          {loading ? <Skeleton height={50} /> :
           requests.length === 0 ? <Empty icon="👥" title="No pending requests" subtitle="When someone sends you a request, it'll appear here" /> :
           requests.map(req => (
             <UserRow
               key={req.id}
               user={{ uid: req.from, displayName: req.fromName || 'Student', photoURL: req.fromPhoto || '', program: req.fromProgram || '' }}
               action={() => acceptFriendRequest(req.id, req.from, user.uid)}
               actionLabel="Accept"
               secondAction={() => declineFriendRequest(req.id)}
               secondLabel="Decline"
             />
           ))
          }
        </Card>
      )}

      {/* Friends list */}
      {tab === 'friends' && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 12 }}>Your Friends</div>
          {friends.length === 0
            ? <Empty icon="🤝" title="No friends yet" subtitle="Discover and connect with students!" />
            : friends.map(f => (
                <UserRow key={f.uid} user={f} action={() => {}} actionLabel="Message" actionVariant="ghost" />
              ))
          }
        </Card>
      )}

      {/* Discover */}
      {tab === 'discover' && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 4 }}>People You May Know</div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginBottom: 12 }}>Students from your program</div>
          {suggested.length === 0
            ? <Empty icon="🔭" title="No suggestions yet" subtitle="Complete your profile to get better suggestions" />
            : suggested.map(u => (
                <UserRow key={u.uid} user={u} action={() => sendFriendRequest(user.uid, u.uid)} actionLabel="+ Add" actionVariant="primary" />
              ))
          }
        </Card>
      )}

      {/* Search */}
      {tab === 'search' && (
        <div>
          <input
            value={searchQ}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name…"
            style={{ width: '100%', background: 'var(--cl-surface)', border: '1.5px solid var(--cl-border)', borderRadius: 12, padding: '11px 14px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
          />
          {searching && <Skeleton height={50} />}
          {!searching && results.length > 0 && (
            <Card>
              {results.map(u => (
                <UserRow key={u.uid} user={u} action={() => sendFriendRequest(user.uid, u.uid)} actionLabel="+ Add" />
              ))}
            </Card>
          )}
          {!searching && searchQ && results.length === 0 && (
            <Empty icon="🔍" title="No results" subtitle={`No students found for "${searchQ}"`} />
          )}
        </div>
      )}
    </div>
  )
}
