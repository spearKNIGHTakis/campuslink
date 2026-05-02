// src/components/ui/VideoPlayer.jsx
import { useRef, useState, useEffect } from 'react'
import Icon from './Icon'
import { B } from '@/lib/theme'

export default function VideoPlayer({ url, thumbURL, duration, style = {} }) {
  const videoRef  = useRef()
  const [playing, setPlaying]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted]       = useState(true)
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime  = () => setProgress((v.currentTime / v.duration) * 100 || 0)
    const onEnd   = () => { setPlaying(false); setProgress(0); v.currentTime = 0 }
    const onLoad  = () => setLoaded(true)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended',      onEnd)
    v.addEventListener('loadeddata', onLoad)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended',      onEnd)
      v.removeEventListener('loadeddata', onLoad)
    }
  }, [])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else         { v.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  function toggleMute(e) {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(m => !m)
    }
  }

  function handleSeek(e) {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    v.currentTime = pct * v.duration
  }

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div onClick={togglePlay} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#000', cursor: 'pointer', ...style }}>
      <video
        ref={videoRef}
        src={url}
        poster={thumbURL}
        muted={muted}
        playsInline
        preload="metadata"
        style={{ width: '100%', maxHeight: 420, display: 'block', objectFit: 'cover' }}
      />

      {/* Play/pause overlay */}
      {!playing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <Icon name="play" size={20} color="#fff" style={{ marginLeft: 3 }} />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '20px 10px 8px' }} onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div onClick={handleSeek} style={{ height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 8, cursor: 'pointer', position: 'relative' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: B.vibrantPurple, borderRadius: 2, transition: 'width 0.1s linear', boxShadow: `0 0 6px ${B.vibrantPurple}` }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 2 }}>
            <Icon name={playing ? 'pause' : 'play'} size={14} color="#fff" />
          </button>

          {duration && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
              {loaded && videoRef.current ? fmt(videoRef.current.currentTime) : '0:00'} / {fmt(duration)}
            </span>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 2 }}>
            <Icon name={muted ? 'muted' : 'volume'} size={14} color="#fff" />
          </button>
        </div>
      </div>

      {/* Duration badge (when not playing) */}
      {!playing && duration && (
        <div style={{ position: 'absolute', bottom: 36, right: 10, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '2px 7px', fontSize: 11, color: '#fff', fontFamily: 'monospace' }}>
          {fmt(duration)}
        </div>
      )}
    </div>
  )
}
