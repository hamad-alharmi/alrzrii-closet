import { create } from 'zustand'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  init() {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        const profile = profileSnap.exists() ? profileSnap.data() : null
        set({ user: firebaseUser, profile, loading: false, initialized: true })
      } else {
        set({ user: null, profile: null, loading: false, initialized: true })
      }
    })
  },

  async register(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, email: cred.user.email, role: 'user', createdAt: serverTimestamp() })
    const profileSnap = await getDoc(doc(db, 'users', cred.user.uid))
    set({ user: cred.user, profile: profileSnap.data() })
    return cred.user
  },

  async login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const profileSnap = await getDoc(doc(db, 'users', cred.user.uid))
    set({ user: cred.user, profile: profileSnap.data() })
    return cred.user
  },

  async logout() {
    await signOut(auth)
    set({ user: null, profile: null })
  },

  async refreshProfile() {
    const { user } = get()
    if (!user) return
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) set({ profile: snap.data() })
  },

  isAdmin() { return get().profile?.role === 'admin' },
}))
