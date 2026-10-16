import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  ts: number
  tag?: string
}

interface ChatState {
  messages: ChatMessage[]
  typing: boolean
  draft: string
  addMsg: (m: Omit<ChatMessage, 'id' | 'ts'>) => void
  setTyping: (b: boolean) => void
  setDraft: (s: string) => void
  clear: () => void
  updateLastAi: (content: string, tag?: string) => void
  removeLastAi: () => void
}

let seq = 0
const nid = () => `m${Date.now()}_${seq++}`

const greeting: ChatMessage = {
  id: 'm-greeting',
  role: 'ai',
  ts: Date.now(),
  content: `客官您好，我是 **Claude**，初来乍到，还请多多关照～

在这里您可以：
- 让我帮您**写文案、改邮件、出主意**
- 让我帮您**写代码、查资料、讲知识**

小提示：今日免费对话 10 次，用完了可以看广告、摇一摇、邀请好友来补充。祝您聊得开心！`,
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [greeting],
      typing: false,
      draft: '',
      addMsg: (m) => set((s) => ({ messages: [...s.messages, { ...m, id: nid(), ts: Date.now() }] })),
      setTyping: (b) => set({ typing: b }),
      setDraft: (draft) => set({ draft }),
      clear: () => set({ messages: [] }),
      updateLastAi: (content, tag) =>
        set((s) => {
          const idx = [...s.messages].map((m) => m.role).lastIndexOf('ai')
          if (idx < 0) return s
          const messages = [...s.messages]
          messages[idx] = { ...messages[idx], content, tag }
          return { messages }
        }),
      removeLastAi: () =>
        set((s) => {
          const idx = [...s.messages].map((m) => m.role).lastIndexOf('ai')
          if (idx < 0) return s
          return { messages: s.messages.filter((_, i) => i !== idx) }
        }),
    }),
    { name: 'claude-china-chat-v1', version: 1 },
  ),
)
