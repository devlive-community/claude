import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  ChevronRight,
  Globe,
  Loader2,
  Paperclip,
  RefreshCw,
  Send,
  SquarePen,
  Tv,
  Users,
  Crown,
} from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Modal from '../ui/Modal'
import { useChatStore } from '../../store/useChatStore'
import { useUserStore, FREE_CHATS_PER_DAY } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { useSectionNav } from '../../lib/useSectionNav'
import { generateReply } from '../../lib/mockAI'
import { renderMarkdown } from '../../lib/markdown'
import { cn } from '../../lib/utils'
import { ClaudeMark } from '../icons'

const MODELS = ['Claude 国风特调 v1', 'Claude Sonnet 4.5', 'Claude Opus 4.1']

function QuotaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const go = useSectionNav()
  const openInvite = useUIStore((s) => s.openInvite)
  const options = [
    {
      icon: Tv,
      title: '看广告领取 5 次对话',
      desc: '观看 30 秒模拟广告，每日 5 次',
      cls: 'text-[#4C6FA5] bg-[#EDF3FB]',
      onClick: () => {
        onClose()
        go('ads')
      },
    },
    {
      icon: Users,
      title: '邀请好友领取 20 次对话',
      desc: '模拟好友接受邀请即刻到账',
      cls: 'text-cred bg-cred-soft',
      onClick: () => {
        onClose()
        openInvite('chats')
      },
    },
    {
      icon: Crown,
      title: '开通尊享会员',
      desc: '限时 ¥9.9/月，对话不限量（模拟）',
      cls: 'text-gold-deep bg-gold-soft',
      onClick: () => {
        onClose()
        go('member')
      },
    },
  ]
  return (
    <Modal open={open} onClose={onClose} title="客官，您的智慧余额不足！" sealChar="缺" width="max-w-sm">
      <p className="mb-4 text-sm text-body">
        今天的免费对话已经用完啦。不过莫慌，本站三大回血方式任您选：
      </p>
      <div className="space-y-2.5">
        {options.map((o) => {
          const Icon = o.icon
          return (
            <button
              key={o.title}
              onClick={o.onClick}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-white/70 p-3.5 text-left transition hover:border-gold hover:bg-gold-soft/40"
            >
              <span className={cn('flex h-10 w-10 flex-none items-center justify-center rounded-xl', o.cls)}>
                <Icon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{o.title}</span>
                <span className="block text-xs text-faint">{o.desc}</span>
              </span>
              <ChevronRight size={16} className="ml-auto flex-none text-faint" />
            </button>
          )
        })}
      </div>
      <p className="mt-3.5 text-center text-[11px] text-faint">以上均为模拟功能，不产生任何真实费用</p>
    </Modal>
  )
}

