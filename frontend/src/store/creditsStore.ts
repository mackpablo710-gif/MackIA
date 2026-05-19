import { create } from 'zustand'
import api from '../lib/api'

interface CreditsState {
  credits: number
  setCredits: (n: number) => void
  refresh: () => Promise<void>
}

export const useCreditsStore = create<CreditsState>((set) => ({
  credits: 0,
  setCredits: (n) => set({ credits: n }),
  refresh: async () => {
    try {
      const { data } = await api.get('/credits/balance')
      set({ credits: data.credits })
    } catch (_) {}
  },
}))
