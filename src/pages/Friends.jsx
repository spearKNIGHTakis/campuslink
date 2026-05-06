// src/pages/Friends.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  listenIncomingRequests, acceptFriendRequest, declineFriendRequest,
  sendFriendRequest, getSuggestedUsers, getFriends, searchUsers, getUserProfile
} from '@/lib/db'
import { Avatar, Card, Btn, Badge, Skeleton, Empty } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

// ── User row ──────────────────────────────────────────────────────────────────
function UserRow({ u, onPrimary, primaryLabel, primaryVariant = 'primary', onSecondary, secondaryLabel, loading, done, navigate }) {
  if (done) return null
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--cl-border)' }}>
      <div onClick={() => navigate(`/profile/${u.uid || u.id}`)} style={{ cursor: 'pointer' }}>
        <Avatar src={u.photoURL} initials={u.displayName} size={44} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div
          onClick={() => navigate(`/profile/${u.uid || u.id}`)}
          style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
        >
          {u.displayName}
          {u.isVerified && <Icon name="verified" size={11} color={B.mint} style={{ marginLeft: 5 }} />}
        </div>
        <div style={{ color: 'var(--cl-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {u.program || 'Student'} {u.university ? `· ${u.university}` : ''}
        </div>
        {u.mutual != null && u.mutual > 0 && (
          <div style={{ fontSize: 10, color: B.vibrantPurple, marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon name="users" size={9} color={B.vibrantPurple} /> {u.mutual} mutual friends
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {onSecondary && (
          <Btn variant="danger" size="sm" onClick={onSecondary} disabled={loading}>{secondaryLabel}</Btn>
        )}
        <Btn variant={primaryVariant} size="sm" onClick={onPrimary} disabled={loading}>
          {loading ? '…' : primaryLabel}
        </Btn>
      </div>
    </div>
  )
}

// ── Request item — loads sender profile from Firestore ────────────────────────
function RequestItem({ req, currentUid, navigate }) {
  const [sender, setSender]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    // Try inline data first, fall back to Firestore lookup
    if (req.fromName) {
      setSender({ uid: req.from, displayName: req.fromName, photoURL: req.fromPhoto || '', program: req.fromProgram || '', university: req.fromUniversity || '', isVerified: false })
    } else {
      getUserProfile(req.from).then(p => setSender(p))
    }
  }, [req.from])

  if (done) return null
  if (!sender) return <Skeleton height={60} style={{ marginBottom: 8 }} />

  async function accept() {
    setLoading(true)
    try {
      await acceptFriendRequest(req.id, req.from, currentUid)
      setDone(true)
      toast.success(`You and ${sender.displayName} are now friends!`)
    } catch { toast.error('Could not accept request') }
    finally { setLoading(false) }
  }

  async function decline() {
    setLoading(true)
    try {
      await declineFriendRequest(req.id)
      setDone(true)
    } catch { toast.error('Could not decline') }
    finally { setLoading(false) }
  }

  return (
    <UserRow
      u={sender}
      onPrimary={accept}
      primaryLabel="Accept"
      onSecondary={decline}
      secondaryLabel="Decline"
      loading={loading}
      done={done}
      navigate={navigate}
    />
  )
}

// ── Suggestion item ───────────────────────────────────────────────────────────
function SuggestionItem({ u, currentUid, currentProfile, navigate }) {
  const [status, setStatus] = useState('none') // none | requested | friends
  const [loading, setLoading] = useState(false)

  async function add() {
    setLoading(true)
    try {
      await sendFriendRequest(currentUid, u.uid || u.id, currentProfile)
      setStatus('requested')
      toast.success('Friend request sent!')
    } catch { toast.error('Could not send request') }
    finally { setLoading(false) }
  }

  if (status === 'requested') {
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--cl-border)' }}>
        <Avatar src={u.photoURL} initials={u.displayName} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13 }}>{u.displayName}</div>
          <div style={{ fontSize: 11, color: B.gold, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={10} color={B.gold} /> Request sent
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserRow
      u={u}
      onPrimary={add}
      primaryLabel="Add Friend"
      loading={loading}
      done={false}
      navigate={navigate}
    />
  )
}

// ── Main Friends page ─────────────────────────────────────────────────────────
export default function Friends() {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const [tab, setTab]         = useState('requests')
  const [requests, setReqs]   = useState([])
  const [friends, setFriends] = useState([])
  const [suggested, setSugg]  = useState([])
  const [searchQ, setSearch]  = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // Real-time incoming requests
  useEffect(() => {
    const unsub = listenIncomingRequests(user.uid, reqs => {
      setReqs(reqs)
      setLoading(false)
    })
    return unsub
  }, [user.uid])

  // Load tab data
  useEffect(() => {
    if (tab === 'friends')  getFriends(user.uid).then(setFriends)
    if (tab === 'discover') getSuggestedUsers(user.uid, profile?.program, profile?.university || '').then(u => setSugg(u.filter(x => x.uid !== user.uid)))
  }, [tab])

  // Debounced search
  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const res = await searchUsers(searchQ)
      setResults(res.filter(u => u.uid !== user.uid))
      setSearching(false)
    }, 400)
    return () => clearTimeout(t)
  }, [searchQ])

  const TABS = [
    { id: 'requests', label: 'Requests', count: requests.length },
    { id: 'friends',  label: 'Friends'  },
    { id: 'discover', label: 'Discover' },
    { id: 'search',   label: 'Search'   },
  ]

  return (
    <div className="page-container">
      <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--cl-text)', marginBottom: 16 }}>Friends</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: tab === t.id ? `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})` : `${B.vibrantPurple}15`, color: tab === t.id ? '#fff' : B.vibrantPurple, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.label}
            {t.count > 0 && <Badge count={t.count} />}
          </button>
        ))}
      </div>

      {/* Requests */}
      {tab === 'requests' && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="friends" size={14} color={B.vibrantPurple} /> Friend Requests
            {requests.length > 0 && <Badge count={requests.length} />}
          </div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginBottom: 14 }}>Pending requests from other students</div>
          {loading ? <Skeleton height={60} /> :
           requests.length === 0 ? <Empty icon="friends" title="No pending requests" subtitle="When someone sends you a request, it'll appear here" /> :
           requests.map(req => <RequestItem key={req.id} req={req} currentUid={user.uid} navigate={navigate} />)
          }
        </Card>
      )}

      {/* Friends list */}
      {tab === 'friends' && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="users" size={14} color={B.vibrantPurple} /> Your Friends ({friends.length})
          </div>
          {friends.length === 0
            ? <Empty icon="friends" title="No friends yet" subtitle="Discover and connect with students!" />
            : friends.map(f => (
                <div key={f.uid} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--cl-border)', cursor: 'pointer' }} onClick={() => navigate(`/profile/${f.uid}`)}>
                  <Avatar src={f.photoURL} initials={f.displayName} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {f.displayName}
                      {f.isVerified && <Icon name="verified" size={11} color={B.mint} />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{f.program || 'Student'} {f.university ? `· ${f.university}` : ''}</div>
                  </div>
                  <Icon name="chevronRight" size={12} color="var(--cl-muted)" />
                </div>
              ))
          }
        </Card>
      )}

      {/* Discover */}
      {tab === 'discover' && (
        <Card>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="globe" size={14} color={B.vibrantPurple} /> People You May Know
          </div>
          <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginBottom: 14 }}>Students from your university</div>
          {suggested.length === 0
            ? <Empty icon="users" title="No suggestions yet" subtitle="Complete your profile to get better suggestions" />
            : suggested.map(u => (
                <SuggestionItem key={u.uid || u.id} u={u} currentUid={user.uid} currentProfile={profile} navigate={navigate} />
              ))
          }
        </Card>
      )}

      {/* Search */}
      {tab === 'search' && (
        <div>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Icon name="search" size={14} color="var(--cl-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchQ}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students by name…"
              style={{ width: '100%', background: 'var(--cl-surface)', border: '1.5px solid var(--cl-border)', borderRadius: 12, padding: '11px 14px 11px 38px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
          {searching && <Skeleton height={50} />}
          {!searching && results.length > 0 && (
            <Card>
              {results.map(u => (
                <SuggestionItem key={u.uid || u.id} u={u} currentUid={user.uid} currentProfile={profile} navigate={navigate} />
              ))}
            </Card>
          )}
          {!searching && searchQ && results.length === 0 && (
            <Empty icon="search" title="No results" subtitle={`No students found for "${searchQ}"`} />
          )}
          {!searchQ && (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--cl-muted)' }}>
              <Icon name="search" size={36} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14 }}>Search for students by name</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
