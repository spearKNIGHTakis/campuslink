// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUserProfile, getUserProfile } from '@/lib/db'

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
        // Handle Google redirect result — create profile if new user
        if (!p) {
          await createUserProfile(firebaseUser.uid, {
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName,
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

  // ── Google Sign-In (redirect — avoids COOP popup warnings) ──────────────
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    // Redirects away and back — profile creation handled in onAuthStateChanged
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

  const value = {
    user,
    profile,
    loading,
    // Google emails are always verified by Google
    isEmailVerified: user?.emailVerified ?? false,
    isApproved:      profile?.status === 'approved',
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
