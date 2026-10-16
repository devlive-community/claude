import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayStr, weightedPick } from '../lib/utils'

export const FREE_CHATS_PER_DAY = 10
/** 每 5 小时基础额度（与官方 claude.ai 一致） */
export const SESSION_LIMIT = 10
export const SESSION_WINDOW_MS = 5 * 3600_000
/** 每周基础额度 */
export const WEEKLY_LIMIT = 100
export const WEEK_WINDOW_MS = 7 * 24 * 3600_000
/** 会员额度（更大但仍有限制） */
export const SESSION_LIMIT_MEMBER = 50
export const WEEKLY_LIMIT_MEMBER = 500

interface UsageWindow {
  used: number
  resetAt: number
}

function freshSession(): UsageWindow {
  return { used: 0, resetAt: Date.now() + SESSION_WINDOW_MS }
}

function freshWeek(): UsageWindow {
  return { used: 0, resetAt: Date.now() + WEEK_WINDOW_MS }
}
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
  session: UsageWindow
  week: UsageWindow
  bargain: {
    price: number
    selfCutDate: string
    helpers: BargainHelper[]
    round: number
  }
  tasks: { done: Record<TaskId, boolean>; claimed: Record<TaskId, boolean> }
  loggedIn: boolean
  nickname: string
  /** 当前登录手机号（模拟） */
  phone: string | null
  /** 会员归属手机号（会员跟随账号，退出/切换后失效） */
  memberPhone: string | null
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
  login: (nickname: string, phone: string) => void
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
      session: freshSession(),
      week: freshWeek(),
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
      phone: null,
      memberPhone: null,
      redPacketBest: 0,

      ensureDaily: () => {
        const today = todayStr()
        if (get().daily.date !== today) {
          set({ daily: freshDaily(today), signedInToday: false })
        }
      },

      // 金币账号隔离：未登录时收益不入账（UI 层另有拦截提示）
      addCoins: (n) => set((s) => ({ coins: s.loggedIn ? s.coins + n : s.coins })),

      spendCoins: (n) => {
        if (!get().loggedIn) return false
        if (get().coins >= n) {
          set((s) => ({ coins: s.coins - n }))
          return true
        }
        return false
      },

      grantChats: (n) => set((s) => ({ bonusChats: s.bonusChats + n })),

      consumeChat: () => {
        const s0 = get()
        const now = Date.now()
        let session = now >= s0.session.resetAt ? freshSession() : s0.session
        let week = now >= s0.week.resetAt ? freshWeek() : s0.week
        const sl = s0.isMember() ? SESSION_LIMIT_MEMBER : SESSION_LIMIT
        const wl = s0.isMember() ? WEEKLY_LIMIT_MEMBER : WEEKLY_LIMIT
        const baseLeft = Math.min(sl - session.used, wl - week.used)
        if (baseLeft > 0) {
          session = { ...session, used: session.used + 1 }
          week = { ...week, used: week.used + 1 }
          set((s) => ({
            session,
            week,
            daily: { ...s.daily, chatUsed: s.daily.chatUsed + 1 },
          }))
          return true
        }
        const { bonusChats } = s0
        if (bonusChats > 0) {
          set({ bonusChats: bonusChats - 1, session, week })
          return true
        }
        set({ session, week })
        return false
      },

      chatsRemaining: () => {
        const st = get()
        const now = Date.now()
        const su = now >= st.session.resetAt ? 0 : st.session.used
        const wu = now >= st.week.resetAt ? 0 : st.week.used
        const sl = st.isMember() ? SESSION_LIMIT_MEMBER : SESSION_LIMIT
        const wl = st.isMember() ? WEEKLY_LIMIT_MEMBER : WEEKLY_LIMIT
        const base = Math.max(0, Math.min(sl - su, wl - wu))
        return base + st.bonusChats
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
          return { memberExpiresAt: from + days * 86_400_000, memberPhone: s.phone }
        }),

      isMember: () => {
        const s = get()
        const e = s.memberExpiresAt
        return Boolean(s.loggedIn && s.phone && s.memberPhone === s.phone && e !== null && e > Date.now())
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

      login: (nickname, phone) => set({ loggedIn: true, nickname, phone }),
      logout: () => set({ loggedIn: false, nickname: '', phone: null }),
    }),
    {
      name: 'claude-china-user-v1',
      version: 1,
    },
  ),
)
