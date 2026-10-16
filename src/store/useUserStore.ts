import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayStr, weightedPick } from '../lib/utils'

export const FREE_CHATS_PER_DAY = 10
export const MAX_ADS_PER_DAY = 5
export const MAX_SHAKES_PER_DAY = 3
export const BARGAIN_BASE = 99

export type TaskId = 'sign' | 'chat' | 'ad' | 'share' | 'invite' | 'paint'
export const TASK_REWARDS: Record<TaskId, number> = {
  sign: 10,
  chat: 5,
  ad: 20,
  share: 30,
  invite: 50,
  paint: 15,
}
export const TASK_META: Record<TaskId, { title: string; action: string }> = {
  sign: { title: '每日签到', action: '去签到' },
  chat: { title: '完成一次对话', action: '去完成' },
  ad: { title: '观看广告', action: '去观看' },
  share: { title: '分享活动', action: '去分享' },
  invite: { title: '邀请好友', action: '去邀请' },
  paint: { title: '体验 AI 绘画', action: '去体验' },
}

/** 签到 7 日奖励表 */
export const SIGN_REWARDS = [10, 10, 20, 20, 30, 30, 50]

export interface BargainHelper {
  name: string
  amount: number
  ts: number
  self?: boolean
}

interface DailyState {
  date: string
  chatUsed: number
  adWatched: number
  shakeUsed: number
  spinUsed: number
  redPacketPlayed: boolean
  inviteChatClaimed: boolean
}

function freshDaily(date: string): DailyState {
  return {
    date,
    chatUsed: 0,
    adWatched: 0,
    shakeUsed: 0,
    spinUsed: 0,
    redPacketPlayed: false,
    inviteChatClaimed: false,
  }
}

const seededHelpers = (): BargainHelper[] => {
  const now = Date.now()
  return [
    { name: '老同学小张', amount: 30, ts: now - 3600_000 * 5 },
    { name: '前同事大刘', amount: 28.5, ts: now - 3600_000 * 26 },
    { name: '表妹小芳', amount: 20.6, ts: now - 3600_000 * 30 },
    { name: '隔壁老王', amount: 11, ts: now - 3600_000 * 44 },
  ]
}

interface UserState {
  coins: number
  bonusChats: number
  memberExpiresAt: number | null
  signedInToday: boolean
  signCount: number
  streak: number
  lastSignDate: string | null
  daily: DailyState
  bargain: {
    price: number
    selfCutDate: string
    helpers: BargainHelper[]
    round: number
  }
  tasks: { done: Record<TaskId, boolean>; claimed: Record<TaskId, boolean> }
  loggedIn: boolean
  nickname: string
  redPacketBest: number

