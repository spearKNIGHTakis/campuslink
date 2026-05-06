// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendEmailVerification, sendPasswordResetEmail,
  updateProfile, onAuthStateChanged,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser)
      if (firebaseUser) {
        let p = await getUserProfile(firebaseUser.uid)
        if (!p) {
          // First time — create profile and auto-approve
          await createUserProfile(firebaseUser.uid, {
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            photoURL:    firebaseUser.photoURL || '',
          })
          p = await getUserProfile(firebaseUser.uid)
        }
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Email/password register ───────────────────────────────────────────────
  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await sendEmailVerification(cred.user)
    await createUserProfile(cred.user.uid, { email, displayName })
    return cred.user
  }

  // ── Email/password login ──────────────────────────────────────────────────
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  // ── Google Sign-In ────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithRedirect(auth, provider)
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  async function refreshProfile() {
    if (user) {
      const p = await getUserProfile(user.uid)
      setProfile(p)
    }
  }

  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com'

  const value = {
    user, profile, loading,
    isEmailVerified: isGoogle ? true : (user?.emailVerified ?? false),
    isApproved:      profile?.status === 'approved',
    isVerified:      profile?.isVerified === true,
    register, login, loginWithGoogle,
    logout, resetPassword, refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
