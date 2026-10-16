import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  ts: number
  tag?: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  ts: number
}

interface ChatState {
  conversations: Conversation[]
  activeId: string | null
  typing: boolean
  newConversation: () => void
  setActive: (id: string | null) => void
  deleteConversation: (id: string) => void
  renameFromFirstMessage: (content: string) => void
  addMsg: (m: Omit<ChatMessage, 'id' | 'ts'>) => void
  setTyping: (b: boolean) => void
  updateLastAi: (content: string, tag?: string) => void
  removeLastAi: () => void
}

let seq = 0
/** 会话 id 使用 UUID（与官方 claude.ai 一致） */
const uuid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-4${Math.random().toString(16).slice(2, 13)}-4${Math.random().toString(16).slice(2, 9)}-${((parseInt(Date.now().toString(16).slice(-4), 16) & 0x3fff) | 0x8000).toString(16)}-${Math.random().toString(16).slice(2, 14)}`
const nid = () => `m${Date.now()}_${seq++}`
const cid = () => uuid()

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      typing: false,

      newConversation: () => set({ activeId: null }),

      setActive: (activeId) => set({ activeId }),

      deleteConversation: (id) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id)
          return { conversations, activeId: s.activeId === id ? null : s.activeId }
        }),

      renameFromFirstMessage: (content) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === s.activeId && c.messages.length <= 1
              ? { ...c, title: content.slice(0, 20) || '新的对话' }
              : c,
          ),
        })),

      addMsg: (m) =>
        set((s) => {
          let conversations = s.conversations
          let activeId = s.activeId
          if (!activeId || !conversations.some((c) => c.id === activeId)) {
            activeId = cid()
            conversations = [{ id: activeId, title: '新的对话', messages: [], ts: Date.now() }, ...conversations]
          }
          conversations = conversations.map((c) =>
            c.id === activeId ? { ...c, messages: [...c.messages, { ...m, id: nid(), ts: Date.now() }], ts: Date.now() } : c,
          )
          return { conversations, activeId }
        }),

      setTyping: (typing) => set({ typing }),

      updateLastAi: (content, tag) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== s.activeId) return c
            const idx = [...c.messages].map((m) => m.role).lastIndexOf('ai')
            if (idx < 0) return c
            const messages = [...c.messages]
            messages[idx] = { ...messages[idx], content, tag }
            return { ...c, messages }
          }),
        })),

      removeLastAi: () =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== s.activeId) return c
            const idx = [...c.messages].map((m) => m.role).lastIndexOf('ai')
            if (idx < 0) return c
            return { ...c, messages: c.messages.filter((_, i) => i !== idx) }
          }),
        })),
    }),
    {
      name: 'claude-china-chat-v2',
      version: 2,
      migrate: (persisted: unknown) => {
        // v1：单 messages 数组 → 迁移为一个会话
        const old = persisted as { messages?: ChatMessage[] } | undefined
        if (old?.messages?.length) {
          const first = old.messages.find((m) => m.role === 'user')
          return {
            conversations: [
              {
                id: cid(),
                title: first ? first.content.slice(0, 20) : '历史对话',
                messages: old.messages,
                ts: Date.now(),
              },
            ],
            activeId: null,
          }
        }
        return { conversations: [], activeId: null }
      },
    },
  ),
)

/** 当前激活会话的选择器 */
export const selectActiveConversation = (s: ChatState) =>
  s.conversations.find((c) => c.id === s.activeId) ?? null