  ensureDaily: () => void
  addCoins: (n: number) => void
  spendCoins: (n: number) => boolean
  grantChats: (n: number) => void
  consumeChat: () => boolean
  chatsRemaining: () => number
  watchAd: () => void
  signIn: () => number
  shakeOnce: () => number
  useSpin: () => void
  grantMember: (days: number) => void
  isMember: () => boolean
  cutBargain: (amount: number, byName: string, self?: boolean) => void
  resetBargain: () => void
  canSelfCutToday: () => boolean
  setTaskDone: (id: TaskId) => void
  claimTask: (id: TaskId) => void
  inviteChatReward: () => boolean
  markRedPacketPlayed: (earned: number) => void
  login: (nickname: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      coins: 1288,
      bonusChats: 0,
      memberExpiresAt: null,
      signedInToday: false,
      signCount: 0,
      streak: 0,
      lastSignDate: null,
      daily: freshDaily(todayStr()),
      bargain: {
        price: 8.9,
        selfCutDate: '',
        helpers: seededHelpers(),
        round: 1,
      },
      tasks: {
        done: { sign: false, chat: false, ad: false, share: false, invite: false, paint: false },
        claimed: { sign: false, chat: false, ad: false, share: false, invite: false, paint: false },
      },
      loggedIn: false,
      nickname: '',
      redPacketBest: 0,

      ensureDaily: () => {
        const today = todayStr()
        if (get().daily.date !== today) {
          set({ daily: freshDaily(today), signedInToday: false })
        }
      },

      addCoins: (n) => set((s) => ({ coins: s.coins + n })),

      spendCoins: (n) => {
        if (get().coins >= n) {
          set((s) => ({ coins: s.coins - n }))
          return true
        }
        return false
      },

      grantChats: (n) => set((s) => ({ bonusChats: s.bonusChats + n })),

      consumeChat: () => {
        const { daily, bonusChats } = get()
        if (daily.chatUsed < FREE_CHATS_PER_DAY) {
          set((s) => ({ daily: { ...s.daily, chatUsed: s.daily.chatUsed + 1 } }))
          return true
        }
        if (bonusChats > 0) {
          set((s) => ({ bonusChats: s.bonusChats - 1 }))
          return true
        }
        return false
      },

      chatsRemaining: () => {
        const { daily, bonusChats } = get()
        return Math.max(0, FREE_CHATS_PER_DAY - daily.chatUsed) + bonusChats
      },

      watchAd: () => {
        get().setTaskDone('ad')
        set((s) => ({ daily: { ...s.daily, adWatched: s.daily.adWatched + 1 } }))
      },

      signIn: () => {
        const s = get()
        if (s.signedInToday) return 0
        const today = todayStr()
        const yesterday = todayStr(new Date(Date.now() - 86_400_000))
        const streak = s.lastSignDate === yesterday ? s.streak + 1 : 1
        const signCount = s.signCount + 1
        const reward = SIGN_REWARDS[(signCount - 1) % 7]
        set({
          signedInToday: true,
          lastSignDate: today,
          streak,
          signCount,
          coins: s.coins + reward,
          tasks: { ...s.tasks, done: { ...s.tasks.done, sign: true } },
        })
        return reward
      },

      shakeOnce: () => {
        const s = get()
        if (s.daily.shakeUsed >= MAX_SHAKES_PER_DAY) return 0
        set((st) => ({ daily: { ...st.daily, shakeUsed: st.daily.shakeUsed + 1 } }))
        const reward = weightedPick([
          { v: 5, weight: 40 },
          { v: 10, weight: 30 },
          { v: 20, weight: 18 },
          { v: 50, weight: 9 },
          { v: 100, weight: 3 },
        ]).v
        set((st) => ({ coins: st.coins + reward }))
        return reward
      },

      useSpin: () => set((s) => ({ daily: { ...s.daily, spinUsed: s.daily.spinUsed + 1 } })),

      grantMember: (days) =>
        set((s) => {
          const now = Date.now()
          const from = s.memberExpiresAt && s.memberExpiresAt > now ? s.memberExpiresAt : now
          return { memberExpiresAt: from + days * 86_400_000 }
        }),

      isMember: () => {
        const e = get().memberExpiresAt
        return e !== null && e > Date.now()
      },

      cutBargain: (amount, byName, self = false) =>
        set((s) => ({
          bargain: {
            ...s.bargain,
            price: Math.max(0, Math.round((s.bargain.price - amount) * 100) / 100),
            selfCutDate: self ? todayStr() : s.bargain.selfCutDate,
            helpers: [{ name: byName, amount, ts: Date.now(), self }, ...s.bargain.helpers].slice(0, 12),
          },
        })),

      resetBargain: () =>
        set((s) => ({
          bargain: { price: BARGAIN_BASE, selfCutDate: s.bargain.selfCutDate, helpers: [], round: s.bargain.round + 1 },
        })),

      canSelfCutToday: () => get().bargain.selfCutDate !== todayStr(),

      setTaskDone: (id) =>
        set((s) => ({ tasks: { ...s.tasks, done: { ...s.tasks.done, [id]: true } } })),

      claimTask: (id) => {
        const s = get()
        if (!s.tasks.done[id] || s.tasks.claimed[id]) return
        set((st) => ({
          coins: st.coins + TASK_REWARDS[id],
          tasks: { ...st.tasks, claimed: { ...st.tasks.claimed, [id]: true } },
        }))
      },

      inviteChatReward: () => {
        if (get().daily.inviteChatClaimed) return false
        set((s) => ({
          daily: { ...s.daily, inviteChatClaimed: true },
          bonusChats: s.bonusChats + 20,
          tasks: { ...s.tasks, done: { ...s.tasks.done, invite: true } },
        }))
        return true
      },

      markRedPacketPlayed: (earned) =>
        set((s) => ({
          daily: { ...s.daily, redPacketPlayed: true },
          coins: s.coins + earned,
          redPacketBest: Math.max(s.redPacketBest, earned),
        })),

      login: (nickname) => set({ loggedIn: true, nickname }),
      logout: () => set({ loggedIn: false, nickname: '' }),
    }),
    {
      name: 'claude-china-user-v1',
      version: 1,
    },
  ),
)
