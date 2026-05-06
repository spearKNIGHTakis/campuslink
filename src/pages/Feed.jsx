// src/pages/Feed.jsx
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import useStore from '@/store/useStore'
import { listenFeed, toggleLike, createPost, addComment, listenComments, deletePost } from '@/lib/db'
import { uploadPostMedia, uploadPostVideo } from '@/lib/storage'
import { awardPoints } from '@/lib/reputation'
import { extractHashtags, recordHashtags, parseContent } from '@/lib/hashtags'
import { notifyLike, notifyComment } from '@/lib/notifications'
import { Avatar, Card, Btn, Skeleton, Empty, Spinner } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import VideoPlayer from '@/components/ui/VideoPlayer'
import ProfilePrompt from '@/components/feed/ProfilePrompt'
import MobileTrending from '@/components/feed/MobileTrending'
import TrendingWidget from '@/components/feed/TrendingWidget'
import { B } from '@/lib/theme'
import { formatDistanceToNow } from 'date-fns'
import { getBadge } from '@/lib/reputation'
import toast from 'react-hot-toast'

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Skeleton width={42} height={42} style={{ borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width="50%" height={13} />
          <Skeleton width="35%" height={11} />
        </div>
      </div>
      <Skeleton height={14} style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="80%" style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="55%" />
    </Card>
  )
}

