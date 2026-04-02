import { create } from 'zustand'
import { subscribeAuth, fetchUserDoc } from '../services/authService'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  init: () => {
    const unsub = subscribeAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserDoc(firebaseUser.uid)
        set({ user: firebaseUser, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
    return unsub
  },

  setProfile: (profile) => set({ profile }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  isAdmin: () => get().profile?.role === 'admin',
}))
