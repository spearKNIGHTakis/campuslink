// src/lib/hashtags.js
// Hashtag extraction, trending computation, and feed utilities

import {
  collection, query, where, orderBy, limit,
  getDocs, updateDoc, doc, increment,
  serverTimestamp, setDoc, getDoc, writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Extract hashtags from post content
 * Returns array of lowercase tags without the # symbol
 */
export function extractHashtags(text = '') {
  const matches = text.match(/#([a-zA-Z][a-zA-Z0-9_]{0,29})/g) || []
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))]
}

/**
 * Highlight hashtags in text — returns array of {text, isTag, tag?} segments
 */
export function parseContent(text = '') {
  const parts = text.split(/(#[a-zA-Z][a-zA-Z0-9_]{0,29})/g)
  return parts.map(part => {
    if (part.startsWith('#') && part.length > 1) {
      return { text: part, isTag: true, tag: part.slice(1).toLowerCase() }
    }
    return { text: part, isTag: false }
  })
}

/**
 * Record hashtag usage — called when a post is created
 */
export async function recordHashtags(tags = [], university = '') {
  if (!tags.length) return
  const batch = writeBatch(db)
  const now   = Date.now()
  const dayKey = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  for (const tag of tags.slice(0, 10)) { // max 10 tags per post
    const ref = doc(db, 'hashtags', tag)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      batch.update(ref, {
        count:        increment(1),
        lastUsed:     serverTimestamp(),
        [`daily.${dayKey}`]: increment(1),
      })
    } else {
      batch.set(ref, {
        tag,
        count:    1,
        lastUsed: serverTimestamp(),
        university,
        daily:    { [dayKey]: 1 },
      })
    }
  }
  await batch.commit()
}

/**
 * Get trending hashtags (last 24h activity)
 */
export async function getTrendingHashtags(limitN = 10) {
  const snap = await getDocs(
    query(collection(db, 'hashtags'), orderBy('lastUsed', 'desc'), limit(limitN * 2))
  )
  const dayKey = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  return snap.docs
    .map(d => {
      const data  = d.data()
      const today = (data.daily?.[dayKey] || 0)
      const yest  = (data.daily?.[yesterday] || 0)
      const score = today * 2 + yest // recent posts weighted more
      return { tag: data.tag, count: data.count, score, today }
    })
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitN)
}

/**
 * Get posts for a specific hashtag
 */
export async function getPostsByHashtag(tag, limitN = 20) {
  const snap = await getDocs(
    query(
      collection(db, 'posts'),
      where('hashtags', 'array-contains', tag),
      orderBy('createdAt', 'desc'),
      limit(limitN)
    )
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get most liked posts this week
 */
export async function getTopPosts(limitN = 5) {
  const snap = await getDocs(
    query(collection(db, 'posts'), orderBy('likeCount', 'desc'), limit(limitN))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get trending groups (highest member count + recent activity)
 */
export async function getTrendingGroups(limitN = 5) {
  const snap = await getDocs(
    query(collection(db, 'groups'), orderBy('memberCount', 'desc'), limit(limitN))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(limitN = 3) {
  const today = new Date().toISOString().slice(0, 10)
  const snap = await getDocs(
    query(
      collection(db, 'events'),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      limit(limitN)
    )
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get active users (recent posters)
 */
export async function getActiveUsers(limitN = 8) {
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      where('status', '==', 'approved'),
      orderBy('reputationPoints', 'desc'),
      limit(limitN)
    )
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