// ── Parsed content renderer (hashtags become clickable) ───────────────────────
function RichContent({ text, navigate }) {
  const segments = parseContent(text)
  return (
    <p style={{ color: 'var(--cl-text)', fontSize: 14, lineHeight: 1.7, margin: '0 0 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {segments.map((seg, i) =>
        seg.isTag ? (
          <span key={i} onClick={e => { e.stopPropagation(); navigate('/explore') }}
            style={{ color: B.vibrantPurple, fontWeight: 700, cursor: 'pointer' }}>
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  )
}

// ── Comment ───────────────────────────────────────────────────────────────────
function CommentItem({ comment }) {
  const ts = comment.createdAt?.toDate?.()
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
      <Avatar src={comment.authorPhoto} initials={comment.authorName} size={28} />
      <div style={{ flex: 1 }}>
        <div style={{ background: `${B.midPurple}15`, borderRadius: '4px 14px 14px 14px', padding: '8px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cl-text)', marginBottom: 2 }}>{comment.authorName}</div>
          <div style={{ fontSize: 13, color: 'var(--cl-text)', lineHeight: 1.5 }}>{comment.text}</div>
        </div>
        {ts && <div style={{ fontSize: 10, color: 'var(--cl-muted)', marginTop: 3, paddingLeft: 4 }}>{formatDistanceToNow(ts, { addSuffix: true })}</div>}
      </div>
    </div>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUid, currentProfile }) {
  const navigate        = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]         = useState([])
  const [commentText, setCommentText]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [likeAnim, setLikeAnim]         = useState(false)
  const updateLike = useStore(s => s.updatePostLike)
  const removePost = useStore(s => s.removePost)
  const badge      = getBadge(post.authorPoints || 0)
  const liked      = post.likes?.includes(currentUid)
  const ts         = post.createdAt?.toDate?.()
  const isOwn      = post.authorId === currentUid

  useEffect(() => {
    if (!showComments) return
    const unsub = listenComments(post.id, setComments)
    return unsub
  }, [showComments, post.id])

  async function handleLike() {
    if (likeAnim) return
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 600)
    updateLike(post.id, currentUid, !liked)
    try {
      await toggleLike(post.id, currentUid)
      if (!liked && post.authorId !== currentUid) {
        await notifyLike(post.authorId, currentProfile, post.id)
      }
    } catch { updateLike(post.id, currentUid, liked) }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await addComment(post.id, currentUid, currentProfile, commentText.trim())
      await awardPoints(currentUid, 'COMMENT_POSTED')
      if (post.authorId !== currentUid) {
        await notifyComment(post.authorId, currentProfile, post.id)
      }
      setCommentText('')
    } catch { toast.error('Failed to post comment') }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return
    try { await deletePost(post.id, currentUid); removePost(post.id); toast.success('Post deleted') }
    catch { toast.error('Could not delete post') }
  }

  function handleShare() {
    const url = `${window.location.origin}/profile/${post.authorId}`
    if (navigator.share) {
      navigator.share({ title: `${post.authorName} on CampusLink`, text: post.content.slice(0, 100), url })
    } else {
      navigator.clipboard?.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <Card style={{ marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
        <div onClick={() => navigate(`/profile/${post.authorId}`)} style={{ cursor: 'pointer' }}>
          <Avatar src={post.authorPhoto} initials={post.authorName} size={42} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span onClick={() => navigate(`/profile/${post.authorId}`)} style={{ fontWeight: 700, color: 'var(--cl-text)', fontSize: 14, cursor: 'pointer' }}>
              {post.authorName}
            </span>
            {post.authorVerified && (
              <Icon name="verified" size={13} color={B.mint} title="Verified Student" />
            )}
            {post.isOfficial && (
              <Icon name="official" size={13} color={B.gold} title="Official Account" />
            )}
            <span style={{ fontSize: 10, color: badge.color }}>{badge.icon}</span>
          </div>
          <div style={{ color: 'var(--cl-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {post.authorProgram && <span>{post.authorProgram}</span>}
            {post.authorUniversity && <><span>·</span><span>{post.authorUniversity}</span></>}
            {ts && <><span>·</span><span>{formatDistanceToNow(ts, { addSuffix: true })}</span></>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {isOwn && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: 6, cursor: 'pointer', color: 'var(--cl-muted)' }}>
              <Icon name="delete" size={13} />
            </button>
          )}
          <button style={{ background: 'none', border: 'none', padding: '4px 6px', borderRadius: 6, cursor: 'pointer', color: 'var(--cl-muted)' }}>
            <Icon name="moreV" size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <RichContent text={post.content} navigate={navigate} />

      {/* Media */}
      {post.mediaURL && post.mediaType === 'video' ? (
        <VideoPlayer url={post.mediaURL} thumbURL={post.thumbURL} duration={post.videoDuration} style={{ marginBottom: 10 }} />
      ) : post.mediaURL ? (
        <img src={post.mediaURL} alt="post media" style={{ width: '100%', borderRadius: 14, marginBottom: 10, maxHeight: 400, objectFit: 'cover', display: 'block' }} />
      ) : null}

      {/* Hashtag pills */}
      {post.hashtags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {post.hashtags.map(tag => (
            <button key={tag} onClick={() => navigate('/explore')} style={{ background: `${B.vibrantPurple}10`, border: `1px solid ${B.vibrantPurple}25`, borderRadius: 20, padding: '2px 10px', color: B.vibrantPurple, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, paddingTop: 10, borderTop: '1px solid var(--cl-border)' }}>
        {/* Like */}
        <button onClick={handleLike} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: liked ? `${B.coral}12` : 'none', border: 'none', borderRadius: 10,
          padding: '8px 6px', cursor: 'pointer', color: liked ? B.coral : 'var(--cl-muted)',
          fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
          transform: likeAnim ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s, color 0.2s',
        }}>
          <Icon name={liked ? 'like' : 'likeOutline'} size={15} color={liked ? B.coral : 'var(--cl-muted)'} />
          {post.likeCount || 0}
        </button>

        {/* Comment */}
        <button onClick={() => setShowComments(s => !s)} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: showComments ? `${B.vibrantPurple}10` : 'none', border: 'none', borderRadius: 10,
          padding: '8px 6px', cursor: 'pointer', color: showComments ? B.vibrantPurple : 'var(--cl-muted)',
          fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
        }}>
          <Icon name="comment" size={15} color={showComments ? B.vibrantPurple : 'var(--cl-muted)'} />
          {post.commentCount || 0}
        </button>

        {/* Share */}
        <button onClick={handleShare} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'none', border: 'none', borderRadius: 10,
          padding: '8px 6px', cursor: 'pointer', color: 'var(--cl-muted)',
          fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
        }}>
          <Icon name="share" size={15} color="var(--cl-muted)" />
          Share
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--cl-border)', paddingTop: 12 }}>
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Avatar src={currentProfile?.photoURL} initials={currentProfile?.displayName} size={28} />
            <input
              value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              style={{ flex: 1, background: `${B.midPurple}15`, border: `1px solid var(--cl-border)`, borderRadius: 20, padding: '7px 14px', color: 'var(--cl-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={submitting || !commentText.trim()} style={{
              background: `linear-gradient(135deg,${B.midPurple},${B.vibrantPurple})`, border: 'none',
              borderRadius: 20, padding: '7px 14px', color: '#fff', fontWeight: 700, fontSize: 12,
              cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
              opacity: !commentText.trim() ? 0.6 : 1,
            }}>
              <Icon name="send" size={11} color="#fff" />
              {submitting ? '…' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </Card>
  )
}

