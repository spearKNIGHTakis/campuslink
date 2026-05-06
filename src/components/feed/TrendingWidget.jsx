// src/components/feed/TrendingWidget.jsx
// Sidebar widget (desktop) + inline section (mobile) for trending content
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrendingHashtags, getTopPosts, getUpcomingEvents } from '@/lib/hashtags'
import { joinGroup, isGroupMember } from '@/lib/db'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Card, Btn, Skeleton } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function TrendingWidget() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hashtags, setHashtags] = useState([])
  const [topPost, setTopPost]   = useState(null)
  const [events, setEvents]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getTrendingHashtags(6),
      getTopPosts(1),
      getUpcomingEvents(2),
    ]).then(([h, p, e]) => {
      setHashtags(h)
      setTopPost(p[0] || null)
      setEvents(e)
      setLoading(false)
    })
  }, [])

  return (
    <div className="right-panel">
      {/* Trending hashtags */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="trending" size={13} color={B.vibrantPurple} /> Trending
          </span>
          <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', color: B.vibrantPurple, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            See all
          </button>
        </div>
        {loading ? [1,2,3].map(i => <Skeleton key={i} height={28} style={{ marginBottom: 8 }} />) :
         hashtags.length === 0 ? (
           <div style={{ fontSize: 12, color: 'var(--cl-muted)', textAlign: 'center', padding: '12px 0' }}>
             No trending topics yet
           </div>
         ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
             {hashtags.map((h, i) => (
               <button key={h.tag} onClick={() => navigate('/explore')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', width: '100%', fontFamily: 'inherit', borderBottom: i < hashtags.length - 1 ? '1px solid var(--cl-border)' : 'none' }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                   <Icon name="hashtag" size={11} color="var(--cl-muted)" />
                   <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cl-text)' }}>{h.tag}</span>
                   {h.score >= 5 && <Icon name="fire" size={10} color={B.coral} />}
                 </span>
                 <span style={{ fontSize: 11, color: 'var(--cl-muted)' }}>{h.count}</span>
               </button>
             ))}
           </div>
         )
        }
      </Card>

      {/* Top post this week */}
      {topPost && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="trophy" size={13} color={B.gold} /> Top Post This Week
          </div>
          <div onClick={() => navigate(`/profile/${topPost.authorId}`)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <Avatar src={topPost.authorPhoto} initials={topPost.authorName} size={28} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--cl-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {topPost.authorName}
                  {topPost.authorVerified && <Icon name="verified" size={9} color={B.mint} />}
                  {topPost.isOfficial && <Icon name="official" size={9} color={B.gold} />}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--cl-text)', lineHeight: 1.55, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {topPost.content}
            </p>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              <span style={{ color: B.coral, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="like" size={10} color={B.coral} /> {topPost.likeCount || 0}
              </span>
              <span style={{ color: 'var(--cl-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="comment" size={10} /> {topPost.commentCount || 0}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming events */}
      {events.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="calendarPlus" size={13} color={B.vibrantPurple} /> Events
            </span>
            <button onClick={() => navigate('/events')} style={{ background: 'none', border: 'none', color: B.vibrantPurple, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              See all
            </button>
          </div>
          {events.map((e, i) => (
            <div key={e.id} onClick={() => navigate('/events')} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < events.length - 1 ? '1px solid var(--cl-border)' : 'none', cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${B.vibrantPurple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {e.icon || '📅'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--cl-text)' }}>{e.title}</div>
                <div style={{ fontSize: 11, color: 'var(--cl-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="calendar" size={9} /> {e.date}
                  {e.location && <><span>·</span>{e.location}</>}
                </div>
                <div style={{ fontSize: 11, color: B.mint, marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="userCheck" size={9} color={B.mint} /> {e.rsvpCount || 0} going
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Quick links */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 10 }}>Quick Links</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { icon: 'explore',      label: 'Explore',        path: '/explore'     },
            { icon: 'leaderboard',  label: 'Leaderboard',    path: '/leaderboard' },
            { icon: 'marketplace',  label: 'Marketplace',    path: '/marketplace' },
            { icon: 'assignments',  label: 'Assignments',    path: '/assignments' },
            { icon: 'gpa',          label: 'GPA Tracker',    path: '/gpa'         },
            { icon: 'studyrooms',   label: 'Study Rooms',    path: '/studyrooms'  },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--cl-muted)', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${B.vibrantPurple}10`; e.currentTarget.style.color = B.vibrantPurple }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--cl-muted)' }}
            >
              <Icon name={item.icon} size={13} style={{ width: 16 }} />
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div style={{ fontSize: 11, color: 'var(--cl-muted)', lineHeight: 1.7, paddingLeft: 4 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>CampusLink GH</div>
        Ghana University Network · 2025<br />
        Built for students, by students 🇬🇭
      </div>
    </div>
  )
}
