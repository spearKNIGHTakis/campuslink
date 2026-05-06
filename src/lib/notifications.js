// src/lib/notifications.js
// Push notification helpers using Firebase Cloud Messaging + in-app notifications

import { createNotification } from './db'

/**
 * Send in-app notification to a user
 * toUid     — recipient
 * type      — like | comment | friendRequest | friendAccept | event | group | verified
 * message   — human-readable text
 * fromName  — sender display name
 * link      — optional navigation target
 */
export async function notify(toUid, { type, message, fromName, fromPhoto, link }) {
  if (!toUid) return
  try {
    await createNotification(toUid, { type, message, fromName, fromPhoto: fromPhoto || '', link: link || '' })
  } catch (e) {
    console.warn('notify failed:', e)
  }
}

// ── Specific notification senders ─────────────────────────────────────────────

export async function notifyLike(toUid, fromProfile, postId) {
  await notify(toUid, {
    type:     'like',
    message:  `${fromProfile.displayName} liked your post`,
    fromName: fromProfile.displayName,
    fromPhoto:fromProfile.photoURL,
    link:     `/feed`,
  })
}

export async function notifyComment(toUid, fromProfile, postId) {
  await notify(toUid, {
    type:     'comment',
    message:  `${fromProfile.displayName} commented on your post`,
    fromName: fromProfile.displayName,
    fromPhoto:fromProfile.photoURL,
    link:     `/feed`,
  })
}

export async function notifyFriendRequest(toUid, fromProfile) {
  await notify(toUid, {
    type:     'friendRequest',
    message:  `${fromProfile.displayName} sent you a friend request`,
    fromName: fromProfile.displayName,
    fromPhoto:fromProfile.photoURL,
    link:     `/friends`,
  })
}

export async function notifyFriendAccepted(toUid, fromProfile) {
  await notify(toUid, {
    type:     'friendAccept',
    message:  `${fromProfile.displayName} accepted your friend request`,
    fromName: fromProfile.displayName,
    fromPhoto:fromProfile.photoURL,
    link:     `/profile/${toUid}`,
  })
}

export async function notifyGroupJoin(toUid, groupName, joinerName) {
  await notify(toUid, {
    type:     'group',
    message:  `${joinerName} joined your group "${groupName}"`,
    fromName: joinerName,
    link:     `/groups`,
  })
}

export async function notifyVerified(toUid) {
  await notify(toUid, {
    type:     'verified',
    message:  '🎉 You are now a Verified Student! Your badge is live.',
    fromName: 'CampusLink',
    link:     `/profile`,
  })
}

export async function notifyMessage(toUid, fromProfile) {
  await notify(toUid, {
    type:     'message',
    message:  `${fromProfile.displayName} sent you a message`,
    fromName: fromProfile.displayName,
    fromPhoto:fromProfile.photoURL,
    link:     `/messages`,
  })
}
