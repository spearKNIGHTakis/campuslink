// src/lib/storage.js
// Cloudinary — free tier, no Firebase Storage needed

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload a file to Cloudinary with progress tracking
 * @param {File} file
 * @param {string} folder - e.g. 'profilePhotos', 'studentIds', 'postMedia'
 * @param {Function} onProgress - receives 0-100
 * @returns {Promise<string>} secure_url
 */
export function uploadFile(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', `campuslink/${folder}`)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        onProgress?.(pct)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText)
        resolve(res.secure_url)
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload network error')))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(formData)
  })
}

export async function uploadProfilePhoto(uid, file, onProgress) {
  return uploadFile(file, `profilePhotos/${uid}`, onProgress)
}

export async function uploadStudentId(uid, file, onProgress) {
  if (file.type === 'application/pdf') {
    return uploadRaw(file, `studentIds/${uid}`, onProgress)
  }
  return uploadFile(file, `studentIds/${uid}`, onProgress)
}

export async function uploadPostMedia(uid, file, onProgress) {
  return uploadFile(file, `postMedia/${uid}`, onProgress)
}

export function uploadRaw(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', `campuslink/${folder}`)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText)
        resolve(res.secure_url)
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`)
    xhr.send(formData)
  })
}

export async function deleteFile(url) {
  console.log('deleteFile: skipped on client side', url)
}

/**
 * Upload a short video clip (max 60s) to Cloudinary
 * Uses the video upload endpoint with eager transformation for web playback
 */
export function uploadVideo(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', `campuslink/${folder}`)
    formData.append('resource_type', 'video')
    // Auto-transcode to mp4 + webm for broad browser support
    formData.append('eager', 'f_mp4,q_auto:good|f_webm,q_auto:good')
    formData.append('eager_async', 'true')

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText)
        resolve({
          url:      res.secure_url,
          duration: res.duration,       // seconds
          width:    res.width,
          height:   res.height,
          thumbURL: res.secure_url.replace(/\.[^.]+$/, '.jpg').replace('/video/upload/', '/video/upload/so_0/'),
        })
      } else {
        reject(new Error(`Video upload failed: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Video upload network error')))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)
    xhr.send(formData)
  })
}

export async function uploadPostVideo(uid, file, onProgress) {
  return uploadVideo(file, `postVideos/${uid}`, onProgress)
}

// Ensure the cloud name is correctly retrieved from your environment variables
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
    console.error("Cloudinary Cloud Name is undefined. Check your .env file.");
}

const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
// Proceed with fetch or XMLHttpRequest using the validated url
