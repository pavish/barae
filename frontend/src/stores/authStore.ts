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
  otpAutoSent: boolean
  setView: (view: AuthView) => void
  setEmail: (email: string) => void
  setViewWithEmail: (view: AuthView, email: string) => void
  setOtpAutoSent: (value: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  view: 'login',
  email: '',
  otpAutoSent: false,
  setView: (view) => set({ view }),
  setEmail: (email) => set({ email }),
  setViewWithEmail: (view, email) => set({ view, email }),
  setOtpAutoSent: (value) => set({ otpAutoSent: value }),
  reset: () => set({ view: 'login', email: '', otpAutoSent: false }),
}))
