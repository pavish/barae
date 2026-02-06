import { create } from 'zustand'

export type AuthView =
  | 'login'
  | 'signup'
  | 'verify-otp'
  | 'forgot-password'
  | 'reset-password'

interface AuthStore {
  view: AuthView
  email: string
  setView: (view: AuthView) => void
  setEmail: (email: string) => void
  setViewWithEmail: (view: AuthView, email: string) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  view: 'login',
  email: '',
  setView: (view) => set({ view }),
  setEmail: (email) => set({ email }),
  setViewWithEmail: (view, email) => set({ view, email }),
  reset: () => set({ view: 'login', email: '' }),
}))
