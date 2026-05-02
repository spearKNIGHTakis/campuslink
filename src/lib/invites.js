// src/lib/invites.js
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function generateInviteCodes(uid, count = 5) {
  const codes = []
  for (let i = 0; i < count; i++) {
    const code = generateCode()
    await setDoc(doc(db, 'inviteCodes', code), {
      code, createdBy: uid, used: false,
      usedBy: null, createdAt: serverTimestamp(),
    })
    codes.push(code)
  }
  await updateDoc(doc(db, 'users', uid), { inviteCodes: codes })
  return codes
}

export async function validateInviteCode(code) {
  const snap = await getDoc(doc(db, 'inviteCodes', code.toUpperCase()))
  if (!snap.exists()) return { valid: false, error: 'Invalid invite code' }
  if (snap.data().used) return { valid: false, error: 'This code has already been used' }
  return { valid: true }
}

export async function useInviteCode(code, uid) {
  await updateDoc(doc(db, 'inviteCodes', code.toUpperCase()), {
    used: true, usedBy: uid, usedAt: serverTimestamp(),
  })
}

export async function getUserCodes(uid) {
  const snap = await getDocs(query(collection(db, 'inviteCodes'), where('createdBy', '==', uid)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