// ── Post Composer ─────────────────────────────────────────────────────────────
const MAX_VIDEO_S  = 60
const MAX_VIDEO_MB = 100

function Composer({ uid, profile }) {
  const setPosts    = useStore(s => s.setPosts)
  const posts       = useStore(s => s.posts)
  const [text, setText]         = useState('')
  const [media, setMedia]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [mediaErr, setMediaErr] = useState('')
  const [expanded, setExpanded] = useState(false)
  const imageRef = useRef()
  const videoRef = useRef()

  function pickImage(e) {
    const file = e.target.files?.[0]; if (!file) return
    setMediaErr(''); setMedia({ file, type: 'image', localURL: URL.createObjectURL(file) })
    setPreview(URL.createObjectURL(file))
  }

  function pickVideo(e) {
    const file = e.target.files?.[0]; if (!file) return
    setMediaErr('')
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) { setMediaErr(`Video must be under ${MAX_VIDEO_MB}MB`); return }
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video'); vid.preload = 'metadata'; vid.src = url
    vid.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      if (vid.duration > MAX_VIDEO_S) { setMediaErr(`Max ${MAX_VIDEO_S}s — yours is ${Math.round(vid.duration)}s`); return }
      setMedia({ file, type: 'video', localURL: URL.createObjectURL(file), duration: vid.duration })
    }
    vid.onerror = () => { URL.revokeObjectURL(url); setMediaErr('Could not read video') }
  }

  function clearMedia() {
    if (media?.localURL) URL.revokeObjectURL(media.localURL)
    setMedia(null); setPreview(null); setMediaErr(''); setProgress(0)
    if (imageRef.current) imageRef.current.value = ''
    if (videoRef.current) videoRef.current.value = ''
  }

  async function handlePost() {
    if (!text.trim() && !media) return toast.error('Write something or attach media')
    setLoading(true); setProgress(0)
    try {
      let mediaURL = '', mediaType = '', videoDuration = null
      if (media?.type === 'image') {
        mediaURL  = await uploadPostMedia(uid, media.file, p => setProgress(p))
        mediaType = 'image'
      } else if (media?.type === 'video') {
        const r   = await uploadPostVideo(uid, media.file, p => setProgress(p))
        mediaURL  = r.url; mediaType = 'video'; videoDuration = r.duration
      }
      const tags = extractHashtags(text)
      await createPost(uid, profile, text.trim(), mediaURL, mediaType, videoDuration, tags)
      if (tags.length) await recordHashtags(tags, profile?.university)
      await awardPoints(uid, 'POST_CREATED')
      setText(''); clearMedia(); setExpanded(false)
      toast.success('Posted! +10 pts 🎉')
    } catch (e) { toast.error('Failed to post — try again'); console.error(e) }
    finally { setLoading(false); setProgress(0) }
  }

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar src={profile?.photoURL} initials={profile?.displayName} size={40} glow />
        <div style={{ flex: 1 }}>
          {!expanded ? (
            <button onClick={() => setExpanded(true)} style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid var(--cl-border)`, borderRadius: 24, padding: '10px 16px', color: 'var(--cl-muted)', fontSize: 14, cursor: 'text', textAlign: 'left', fontFamily: 'inherit' }}>
              What's on your mind, {profile?.displayName?.split(' ')[0] || 'student'}?
            </button>
          ) : (
            <>
              <textarea
                autoFocus value={text} onChange={e => setText(e.target.value)}
                placeholder={`What's on your mind, ${profile?.displayName?.split(' ')[0] || 'student'}? Use #hashtags`}
                rows={4}
                style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.vibrantPurple}40`, borderRadius: 14, padding: '10px 12px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />

              {/* Hashtag preview */}
              {extractHashtags(text).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                  {extractHashtags(text).map(tag => (
                    <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: B.vibrantPurple, background: `${B.vibrantPurple}10`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${B.vibrantPurple}25` }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Media preview */}
              {media && (
                <div style={{ position: 'relative', marginTop: 8 }}>
                  {media.type === 'image'
                    ? <img src={media.localURL} alt="preview" style={{ width: '100%', borderRadius: 10, maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                    : <video src={media.localURL} controls muted playsInline style={{ width: '100%', borderRadius: 10, maxHeight: 220, background: '#000', display: 'block' }} />
                  }
                  <button onClick={clearMedia} style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={12} color="#fff" />
                  </button>
                  {media.type === 'video' && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="video" size={10} color="#fff" />
                      <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{Math.round(media.duration)}s clip</span>
                    </div>
                  )}
                </div>
              )}

              {mediaErr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12, color: B.coral }}>
                  <Icon name="warning" size={11} color={B.coral} /> {mediaErr}
                </div>
              )}

              {/* Progress bar */}
              {loading && progress > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: 'var(--cl-border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${B.midPurple},${B.vibrantPurple})`, borderRadius: 2, transition: 'width 0.2s', boxShadow: `0 0 8px ${B.vibrantPurple}60` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cl-muted)', marginTop: 4 }}>Uploading {media?.type}… {progress}%</div>
                </div>
              )}

              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                <button onClick={() => { imageRef.current?.click() }} disabled={!!media} title="Add image" style={{ background: 'none', border: 'none', padding: '6px 8px', borderRadius: 8, cursor: media ? 'not-allowed' : 'pointer', opacity: media ? 0.4 : 1, color: 'var(--cl-muted)' }}>
                  <Icon name="image" size={18} />
                </button>
                <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImage} />

                <button onClick={() => { videoRef.current?.click() }} disabled={!!media} title="Add video clip (max 60s)" style={{ background: 'none', border: 'none', padding: '6px 8px', borderRadius: 8, cursor: media ? 'not-allowed' : 'pointer', opacity: media ? 0.4 : 1, color: 'var(--cl-muted)' }}>
                  <Icon name="video" size={18} />
                </button>
                <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={pickVideo} />

                <span style={{ fontSize: 10, color: 'var(--cl-muted)', marginLeft: 2 }}>
                  <Icon name="hashtag" size={9} style={{ marginRight: 2 }} />
                  Use hashtags to trend
                </span>

                <div style={{ flex: 1 }} />

                <button onClick={() => { setExpanded(false); clearMedia(); setText('') }} style={{ background: 'none', border: 'none', color: 'var(--cl-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: '6px 10px' }}>
                  Cancel
                </button>
                <Btn onClick={handlePost} disabled={loading || (!text.trim() && !media)} size="sm" style={{ minWidth: 72 }}>
                  {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Spinner size={12} />{progress > 0 ? `${progress}%` : '…'}</span>
                           : <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="send" size={11} color="#fff" />Post</span>}
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

// ── Main Feed ─────────────────────────────────────────────────────────────────
export default function Feed() {
  const { user, profile } = useAuth()
  const posts    = useStore(s => s.posts)
  const setPosts = useStore(s => s.setPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = listenFeed(null, newPosts => { setPosts(newPosts); setLoading(false) })
    return unsub
  }, [])

  return (
    <div className="feed-layout">
      {/* Left: main feed */}
      <div className="feed-main">
        <ProfilePrompt />
        {/* Mobile trending strip */}
        <div className="mobile-only"><MobileTrending /></div>
        <Composer uid={user.uid} profile={profile} />
        {loading
          ? [1,2,3].map(i => <PostSkeleton key={i} />)
          : posts.length === 0
            ? <Empty icon="feed" title="No posts yet" subtitle="Be the first to post! Try using a #hashtag to get discovered." />
            : posts.map(post => <PostCard key={post.id} post={post} currentUid={user.uid} currentProfile={profile} />)
        }
      </div>

      {/* Right: trending widget */}
      <TrendingWidget />
    </div>
  )
}
