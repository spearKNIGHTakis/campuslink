// src/hooks/useVideoUpload.js
import { useState, useRef } from 'react'
import { uploadPostVideo } from '@/lib/storage'

const MAX_DURATION = 60 // seconds
const MAX_SIZE_MB  = 100

export function useVideoUpload(uid) {
  const [video, setVideo]         = useState(null)   // { file, url, duration, thumbURL }
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState(null)
  const inputRef = useRef()

  function openPicker() { inputRef.current?.click() }

  function handlePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    // Size check
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_SIZE_MB}MB`)
      return
    }

    // Duration check via a temporary video element
    const tempURL = URL.createObjectURL(file)
    const tempVid = document.createElement('video')
    tempVid.preload = 'metadata'
    tempVid.src     = tempURL

    tempVid.onloadedmetadata = () => {
      URL.revokeObjectURL(tempURL)
      if (tempVid.duration > MAX_DURATION) {
        setError(`Video must be ${MAX_DURATION} seconds or less (yours is ${Math.round(tempVid.duration)}s)`)
        return
      }
      setVideo({
        file,
        localURL:  URL.createObjectURL(file),
        duration:  tempVid.duration,
        thumbURL:  null,
        uploaded:  false,
      })
    }

    tempVid.onerror = () => {
      URL.revokeObjectURL(tempURL)
      setError('Could not read video file')
    }
  }

  async function uploadVideo() {
    if (!video?.file || video.uploaded) return video
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadPostVideo(uid, video.file, pct => setProgress(pct))
      const uploaded = { ...video, ...result, uploaded: true }
      setVideo(uploaded)
      return uploaded
    } catch (err) {
      setError('Upload failed — try again')
      throw err
    } finally {
      setUploading(false)
    }
  }

  function clearVideo() {
    if (video?.localURL) URL.revokeObjectURL(video.localURL)
    setVideo(null)
    setError(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return {
    video, uploading, progress, error,
    inputRef, openPicker, handlePick,
    uploadVideo, clearVideo,
  }
}
