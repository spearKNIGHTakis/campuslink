// src/lib/reputation.js
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export const POINTS = {
  POST_CREATED:    10,
  POST_LIKED:       2,
  COMMENT_POSTED:   5,
  GROUP_JOINED:     8,
  EVENT_RSVP:      10,
  FRIEND_MADE:      5,
  PROFILE_COMPLETE:20,
  DAILY_LOGIN:      1,
  RESOURCE_SHARED: 15,
  POLL_CREATED:     8,
}

export const BADGES = [
  { id: "newcomer",     label: "Newcomer",      icon: "🌱", min: 0,    color: "#6B7280" },
  { id: "active",       label: "Active",         icon: "⚡", min: 50,   color: "#3B82F6" },
  { id: "contributor",  label: "Contributor",    icon: "🌟", min: 150,  color: "#8B5CF6" },
  { id: "champion",     label: "Champion",       icon: "🏆", min: 350,  color: "#F59E0B" },
  { id: "legend",       label: "Campus Legend",  icon: "👑", min: 750,  color: "#EF4444" },
]

export function getBadge(points = 0) {
  return [...BADGES].reverse().find(b => points >= b.min) || BADGES[0]
}

export async function awardPoints(uid, action) {
  const pts = POINTS[action]
  if (!pts || !uid) return
  try {
    await updateDoc(doc(db, 'users', uid), {
      reputationPoints: increment(pts),
      [`reputationLog.${action}`]: increment(1),
    })
  } catch (e) {
    console.warn('awardPoints failed:', e)
  }
}

export async function getLeaderboard(university, faculty) {
  // Leaderboard is queried from users collection filtered by uni + faculty
  // Returns top 10 sorted by reputationPoints
  const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
  let q = query(
    collection(db, 'users'),
    where('status', '==', 'approved'),
    where('university', '==', university),
    orderBy('reputationPoints', 'desc'),
    limit(10)
  )
  if (faculty) {
    q = query(
      collection(db, 'users'),
      where('status', '==', 'approved'),
      where('university', '==', university),
      where('faculty', '==', faculty),
      orderBy('reputationPoints', 'desc'),
      limit(10)
    )
  }
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() }))
}