export default function ChatSection() {
  const messages = useChatStore((s) => s.messages)
  const typing = useChatStore((s) => s.typing)
  const setTyping = useChatStore((s) => s.setTyping)
  const draft = useChatStore((s) => s.draft)
  const setDraft = useChatStore((s) => s.setDraft)
  const addMsg = useChatStore((s) => s.addMsg)
  const clear = useChatStore((s) => s.clear)
  const updateLastAi = useChatStore((s) => s.updateLastAi)
  const removeLastAi = useChatStore((s) => s.removeLastAi)

  const remaining = useUserStore((s) => s.chatsRemaining())
  const daily = useUserStore((s) => s.daily)
  const consumeChat = useUserStore((s) => s.consumeChat)
  const setTaskDone = useUserStore((s) => s.setTaskDone)

  const pushToast = useUIStore((s) => s.pushToast)
  const go = useSectionNav()

  const [web, setWeb] = useState(false)
  const [deep, setDeep] = useState(false)
  const [model, setModel] = useState(MODELS[0])
  const [modelOpen, setModelOpen] = useState(false)
  const [file, setFile] = useState<string | null>(null)
  const [quotaOpen, setQuotaOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setTyping(false)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const stream = useCallback(
    (reply: string) => {
      addMsg({ role: 'ai', content: '' })
      let i = 0
      timerRef.current = window.setInterval(() => {
        i = Math.min(reply.length, i + 2 + Math.floor(Math.random() * 3))
        updateLastAi(reply.slice(0, i))
        if (i >= reply.length) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          setTyping(false)
        }
      }, 26)
    },
    [addMsg, updateLastAi, setTyping],
  )

  const send = useCallback(
    (raw?: string) => {
      const content = (raw ?? draft).trim()
      if (!content || useChatStore.getState().typing) return
      if (useUserStore.getState().chatsRemaining() <= 0 || !consumeChat()) {
        setQuotaOpen(true)
        return
      }
      addMsg({ role: 'user', content, tag: file ?? undefined })
      setDraft('')
      setFile(null)
      setTaskDone('chat')
      setTyping(true)
      const reply = generateReply(content, { web, deep })
      window.setTimeout(() => stream(reply), 650)
    },
    [draft, consumeChat, addMsg, setDraft, setTaskDone, setTyping, web, deep, file, stream],
  )

  const regenerate = useCallback(() => {
    if (useChatStore.getState().typing) return
    const msgs = useChatStore.getState().messages
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    removeLastAi()
    setTyping(true)
    const reply = generateReply(lastUser.content, { web: true, deep })
    window.setTimeout(() => stream(reply), 500)
  }, [removeLastAi, setTyping, stream, web, deep])

  const copyMsg = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => pushToast({ type: 'success', title: '回复已复制到剪贴板' }))
      .catch(() => pushToast({ type: 'warn', title: '复制失败，请手动选择复制' }))
  }

  const freeLeft = Math.max(0, FREE_CHATS_PER_DAY - daily.chatUsed)
  const pct = (freeLeft / FREE_CHATS_PER_DAY) * 100
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id

  return (
    <section id="chat" className="card flex flex-col p-5 md:p-6">
      <SectionHeader
        seal="聊"
        title="与 Claude 聊聊"
        sub="多轮对话 · Markdown · 代码块，回复为本地模拟生成"
        right={
          <button
            onClick={() => setClearOpen(true)}
            className="btn btn-ghost btn-sm"
            title="清空聊天记录"
          >
            <SquarePen size={13} /> 清空
          </button>
        }
      />

      {/* 消息区 */}
      <div ref={scrollRef} className="nice-scroll h-[380px] space-y-4 overflow-y-auto pr-1 lg:h-[430px]">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-2.5', m.role === 'user' ? 'flex-row-reverse' : '')}>
            {m.role === 'ai' ? (
              <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-soft text-brand">
                <ClaudeMark size={19} />
              </span>
            ) : (
              <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#D97757] to-[#B0522F] text-xs font-bold text-white">
                我
              </span>
            )}
            <div className={cn('group max-w-[86%] md:max-w-[80%]', m.role === 'user' ? 'items-end text-right' : '')}>
              {m.tag && (
                <span className="mb-1 inline-block rounded-full bg-[#EDF3FB] px-2 py-0.5 text-[10px] text-[#4C6FA5]">
                  已上传：{m.tag}
                </span>
              )}
              <div
                className={cn(
                  'inline-block rounded-2xl px-4 py-3 text-left text-[13.5px] leading-relaxed',
                  m.role === 'user'
                    ? 'rounded-tr-sm bg-gradient-to-br from-[#D97757] to-[#C05A3B] text-white'
                    : 'rounded-tl-sm border border-line bg-white/85 text-body',
                )}
              >
                {m.role === 'ai' ? (
                  m.content ? (
                    renderMarkdown(m.content)
                  ) : (
                    <span className="flex items-center gap-1.5 py-1 text-faint">
                      <Loader2 size={14} className="animate-spin" />
                      Claude 正在奋笔疾书……
                    </span>
                  )
                ) : (
                  m.content
                )}
              </div>
              {m.role === 'ai' && m.content && (
                <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => copyMsg(m.content)}
                    className="rounded-md px-2 py-1 text-[11px] text-faint transition hover:bg-card-deep hover:text-cred"
                  >
                    复制
                  </button>
                  {m.id === lastAiId && (
                    <button
                      onClick={regenerate}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-faint transition hover:bg-card-deep hover:text-cred"
                    >
                      <RefreshCw size={11} /> 重新生成
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div className="mt-4 rounded-2xl border border-line bg-white p-3 shadow-sm">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
          }}
          rows={2}
          placeholder="有什么问题尽管问我吧……"
          className="nice-scroll block max-h-28 w-full resize-none bg-transparent px-1.5 py-1 text-sm text-ink outline-none placeholder:text-faint/70"
        />
        <div className="mt-1.5 flex items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setFile(f.name)
                pushToast({ type: 'info', title: '已选择文件（模拟上传）', desc: f.name })
              }
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className={cn('chip-toggle', file && 'chip-on')}
            title="上传文件（模拟）"
          >
            <Paperclip size={13} /> <span className="hidden sm:inline">{file ?? '上传文件'}</span>
          </button>
          <button onClick={() => setWeb((v) => !v)} className={cn('chip-toggle', web && 'chip-on')}>
            <Globe size={13} /> <span className="hidden sm:inline">联网搜索</span>
          </button>
          <button onClick={() => setDeep((v) => !v)} className={cn('chip-toggle', deep && 'chip-on')}>
            <Brain size={13} /> <span className="hidden sm:inline">深度思考</span>
          </button>
          <div className="relative">
            <button onClick={() => setModelOpen((v) => !v)} className="chip-toggle">
              {model} <ChevronRight size={12} className={cn('transition', modelOpen && 'rotate-90')} />
            </button>
            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="card absolute bottom-10 left-0 z-30 w-56 p-1.5"
                  style={{ background: '#FFFBF2' }}
                >
                  {MODELS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setModel(m)
                        setModelOpen(false)
                        pushToast({ type: 'info', title: '模型已切换（模拟）', desc: m })
                      }}
                      className={cn(
                        'block w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-card-deep',
                        m === model ? 'font-bold text-cred' : 'text-body',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => send()} disabled={typing || !draft.trim()} className="btn btn-red ml-auto px-4">
            <Send size={15} />
            发送
          </button>
        </div>
      </div>

      {/* 额度条 */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-56 flex-1 items-center gap-3">
          <span className="flex-none text-xs text-body">
            今日剩余免费对话 <span className="font-bold text-emerald-700 tabular-nums">{remaining}</span> /{' '}
            {FREE_CHATS_PER_DAY}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EAF3E8]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#6FBF73] to-[#4C9A52]"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
        <button
          onClick={() => (remaining > 0 ? go('ads') : setQuotaOpen(true))}
          className="group flex items-center gap-1 text-xs text-cred transition hover:text-[#A31515]"
        >
          用完了？看广告、邀请好友或开通会员，继续畅聊
          <ChevronRight size={13} className="transition group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 清空确认 */}
      <Modal open={clearOpen} onClose={() => setClearOpen(false)} title="清空聊天记录？" sealChar="清" width="max-w-xs">
        <p className="mb-4 text-sm text-body">清空后无法恢复（其实也只是本地模拟记录）。确定要一刀两断吗？</p>
        <div className="flex gap-2.5">
          <button onClick={() => setClearOpen(false)} className="btn btn-ghost flex-1">
            再想想
          </button>
          <button
            onClick={() => {
              clear()
              setClearOpen(false)
              pushToast({ type: "info", title: "聊天记录已清空" })
            }}
            className="btn btn-red flex-1"
          >
            确认清空
          </button>
        </div>
      </Modal>

      <QuotaModal open={quotaOpen} onClose={() => setQuotaOpen(false)} />
    </section>
  )
}
