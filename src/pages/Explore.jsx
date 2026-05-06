// src/pages/Explore.jsx — Trending topics, top posts, active groups, upcoming events
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getTrendingHashtags, getTopPosts, getTrendingGroups, getUpcomingEvents, getActiveUsers, getPostsByHashtag } from '@/lib/hashtags'
import { joinGroup, isGroupMember, toggleRSVP, hasRSVPd } from '@/lib/db'
import { Avatar, Card, Btn, Skeleton, Chip } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

// ── Trending hashtag pill ─────────────────────────────────────────────────────
function HashtagPill({ tag, count, score, rank, onClick }) {
  const isHot = score >= 5
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--cl-border)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', fontFamily: 'inherit' }}
      onMouseEnter={e => e.currentTarget.style.background = `${B.vibrantPurple}08`}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${B.vibrantPurple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="hashtag" size={14} color={B.vibrantPurple} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--cl-text)' }}>#{tag}</div>
          <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{count} posts</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isHot && <Icon name="fire" size={13} color={B.coral} />}
        <Icon name="chevronRight" size={11} color="var(--cl-muted)" />
      </div>
    </button>
  )
}

// ── Top post card ─────────────────────────────────────────────────────────────
function TopPostCard({ post, navigate }) {
  const ts = post.createdAt?.toDate?.()
  return (
    <div onClick={() => navigate(`/profile/${post.authorId}`)} style={{ padding: '12px 0', borderBottom: '1px solid var(--cl-border)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 8 }}>
        <Avatar src={post.authorPhoto} initials={post.authorName} size={30} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cl-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {post.authorName}
            {post.authorVerified && <Icon name="verified" size={10} color={B.mint} />}
            {post.isOfficial && <Icon name="official" size={10} color={B.gold} />}
          </div>
          <div style={{ fontSize: 10, color: 'var(--cl-muted)' }}>{ts ? formatDistanceToNow(ts, { addSuffix: true }) : ''}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--cl-text)', lineHeight: 1.55, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.content}
      </p>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--cl-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: B.coral }}>
          <Icon name="like" size={11} color={B.coral} /> {post.likeCount || 0}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="comment" size={11} /> {post.commentCount || 0}
        </span>
      </div>
    </div>
  )
}

// ── Trending group row ────────────────────────────────────────────────────────
function TrendingGroupRow({ group, uid }) {
  const [joined, setJoined]   = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { isGroupMember(group.id, uid).then(setJoined) }, [group.id, uid])

  async function handleJoin() {
    setLoading(true)
    try { await joinGroup(group.id, uid); setJoined(true); toast.success(`Joined ${group.name}!`) }
    catch { toast.error('Could not join') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--cl-border)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${B.richPurple},${B.midPurple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {group.icon || '💬'}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>{group.name}</div>
        <div style={{ fontSize: 11, color: 'var(--cl-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="users" size={9} color="var(--cl-muted)" /> {group.memberCount || 0} members
        </div>
      </div>
      {joined
        ? <span style={{ fontSize: 11, color: B.mint, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="check" size={10} color={B.mint} /> Joined</span>
        : <Btn size="sm" onClick={handleJoin} disabled={loading}>{loading ? '…' : 'Join'}</Btn>
      }
    </div>
  )
}

// ── Hashtag posts modal ───────────────────────────────────────────────────────
function HashtagView({ tag, onBack, navigate }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPostsByHashtag(tag).then(p => { setPosts(p); setLoading(false) })
  }, [tag])

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: 'var(--cl-muted)', cursor: 'pointer', marginBottom: 16, fontSize: 13, fontFamily: 'inherit', fontWeight: 600, padding: 0 }}>
        <Icon name="back" size={13} /> Back to Explore
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${B.vibrantPurple}20`, border: `1.5px solid ${B.vibrantPurple}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="hashtag" size={20} color={B.vibrantPurple} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cl-text)' }}>#{tag}</div>
          <div style={{ fontSize: 13, color: 'var(--cl-muted)' }}>{posts.length} posts</div>
        </div>
      </div>
      {loading ? <Skeleton height={120} /> :
       posts.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--cl-muted)' }}>No posts yet for #{tag}</div> :
       <Card style={{ padding: 0, overflow: 'hidden' }}>
         {posts.map(p => <div key={p.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--cl-border)' }}>
           <div style={{ display: 'flex', gap: 9, marginBottom: 8 }}>
             <Avatar src={p.authorPhoto} initials={p.authorName} size={34} />
             <div>
               <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)' }}>{p.authorName}</div>
               <div style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{p.authorProgram}</div>
             </div>
           </div>
           <p style={{ fontSize: 13, color: 'var(--cl-text)', lineHeight: 1.6, margin: 0 }}>{p.content}</p>
         </div>)}
       </Card>
      }
    </div>
  )
}

