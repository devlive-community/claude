import { create } from 'zustand'

export type ToastType = 'success' | 'coin' | 'info' | 'warn'

export interface ToastItem {
  id: number
  type: ToastType
  title: string
  desc?: string
}

export interface CoinFlight {
  id: number
  from: { x: number; y: number }
  count: number
}

let uid = 0

interface UIState {
  toasts: ToastItem[]
  pushToast: (t: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: number) => void

  flights: CoinFlight[]
  flyCoins: (from: { x: number; y: number }, count?: number) => void
  removeFlight: (id: number) => void
  coinPulse: number

  inviteOpen: boolean
  inviteMode: 'bargain' | 'chats'
  openInvite: (mode: 'bargain' | 'chats') => void
  closeInvite: () => void

  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  toasts: [],
  pushToast: (t) => {
    const id = ++uid
    set((s) => ({ toasts: [...s.toasts.slice(-4), { ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3600)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  flights: [],
  coinPulse: 0,
  flyCoins: (from, count = 6) => {
    const id = ++uid
    set((s) => ({ flights: [...s.flights, { id, from, count }] }))
  },
  removeFlight: (id) =>
    set((s) => ({
      flights: s.flights.filter((f) => f.id !== id),
      coinPulse: s.coinPulse + 1,
    })),

  inviteOpen: false,
  inviteMode: 'bargain',
  openInvite: (mode) => set({ inviteOpen: true, inviteMode: mode }),
  closeInvite: () => set({ inviteOpen: false }),
}))
