// src/lib/db.js — Full Firestore service layer v2
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  increment, startAfter, writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

export const COLS = {
  users:             'users',
  posts:             'posts',
  friendRequests:    'friendRequests',
  friendships:       'friendships',
  groups:            'groups',
  events:            'events',
  conversations:     'conversations',
  notifications:     'notifications',
  verificationQueue: 'verificationQueue',
  marketplace:       'marketplace',
  assignments:       'assignments',
  roomBookings:      'roomBookings',
  gpaData:           'gpaData',
  inviteCodes:       'inviteCodes',
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export async function createUserProfile(uid, data) {
  const existing = await getDoc(doc(db, COLS.users, uid))
  if (existing.exists()) return // don't overwrite existing profiles
  await setDoc(doc(db, COLS.users, uid), {
    uid,
    displayName:      data.displayName || '',
    email:            data.email || '',
    photoURL:         data.photoURL || '',
    coverURL:         '',
    university:       '',
    faculty:          '',
    program:          '',
    year:             '',
    bio:              '',
    interests:        [],
    status:           'approved',   // auto-approved — optional student verification available
    isVerified:       false,        // earned separately by uploading student ID
    isAdmin:          false,
    verificationStep: 1,
    reputationPoints: 0,
    reputationLog:    {},
    friendCount:      0,
    postCount:        0,
    groupCount:       0,
    inviteCodes:      [],
    createdAt:        serverTimestamp(),
    updatedAt:        serverTimestamp(),
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COLS.users, uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function listenUserProfile(uid, callback) {
  return onSnapshot(doc(db, COLS.users, uid), snap => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, COLS.users, uid), { ...data, updatedAt: serverTimestamp() })
}

export async function searchUsers(queryStr, university) {
  const end = queryStr + '\uf8ff'
  let q = query(
    collection(db, COLS.users),
    where('displayName', '>=', queryStr),
    where('displayName', '<=', end),
    where('status', '==', 'approved'),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── VERIFICATION ──────────────────────────────────────────────────────────────
export async function submitVerification(uid, studentIdURL) {
  await setDoc(doc(db, COLS.verificationQueue, uid), {
    uid, studentIdURL, submittedAt: serverTimestamp(), reviewed: false,
  })
  await updateDoc(doc(db, COLS.users, uid), {
    verificationStep: 2, updatedAt: serverTimestamp(),
  })
}

// ── POSTS ─────────────────────────────────────────────────────────────────────
export async function createPost(uid, profile, content, mediaURL = '', mediaType = '', videoDuration = null, hashtags = []) {
  const ref = await addDoc(collection(db, COLS.posts), {
    authorId:       uid,
    authorName:     profile.displayName,
    authorPhoto:    profile.photoURL || '',
    authorProgram:  profile.program || '',
    authorUniversity: profile.university || '',
    authorVerified: profile.isVerified || false,
    authorPoints:   profile.reputationPoints || 0,
    content,
    mediaURL,
    mediaType,
    videoDuration,
    hashtags,
    likes:          [],
    likeCount:      0,
    commentCount:   0,
    createdAt:      serverTimestamp(),
  })
  await updateDoc(doc(db, COLS.users, uid), { postCount: increment(1) })
  return ref.id
}

export function listenFeed(lastDoc, callback) {
  let q = query(collection(db, COLS.posts), orderBy('createdAt', 'desc'), limit(20))
  if (lastDoc) q = query(q, startAfter(lastDoc))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })), snap.docs[snap.docs.length - 1])
  })
}

