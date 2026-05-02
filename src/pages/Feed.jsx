// src/pages/Feed.jsx
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import useStore from '@/store/useStore'
import { listenFeed, toggleLike, createPost, addComment, listenComments, deletePost } from '@/lib/db'
import { Avatar, Card, Btn, Skeleton, Empty, Spinner } from '@/components/ui'
import VideoPlayer from '@/components/ui/VideoPlayer'
import PostComposer from '@/components/feed/PostComposer'
import ProfilePrompt from '@/components/feed/ProfilePrompt'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'
import { getBadge } from '@/lib/reputation'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function PostSkeleton() {
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Skeleton width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width="50%" height={13} />
          <Skeleton width="35%" height={11} />
        </div>
      </div>
      <Skeleton height={14} style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="80%" style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="60%" />
    </Card>
  )
}

function CommentItem({ comment }) {
  const ts = comment.createdAt?.toDate?.()
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
      <Avatar src={comment.authorPhoto} initials={comment.authorName} size={28} />
      <div style={{ flex: 1 }}>
        <div style={{ background: `${B.midPurple}15`, borderRadius: '4px 12px 12px 12px', padding: '8px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cl-text)', marginBottom: 2 }}>{comment.authorName}</div>
          <div style={{ fontSize: 13, color: 'var(--cl-text)', lineHeight: 1.5 }}>{comment.text}</div>
        </div>
        {ts && <div style={{ fontSize: 10, color: 'var(--cl-muted)', marginTop: 3, paddingLeft: 4 }}>{formatDistanceToNow(ts, { addSuffix: true })}</div>}
      </div>
    </div>
  )
}

