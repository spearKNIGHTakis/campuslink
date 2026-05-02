// src/components/feed/PostComposer.jsx
// Reusable composer for feed, groups, and anywhere posts are created
import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createPost } from '@/lib/db'
import { uploadPostMedia, uploadPostVideo } from '@/lib/storage'
import { awardPoints } from '@/lib/reputation'
import { Avatar, Card, Btn, Spinner } from '@/components/ui'
import Icon from '@/components/ui/Icon'
import { B } from '@/lib/theme'
import toast from 'react-hot-toast'

const MAX_VIDEO_DURATION = 60
const MAX_VIDEO_MB       = 100

export default function PostComposer({ onPost, groupId, placeholder }) {
  const { user, profile } = useAuth()

  const [text, setText]           = useState('')
  const [media, setMedia]         = useState(null)   // { file, localURL, type: 'image'|'video', duration? }
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [mediaError, setMediaError] = useState('')

  const imageRef = useRef()
  const videoRef = useRef()

  // ── Media pickers ───────────────────────────────────────────────────────────
  function pickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaError('')
    setMedia({ file, localURL: URL.createObjectURL(file), type: 'image' })
  }

  function pickVideo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaError('')

    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMediaError(`Video must be under ${MAX_VIDEO_MB}MB`)
      return
    }

    const tempURL = URL.createObjectURL(file)
    const tempVid = document.createElement('video')
    tempVid.preload = 'metadata'
    tempVid.src     = tempURL

    tempVid.onloadedmetadata = () => {
      URL.revokeObjectURL(tempURL)
      if (tempVid.duration > MAX_VIDEO_DURATION) {
        setMediaError(`Clips must be ${MAX_VIDEO_DURATION}s or less — yours is ${Math.round(tempVid.duration)}s`)
        return
      }
      setMedia({ file, localURL: URL.createObjectURL(file), type: 'video', duration: tempVid.duration })
    }
    tempVid.onerror = () => { URL.revokeObjectURL(tempURL); setMediaError('Could not read video') }
  }

  function clearMedia() {
    if (media?.localURL) URL.revokeObjectURL(media.localURL)
    setMedia(null)
    setMediaError('')
    setProgress(0)
    if (imageRef.current) imageRef.current.value = ''
    if (videoRef.current) videoRef.current.value = ''
  }

  // ── Post submit ─────────────────────────────────────────────────────────────
  async function handlePost() {
    if (!text.trim() && !media) return toast.error('Write something or attach media')
    setUploading(true)
    try {
      let mediaURL  = ''
      let mediaType = ''
      let videoDuration = null

      if (media?.type === 'image') {
        mediaURL  = await uploadPostMedia(user.uid, media.file, pct => setProgress(pct))
        mediaType = 'image'
      } else if (media?.type === 'video') {
        const result = await uploadPostVideo(user.uid, media.file, pct => setProgress(pct))
        mediaURL      = result.url
        mediaType     = 'video'
        videoDuration = result.duration
      }

      await createPost(user.uid, profile, text.trim(), mediaURL, mediaType, videoDuration)
      await awardPoints(user.uid, 'POST_CREATED')

      setText('')
      clearMedia()
      toast.success('Posted! +10 pts 🎉')
      onPost?.()
    } catch (err) {
      toast.error('Failed to post — try again')
      console.error(err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const canPost = (text.trim() || media) && !uploading

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar src={profile?.photoURL} initials={profile?.displayName} glow />
        <div style={{ flex: 1 }}>
          {/* Text input */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={placeholder || `What's on your mind, ${profile?.displayName?.split(' ')[0] || 'student'}?`}
            rows={3}
            style={{ width: '100%', background: `${B.midPurple}12`, border: `1.5px solid ${B.inkLight}`, borderRadius: 12, padding: '10px 12px', color: 'var(--cl-text)', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />

          {/* Media preview */}
          {media && (
            <div style={{ position: 'relative', marginTop: 8 }}>
              {media.type === 'image' ? (
                <img src={media.localURL} alt="preview" style={{ width: '100%', borderRadius: 10, maxHeight: 240, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ position: 'relative' }}>
                  <video src={media.localURL} controls muted playsInline style={{ width: '100%', borderRadius: 10, maxHeight: 240, objectFit: 'cover', display: 'block', background: '#000' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="video" size={11} color="#fff" />
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                      {Math.round(media.duration)}s clip
                    </span>
                  </div>
                </div>
              )}
              <button onClick={clearMedia} style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" size={12} color="#fff" />
              </button>
            </div>
          )}

          {/* Media error */}
          {mediaError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: B.coral }}>
              <Icon name="warning" size={12} color={B.coral} />
              {mediaError}
            </div>
          )}

          {/* Upload progress */}
          {uploading && progress > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--cl-muted)' }}>Uploading {media?.type}…</span>
                <span style={{ fontSize: 11, color: B.vibrantPurple, fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--cl-border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${B.midPurple},${B.vibrantPurple})`, borderRadius: 2, transition: 'width 0.2s', boxShadow: `0 0 8px ${B.vibrantPurple}60` }} />
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {/* Image picker */}
              <button
                onClick={() => imageRef.current?.click()}
                disabled={!!media || uploading}
                title="Upload image"
                style={{ background: 'none', border: 'none', cursor: media ? 'not-allowed' : 'pointer', padding: '6px 8px', borderRadius: 8, color: media ? 'var(--cl-border)' : 'var(--cl-muted)', transition: 'all 0.15s', opacity: media ? 0.4 : 1 }}
              >
                <Icon name="image" size={18} />
              </button>
              <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImage} />

              {/* Video picker */}
              <button
                onClick={() => videoRef.current?.click()}
                disabled={!!media || uploading}
                title="Upload video clip (max 60s)"
                style={{ background: 'none', border: 'none', cursor: media ? 'not-allowed' : 'pointer', padding: '6px 8px', borderRadius: 8, color: media ? 'var(--cl-border)' : 'var(--cl-muted)', transition: 'all 0.15s', opacity: media ? 0.4 : 1, position: 'relative' }}
              >
                <Icon name="video" size={18} />
              </button>
              <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={pickVideo} />

              {/* Max duration hint */}
              {!media && (
                <span style={{ fontSize: 10, color: 'var(--cl-muted)', alignSelf: 'center', marginLeft: 4 }}>
                  Images & clips up to 60s
                </span>
              )}
            </div>

            <Btn onClick={handlePost} disabled={!canPost} size="sm" style={{ minWidth: 70 }}>
              {uploading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Spinner size={12} /> {progress > 0 ? `${progress}%` : '…'}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="send" size={12} color="#fff" /> Post
                </span>
              )}
            </Btn>
          </div>
        </div>
      </div>
    </Card>
  )
}