export async function toggleLike(postId, uid) {
  const ref  = doc(db, COLS.posts, postId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const liked = snap.data().likes.includes(uid)
  await updateDoc(ref, {
    likes:     liked ? arrayRemove(uid) : arrayUnion(uid),
    likeCount: increment(liked ? -1 : 1),
  })
}

export async function deletePost(postId, uid) {
  await deleteDoc(doc(db, COLS.posts, postId))
  await updateDoc(doc(db, COLS.users, uid), { postCount: increment(-1) })
}

export async function addComment(postId, uid, profile, text) {
  await addDoc(collection(db, COLS.posts, postId, 'comments'), {
    authorId:    uid,
    authorName:  profile.displayName,
    authorPhoto: profile.photoURL || '',
    text,
    createdAt:   serverTimestamp(),
  })
  await updateDoc(doc(db, COLS.posts, postId), { commentCount: increment(1) })
}

export function listenComments(postId, callback) {
  return onSnapshot(
    query(collection(db, COLS.posts, postId, 'comments'), orderBy('createdAt', 'asc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

// ── FRIENDS ───────────────────────────────────────────────────────────────────
export async function sendFriendRequest(fromUid, toUid, fromProfile) {
  const id = `${fromUid}_${toUid}`
  // Check if request already exists
  const existing = await getDoc(doc(db, COLS.friendRequests, id))
  if (existing.exists()) return
  await setDoc(doc(db, COLS.friendRequests, id), {
    from:        fromUid,
    to:          toUid,
    status:      'pending',
    fromName:    fromProfile?.displayName || '',
    fromPhoto:   fromProfile?.photoURL   || '',
    fromProgram: fromProfile?.program    || '',
    fromUniversity: fromProfile?.university || '',
    createdAt:   serverTimestamp(),
  })
}

export async function acceptFriendRequest(reqId, fromUid, toUid) {
  const batch = writeBatch(db)
  batch.update(doc(db, COLS.friendRequests, reqId), { status: 'accepted' })
  const [u1, u2] = [fromUid, toUid].sort()
  batch.set(doc(db, COLS.friendships, `${u1}_${u2}`), { uid1: u1, uid2: u2, createdAt: serverTimestamp() })
  batch.update(doc(db, COLS.users, fromUid), { friendCount: increment(1) })
  batch.update(doc(db, COLS.users, toUid),   { friendCount: increment(1) })
  await batch.commit()
}

export async function declineFriendRequest(reqId) {
  await updateDoc(doc(db, COLS.friendRequests, reqId), { status: 'declined' })
}

export async function unfriend(uid1, uid2) {
  const [u1, u2] = [uid1, uid2].sort()
  const batch = writeBatch(db)
  batch.delete(doc(db, COLS.friendships, `${u1}_${u2}`))
  batch.update(doc(db, COLS.users, uid1), { friendCount: increment(-1) })
  batch.update(doc(db, COLS.users, uid2), { friendCount: increment(-1) })
  await batch.commit()
}

export function listenIncomingRequests(uid, callback) {
  return onSnapshot(
    query(collection(db, COLS.friendRequests), where('to', '==', uid), where('status', '==', 'pending')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function areFriends(uid1, uid2) {
  const [u1, u2] = [uid1, uid2].sort()
  const snap = await getDoc(doc(db, COLS.friendships, `${u1}_${u2}`))
  return snap.exists()
}

export async function getFriends(uid) {
  const [s1, s2] = await Promise.all([
    getDocs(query(collection(db, COLS.friendships), where('uid1', '==', uid))),
    getDocs(query(collection(db, COLS.friendships), where('uid2', '==', uid))),
  ])
  const ids = [...s1.docs.map(d => d.data().uid2), ...s2.docs.map(d => d.data().uid1)]
  if (!ids.length) return []
  return (await Promise.all(ids.map(id => getUserProfile(id)))).filter(Boolean)
}

export async function getSuggestedUsers(uid, program, university) {
  const snap = await getDocs(query(
    collection(db, COLS.users),
    where('status', '==', 'approved'),
    where('university', '==', university),
    limit(15)
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.uid !== uid)
}

// ── GROUPS ────────────────────────────────────────────────────────────────────
export async function createGroup(uid, data) {
  const ref = await addDoc(collection(db, COLS.groups), {
    name: data.name, description: data.description || '',
    icon: data.icon || '💬', coverURL: '',
    createdBy: uid, admins: [uid],
    university: data.university || '',
    memberCount: 1, isPrivate: data.isPrivate || false,
    createdAt: serverTimestamp(),
  })
  await setDoc(doc(db, COLS.groups, ref.id, 'members', uid), {
    uid, role: 'admin', joinedAt: serverTimestamp(),
  })
  await updateDoc(doc(db, COLS.users, uid), { groupCount: increment(1) })
  return ref.id
}

export async function joinGroup(groupId, uid) {
  const batch = writeBatch(db)
  batch.set(doc(db, COLS.groups, groupId, 'members', uid), { uid, role: 'member', joinedAt: serverTimestamp() })
  batch.update(doc(db, COLS.groups, groupId), { memberCount: increment(1) })
  batch.update(doc(db, COLS.users, uid), { groupCount: increment(1) })
  await batch.commit()
}

export async function leaveGroup(groupId, uid) {
  const batch = writeBatch(db)
  batch.delete(doc(db, COLS.groups, groupId, 'members', uid))
  batch.update(doc(db, COLS.groups, groupId), { memberCount: increment(-1) })
  batch.update(doc(db, COLS.users, uid), { groupCount: increment(-1) })
  await batch.commit()
}

export function listenGroups(callback) {
  return onSnapshot(
    query(collection(db, COLS.groups), orderBy('memberCount', 'desc'), limit(30)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function isGroupMember(groupId, uid) {
  const snap = await getDoc(doc(db, COLS.groups, groupId, 'members', uid))
  return snap.exists()
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
export async function createEvent(uid, profile, data) {
  const ref = await addDoc(collection(db, COLS.events), {
    title: data.title, description: data.description || '',
    icon: data.icon || '📅', location: data.location || '',
    date: data.date, time: data.time || '',
    university: profile.university || '',
    createdBy: uid, creatorName: profile.displayName,
    rsvpCount: 0, createdAt: serverTimestamp(),
  })
  return ref.id
}

export function listenEvents(callback) {
  return onSnapshot(
    query(collection(db, COLS.events), orderBy('createdAt', 'desc'), limit(20)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function toggleRSVP(eventId, uid) {
  const rsvpRef = doc(db, COLS.events, eventId, 'rsvps', uid)
  const snap    = await getDoc(rsvpRef)
  const batch   = writeBatch(db)
  if (snap.exists()) {
    batch.delete(rsvpRef)
    batch.update(doc(db, COLS.events, eventId), { rsvpCount: increment(-1) })
  } else {
    batch.set(rsvpRef, { uid, rsvpdAt: serverTimestamp() })
    batch.update(doc(db, COLS.events, eventId), { rsvpCount: increment(1) })
  }
  await batch.commit()
  return !snap.exists()
}

export async function hasRSVPd(eventId, uid) {
  const snap = await getDoc(doc(db, COLS.events, eventId, 'rsvps', uid))
  return snap.exists()
}

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
export async function getOrCreateConversation(uid1, uid2) {
  const q    = query(collection(db, COLS.conversations), where('participants', 'array-contains', uid1))
  const snap = await getDocs(q)
  const existing = snap.docs.find(d => d.data().participants.includes(uid2))
  if (existing) return existing.id
  const ref = await addDoc(collection(db, COLS.conversations), {
    participants: [uid1, uid2],
    lastMessage: '', lastMessageAt: serverTimestamp(), lastSenderId: '',
    unreadCount: { [uid1]: 0, [uid2]: 0 },
  })
  return ref.id
}

export function listenConversations(uid, callback) {
  return onSnapshot(
    query(collection(db, COLS.conversations), where('participants', 'array-contains', uid), orderBy('lastMessageAt', 'desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function sendMessage(convId, senderUid, text, otherUid) {
  const batch = writeBatch(db)
  const msgRef = doc(collection(db, COLS.conversations, convId, 'messages'))
  batch.set(msgRef, { senderId: senderUid, text, createdAt: serverTimestamp(), read: false })
  batch.update(doc(db, COLS.conversations, convId), {
    lastMessage: text, lastMessageAt: serverTimestamp(), lastSenderId: senderUid,
    [`unreadCount.${otherUid}`]: increment(1),
  })
  await batch.commit()
}

export function listenMessages(convId, callback) {
  return onSnapshot(
    query(collection(db, COLS.conversations, convId, 'messages'), orderBy('createdAt', 'asc'), limit(60)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function markConversationRead(convId, uid) {
  await updateDoc(doc(db, COLS.conversations, convId), { [`unreadCount.${uid}`]: 0 })
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export async function createNotification(toUid, data) {
  await addDoc(collection(db, COLS.notifications, toUid, 'items'), {
    ...data, read: false, createdAt: serverTimestamp(),
  })
}

export function listenNotifications(uid, callback) {
  return onSnapshot(
    query(collection(db, COLS.notifications, uid, 'items'), orderBy('createdAt', 'desc'), limit(20)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function markNotificationRead(uid, notifId) {
  await updateDoc(doc(db, COLS.notifications, uid, 'items', notifId), { read: true })
}