function PostCard({ post, currentUid }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]         = useState([])
  const [commentText, setCommentText]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const { profile } = useAuth()
  const updateLike  = useStore(s => s.updatePostLike)
  const removePost  = useStore(s => s.removePost)
  const badge = getBadge(post.authorPoints || 0)

  const liked = post.likes?.includes(currentUid)
  const ts    = post.createdAt?.toDate?.()

  useEffect(() => {
    if (!showComments) return
    const unsub = listenComments(post.id, setComments)
    return unsub
  }, [showComments, post.id])

  async function handleLike() {
    updateLike(post.id, currentUid, !liked)
    try { await toggleLike(post.id, currentUid) }
    catch { updateLike(post.id, currentUid, liked) }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await addComment(post.id, currentUid, profile, commentText.trim())
      await awardPoints(currentUid, 'COMMENT_POSTED')
      setCommentText('')
    } catch { toast.error('Failed to post comment') }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(post.id, currentUid)
      removePost(post.id)
      toast.success('Post deleted')
    } catch { toast.error('Could not delete post') }
  }

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
        <Avatar src={post.authorPhoto} initials={post.authorName} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14 }}>{post.authorName}</span>
            {post.authorVerified && <span style={{ fontSize: 11, color: B.mint, fontWeight: 700 }}>✓</span>}
            <span style={{ fontSize: 11 }}>{badge.icon}</span>
          </div>
          <div style={{ color: 'var(--cl-muted)', fontSize: 11 }}>
            {post.authorProgram}{post.authorUniversity ? ` · ${post.authorUniversity}` : ''}
            {ts ? ` · ${formatDistanceToNow(ts, { addSuffix: true })}` : ''}
          </div>
        </div>
        {post.authorId === currentUid && (
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'var(--cl-muted)', fontSize: 18, cursor: 'pointer', padding: 4 }}>🗑</button>
        )}
      </div>

      <p style={{ color: 'var(--cl-text)', fontSize: 14, lineHeight: 1.65, marginBottom: post.mediaURL ? 10 : 0 }}>{post.content}</p>

      {post.mediaURL && post.mediaType === 'video' ? (
        <VideoPlayer
          url={post.mediaURL}
          thumbURL={post.thumbURL}
          duration={post.videoDuration}
          style={{ marginTop: 8 }}
        />
      ) : post.mediaURL ? (
        <img src={post.mediaURL} alt="post" style={{ width: '100%', borderRadius: 12, marginTop: 8, maxHeight: 400, objectFit: 'cover', display: 'block' }} />
      ) : null}

      <div style={{ display: 'flex', gap: 20, paddingTop: 10, marginTop: 10, borderTop: '1px solid var(--cl-border)' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: liked ? B.coral : 'var(--cl-muted)', fontWeight: 700, fontSize: 13, transition: 'color 0.2s', fontFamily: 'inherit' }}>
          {liked ? '❤️' : '🤍'} {post.likeCount || 0}
        </button>
        <button onClick={() => setShowComments(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: showComments ? B.vibrantPurple : 'var(--cl-muted)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
          💬 {post.commentCount || 0}
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cl-muted)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>↗ Share</button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12 }}>
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Avatar src={profile?.photoURL} initials={profile?.displayName} size={28} />
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…" style={{ flex: 1, background: `${B.midPurple}15`, border: `1px solid var(--cl-border)`, borderRadius: 20, padding: '7px 14px', color: 'var(--cl-text)', fontSize: 13, outline: 'none' }} />
            <button type="submit" disabled={submitting} style={{ background: `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})`, border: 'none', borderRadius: 20, padding: '7px 14px', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              {submitting ? '…' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </Card>
  )
}

function Composer({ uid, profile }) {
  const setPosts = useStore(s => s.setPosts)
  const posts    = useStore(s => s.posts)
  const [text, setText]       = useState('')
  const [media, setMedia]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  function pickFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMedia(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handlePost() {
    if (!text.trim() && !media) return toast.error('Write something first')
    setLoading(true)
    try {
      let mediaURL = '', mediaType = ''
      if (media) { mediaURL = await uploadPostMedia(uid, media); mediaType = 'image' }
      await createPost(uid, profile, text.trim(), mediaURL, mediaType)
      await awardPoints(uid, 'POST_CREATED')
      setText(''); setMedia(null); setPreview(null)
      toast.success('Posted! +10 pts 🎉')
    } catch { toast.error('Failed to post. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar src={profile?.photoURL} initials={profile?.displayName} glow />
        <div style={{ flex: 1 }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={`What's on your mind, ${profile?.displayName?.split(' ')[0] || 'student'}?`}
            rows={3}
            style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '10px 12px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
          {preview && (
            <div style={{ position: 'relative', marginTop: 8 }}>
              <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 10, maxHeight: 220, objectFit: 'cover' }} />
              <button onClick={() => { setMedia(null); setPreview(null) }} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 26, height: 26, color: '#fff', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>📷</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickFile} />
            <Btn onClick={handlePost} disabled={loading || (!text.trim() && !media)} size="sm">
              {loading ? <Spinner size={14} /> : 'Post'}
            </Btn>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Right panel for desktop
function RightPanel() {
  const navigate = useNavigate()
  return (
    <div className="right-panel">
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12 }}>🏆 Leaderboard</div>
        <div style={{ fontSize: 12, color: 'var(--cl-muted)', marginBottom: 10 }}>Top contributors this week</div>
        <button onClick={() => navigate('/leaderboard')} style={{ width: '100%', background: `${B.vibrantPurple}15`, border: `1px solid ${B.vibrantPurple}30`, borderRadius: 10, padding: '8px 12px', color: B.vibrantPurple, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          View Full Leaderboard →
        </button>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cl-text)', marginBottom: 12 }}>📚 Quick Links</div>
        {[['📋 Assignments', '/assignments'],['📊 GPA Tracker', '/gpa'],['🏛️ Study Rooms', '/studyrooms'],['📚 Marketplace', '/marketplace']].map(([label, path]) => (
          <button key={path} onClick={() => navigate(path)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', color: 'var(--cl-muted)', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--cl-border)', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </Card>
    </div>
  )
}

export default function Feed() {
  const { user, profile } = useAuth()
  const posts    = useStore(s => s.posts)
  const setPosts = useStore(s => s.setPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = listenFeed(null, (newPosts) => {
      setPosts(newPosts)
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <div className="feed-layout">
      <div className="feed-main">
        <ProfilePrompt />
        <PostComposer onPost={() => {}} />
        {loading ? [1,2,3].map(i => <PostSkeleton key={i} />) :
         posts.length === 0 ? <Empty icon="📭" title="No posts yet" subtitle="Be the first to post something!" /> :
         posts.map(post => <PostCard key={post.id} post={post} currentUid={user.uid} />)
        }
      </div>
      <RightPanel />
    </div>
  )
}