// ── Main Explore page ─────────────────────────────────────────────────────────
export default function Explore() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hashtags, setHashtags]   = useState([])
  const [topPosts, setTopPosts]   = useState([])
  const [groups, setGroups]       = useState([])
  const [events, setEvents]       = useState([])
  const [activeUsers, setActUsers]= useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [h, p, g, e, u] = await Promise.all([
      getTrendingHashtags(10),
      getTopPosts(6),
      getTrendingGroups(5),
      getUpcomingEvents(3),
      getActiveUsers(8),
    ])
    setHashtags(h); setTopPosts(p); setGroups(g); setEvents(e); setActUsers(u)
    setLoading(false)
  }

  if (activeTag) return (
    <div className="page-container">
      <HashtagView tag={activeTag} onBack={() => setActiveTag(null)} navigate={navigate} />
    </div>
  )

  return (
    <div className="feed-layout">
      <div className="feed-main" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cl-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="explore" size={20} color={B.vibrantPurple} /> Explore
            </div>
            <div style={{ fontSize: 13, color: 'var(--cl-muted)', marginTop: 2 }}>Trending on CampusLink</div>
          </div>
          <button onClick={load} style={{ background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, padding: '7px 13px', color: B.vibrantPurple, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="refresh" size={12} color={B.vibrantPurple} /> Refresh
          </button>
        </div>

        {/* Active users row */}
        {activeUsers.length > 0 && (
          <Card style={{ padding: '16px 16px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="fire" size={14} color={B.coral} /> Active Students
            </div>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {activeUsers.map(u => (
                <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0, width: 60 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar src={u.photoURL} initials={u.displayName} size={48} />
                    {u.isVerified && (
                      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderRadius: '50%', background: B.mint, border: '2px solid var(--cl-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={8} color="#fff" />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--cl-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {u.displayName?.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Trending hashtags */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--cl-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="trending" size={15} color={B.vibrantPurple} />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--cl-text)' }}>Trending Topics</span>
          </div>
          {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} height={52} style={{ margin: '8px 16px' }} />) :
           hashtags.length === 0 ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--cl-muted)', fontSize: 13 }}>No trending topics yet — start posting with hashtags!</div> :
           hashtags.map((h, i) => <HashtagPill key={h.tag} tag={h.tag} count={h.count} score={h.score} rank={i+1} onClick={() => setActiveTag(h.tag)} />)
          }
        </Card>

        {/* Top posts this week */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--cl-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="trophy" size={15} color={B.gold} /> Top Posts This Week
          </div>
          {loading ? [1,2,3].map(i => <Skeleton key={i} height={100} style={{ marginBottom: 10 }} />) :
           topPosts.length === 0 ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--cl-muted)', fontSize: 13 }}>No posts yet</div> :
           topPosts.map(p => <TopPostCard key={p.id} post={p} navigate={navigate} />)
          }
        </Card>
      </div>

      {/* Right panel */}
      <div className="right-panel">
        {/* Trending groups */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="groups" size={13} color={B.vibrantPurple} /> Popular Groups
          </div>
          {groups.map(g => <TrendingGroupRow key={g.id} group={g} uid={user.uid} />)}
          <button onClick={() => navigate('/groups')} style={{ width: '100%', marginTop: 10, background: 'none', border: `1px solid var(--cl-border)`, borderRadius: 8, padding: '8px', color: 'var(--cl-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            View all groups <Icon name="chevronRight" size={10} />
          </button>
        </Card>

        {/* Upcoming events */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="calendarPlus" size={13} color={B.vibrantPurple} /> Upcoming Events
          </div>
          {events.length === 0 ? <div style={{ fontSize: 12, color: 'var(--cl-muted)', textAlign: 'center', padding: '12px 0' }}>No events yet</div> :
           events.map(e => (
            <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--cl-border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${B.vibrantPurple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{e.icon || '📅'}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cl-text)' }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon name="calendar" size={9} color="var(--cl-muted)" /> {e.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/events')} style={{ width: '100%', marginTop: 10, background: 'none', border: `1px solid var(--cl-border)`, borderRadius: 8, padding: '8px', color: 'var(--cl-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            View all events <Icon name="chevronRight" size={10} />
          </button>
        </Card>
      </div>
    </div>
  )
}
