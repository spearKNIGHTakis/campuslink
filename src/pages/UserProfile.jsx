// src/pages/UserProfile.jsx — Public profile view for other users
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile, sendFriendRequest, areFriends, listenFeed, getFriends } from '@/lib/db'
import { Avatar, Card, Btn, Chip, Skeleton, Empty } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { getBadge } from '@/lib/reputation'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const { id }              = useParams()
  const { user, profile }   = useAuth()
  const navigate            = useNavigate()
  const [target, setTarget] = useState(null)
  const [posts, setPosts]   = useState([])
  const [friends, setFriends] = useState([])
  const [friendStatus, setFriendStatus] = useState('none') // none | friends | requested
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Redirect to own profile
  useEffect(() => {
    if (id === user?.uid) { navigate('/profile', { replace: true }); return }
    loadProfile()
  }, [id, user?.uid])

  async function loadProfile() {
    setLoading(true)
    try {
      const [p, isFriend] = await Promise.all([
        getUserProfile(id),
        areFriends(user.uid, id),
      ])
      if (!p) { toast.error('User not found'); navigate(-1); return }
      setTarget(p)
      setFriendStatus(isFriend ? 'friends' : 'none')

      // Load their posts
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const snap = await getDocs(query(collection(db, 'posts'), where('authorId', '==', id), orderBy('createdAt', 'desc'), limit(10)))
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))

      // Load their friends (sample)
      const fr = await getFriends(id)
      setFriends(fr.slice(0, 6))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleAddFriend() {
    if (friendStatus !== 'none') return
    setSending(true)
    try {
      await sendFriendRequest(user.uid, id, profile)
      setFriendStatus('requested')
      toast.success('Friend request sent!')
    } catch { toast.error('Could not send request') }
    finally { setSending(false) }
  }

  async function handleMessage() {
    const { getOrCreateConversation } = await import('@/lib/db')
    const convId = await getOrCreateConversation(user.uid, id)
    navigate('/messages', { state: { openConvId: convId, openUid: id } })
  }

  function handleShare() {
    const url = `${window.location.origin}/profile/${id}`
    if (navigator.share) {
      navigator.share({ title: `${target?.displayName} on CampusLink`, url })
    } else {
      navigator.clipboard?.writeText(url)
      toast.success('Profile link copied!')
    }
  }

  if (loading) return (
    <div className="page-container">
      <Skeleton height={140} style={{ borderRadius: 20, marginBottom: 12 }} />
      <Skeleton height={100} style={{ borderRadius: 16, marginBottom: 12 }} />
    </div>
  )

  if (!target) return null

  const badge = getBadge(target.reputationPoints || 0)

  return (
    <div className="page-container">
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: 'var(--cl-muted)', cursor: 'pointer', marginBottom: 16, fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
        <Icon name="back" size={13} /> Back
      </button>

      {/* Profile card */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        {/* Cover */}
        <div style={{ height: 100, background: `linear-gradient(135deg, ${B.deepPurple} 0%, ${B.richPurple} 55%, ${B.midPurple} 100%)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, right: 20, width: 70, height: 70, borderRadius: '50%', background: `${B.vibrantPurple}25`, filter: 'blur(18px)' }} />
        </div>

        <div style={{ padding: '0 16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -34 }}>
            <Avatar src={target.photoURL} initials={target.displayName} size={68} glow />
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 36 }}>
              <button onClick={handleShare} style={{ width: 36, height: 36, borderRadius: 10, background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="share" size={14} color={B.vibrantPurple} />
              </button>
              <button onClick={handleMessage} style={{ height: 36, borderRadius: 10, background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 12px', color: B.vibrantPurple, fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
                <Icon name="messages" size={13} color={B.vibrantPurple} /> Message
              </button>
              <button
                onClick={handleAddFriend}
                disabled={friendStatus !== 'none' || sending}
                style={{
                  height: 36, borderRadius: 10, cursor: friendStatus !== 'none' ? 'default' : 'pointer',
                  background: friendStatus === 'friends' ? `${B.mint}18` : friendStatus === 'requested' ? `${B.gold}18` : `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})`,
                  border: friendStatus === 'friends' ? `1px solid ${B.mint}40` : friendStatus === 'requested' ? `1px solid ${B.gold}40` : 'none',
                  color: friendStatus === 'friends' ? B.mint : friendStatus === 'requested' ? B.gold : '#fff',
                  fontWeight: 700, fontSize: 12, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
                  boxShadow: friendStatus === 'none' ? `0 4px 12px ${B.midPurple}50` : 'none',
                }}>
                <Icon
                  name={friendStatus === 'friends' ? 'check' : friendStatus === 'requested' ? 'clock' : 'add'}
                  size={12}
                  color={friendStatus === 'friends' ? B.mint : friendStatus === 'requested' ? B.gold : '#fff'}
                />
                {friendStatus === 'friends' ? 'Friends' : friendStatus === 'requested' ? 'Requested' : sending ? '…' : 'Add Friend'}
              </button>
            </div>
          </div>

          {/* Name + badges */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)' }}>{target.displayName}</span>
              {target.isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: B.mint, background: `${B.mint}15`, border: `1px solid ${B.mint}30`, borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>
                  <Icon name="verified" size={10} color={B.mint} /> Verified Student
                </span>
              )}
            </div>
            <div style={{ color: 'var(--cl-muted)', fontSize: 13, marginTop: 3 }}>
              {target.program || 'Student'} {target.year ? `· ${target.year}` : ''}
            </div>
            {/* Badge + points */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 14 }}>{badge.icon}</span>
              <span style={{ fontSize: 12, color: badge.color, fontWeight: 700 }}>{badge.label}</span>
              <span style={{ fontSize: 11, color: 'var(--cl-muted)' }}>· {target.reputationPoints || 0} pts</span>
            </div>
            {target.bio && <p style={{ color: 'var(--cl-text)', fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>{target.bio}</p>}
            {target.interests?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {target.interests.map(tag => <Chip key={tag}>{tag}</Chip>)}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--cl-border)' }}>
            {[['Posts', target.postCount || 0], ['Friends', target.friendCount || 0], ['Groups', target.groupCount || 0]].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* About */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 12 }}>About</div>
        {[
          ['university', target.university || 'University not set'],
          ['graduation',  target.faculty   || 'Faculty not set'],
          ['book',        target.program   || 'Program not set'],
          ['location',    `Joined CampusLink`],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 9, color: 'var(--cl-muted)', fontSize: 13 }}>
            <Icon name={icon} size={13} color="var(--cl-muted)" style={{ width: 16 }} />
            <span>{text}</span>
          </div>
        ))}
      </Card>

      {/* Mutual friends */}
      {friends.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 12 }}>Friends</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {friends.map(f => (
              <div key={f.uid} onClick={() => navigate(`/profile/${f.uid}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', width: 56 }}>
                <Avatar src={f.photoURL} initials={f.displayName} size={44} />
                <span style={{ fontSize: 10, color: 'var(--cl-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                  {f.displayName?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Their posts */}
      <Card>
        <div style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, marginBottom: 12 }}>Posts</div>
        {posts.length === 0 ? (
          <Empty icon="post" title="No posts yet" subtitle={`${target.displayName} hasn't posted yet`} />
        ) : (
          posts.map(post => {
            const ts = post.createdAt?.toDate?.()
            return (
              <div key={post.id} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--cl-border)' }}>
                <p style={{ color: 'var(--cl-text)', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>{post.content}</p>
                {post.mediaURL && post.mediaType !== 'video' && (
                  <img src={post.mediaURL} alt="post" style={{ width: '100%', borderRadius: 10, maxHeight: 240, objectFit: 'cover', marginBottom: 8 }} />
                )}
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--cl-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="like" size={11} color={B.coral} /> {post.likeCount || 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="comment" size={11} /> {post.commentCount || 0}
                  </span>
                  {ts && <span>{formatDistanceToNow(ts, { addSuffix: true })}</span>}
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
