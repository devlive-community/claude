import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  Brain,
  Globe,
  Loader2,
  Paperclip,
  Plus,
  RefreshCw,
  ChevronDown,
  Copy,
  Check,
  Star,
  Share2,
  PanelLeft,
} from 'lucide-react'
import { useChatStore, selectActiveConversation } from '../../store/useChatStore'
import { useUserStore, FREE_CHATS_PER_DAY } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { generateReply } from '../../lib/mockAI'
import { renderMarkdown } from '../../lib/markdown'
import { cn } from '../../lib/utils'
import { ClaudeMark, CoinIcon } from '../icons'
import QuotaModal from './QuotaModal'

const MODELS = ['Claude Sonnet 4.5', 'Claude Opus 4.1', 'Claude Haiku 4.5']
const shortModel = (m: string) => m.replace('Claude ', '')

function greetingByHour() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，客官'
  if (h < 12) return '早上好，客官'
  if (h < 14) return '中午好，客官'
  if (h < 18) return '下午好，客官'
  return '晚上好，客官'
}

/** 消息操作：复制 / 重新生成 */
function MessageActions({ content, onRegenerate, isLast }: { content: string; onRegenerate: () => void; isLast: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button onClick={copy} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-faint transition hover:bg-black/5 hover:text-cred">
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? '已复制' : '复制'}
      </button>
      {isLast && (
        <button onClick={onRegenerate} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-faint transition hover:bg-black/5 hover:text-cred">
          <RefreshCw size={11} /> 重新生成
        </button>
      )}
    </div>
  )
}

/** 模型选择器：文本按钮 + 上弹菜单（claude.ai 同款 "Sonnet 4.5 | Medium" 样式） */
function ModelPicker({ model, onPick }: { model: string; onPick: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[12px] font-medium text-faint transition hover:bg-black/5 hover:text-body"
      >
        {shortModel(model)} <span className="text-faint/50">|</span> Medium
        <ChevronDown size={11} className={cn('transition', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="card absolute bottom-8 right-0 z-30 w-56 p-1.5"
            >
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onPick(m)
                    setOpen(false)
                  }}
                  className={cn(
                    'block w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-card-deep',
                    m === model ? 'font-bold text-ink' : 'text-body',
                  )}
                >
                  {m}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 对话态顶部细条：左标题 / 右收藏+分享 */
function ChatHeader({ title }: { title: string }) {
  const pushToast = useUIStore((s) => s.pushToast)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  return (
    <header className="flex h-12 flex-none items-center justify-between border-b border-black/[0.04] bg-paper/90 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-1">
        {collapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden h-9 w-9 flex-none items-center justify-center rounded-lg text-body transition hover:bg-black/5 lg:flex"
            aria-label="展开侧栏"
          >
            <PanelLeft size={17} />
          </button>
        )}
        <button
        onClick={() => pushToast({ type: 'info', title: '会话设置（模拟功能）' })}
        className="flex min-w-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium text-ink transition hover:bg-black/[0.05]"
      >
        <span className="max-w-[55vw] truncate">{title}</span>
        <ChevronDown size={13} className="flex-none text-faint" />
      </button>
      </div>
      <div className="flex flex-none items-center gap-1">
        <button
          onClick={() => pushToast({ type: 'success', title: '已收藏该对话（模拟）' })}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
          aria-label="收藏"
        >
          <Star size={15} />
        </button>
        <button
          onClick={() => pushToast({ type: 'success', title: '分享链接已复制（模拟）' })}
          className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12.5px] font-medium text-body transition hover:bg-card-deep"
        >
          <Share2 size={12} /> 分享
        </button>
      </div>
    </header>
  )
}

export default function ChatApp() {
  const conversation = useChatStore(selectActiveConversation)
  const typing = useChatStore((s) => s.typing)
  const setTyping = useChatStore((s) => s.setTyping)
  const draft = useChatStore((s) => s.draft)
  const setDraft = useChatStore((s) => s.setDraft)
  const addMsg = useChatStore((s) => s.addMsg)
  const updateLastAi = useChatStore((s) => s.updateLastAi)
  const removeLastAi = useChatStore((s) => s.removeLastAi)
  const renameFromFirstMessage = useChatStore((s) => s.renameFromFirstMessage)

  const remaining = useUserStore((s) => s.chatsRemaining())
  const consumeChat = useUserStore((s) => s.consumeChat)
  const setTaskDone = useUserStore((s) => s.setTaskDone)
  const pushToast = useUIStore((s) => s.pushToast)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)

  const [web, setWeb] = useState(false)
  const [deep, setDeep] = useState(false)
  const [model, setModel] = useState(MODELS[0])
  const [file, setFile] = useState<string | null>(null)
  const [quotaOpen, setQuotaOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<number | null>(null)

  const messages = conversation?.messages ?? []
  const hasMessages = messages.length > 0
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id



  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    setTyping(false)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 浏览器标签页标题：新对话 - Claude / 对话名字 - Claude */
  useEffect(() => {
    document.title = hasMessages ? `${conversation?.title ?? '新对话'} - Claude` : '新对话 - Claude'
  }, [hasMessages, conversation?.title])

  /** 输入框自适应高度 */
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [draft])

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
      renameFromFirstMessage(content)
      setDraft('')
      setFile(null)
      setTaskDone('chat')
      setTyping(true)
      const reply = generateReply(content, { web, deep })
      window.setTimeout(() => stream(reply), 600)
    },
    [draft, consumeChat, addMsg, setDraft, setTaskDone, setTyping, web, deep, file, stream, renameFromFirstMessage],
  )

  const regenerate = useCallback(() => {
    if (useChatStore.getState().typing) return
    const msgs = useChatStore.getState().conversations.find((c) => c.id === useChatStore.getState().activeId)?.messages ?? []
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    removeLastAi()
    setTyping(true)
    const reply = generateReply(lastUser.content, { web: true, deep })
    window.setTimeout(() => stream(reply), 500)
  }, [removeLastAi, setTyping, stream])

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f.name)
      pushToast({ type: 'info', title: '已选择文件（模拟上传）', desc: f.name })
    }
    e.target.value = ''
  }

  const sendBtn = () => (
    <motion.button
      onClick={() => send()}
      disabled={typing || !draft.trim()}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'ml-auto flex flex-none items-center justify-center rounded-full text-white transition',
        typing || !draft.trim() ? 'bg-[#DAD7CE]' : 'bg-ink hover:bg-black',
      )}
      style={{ height: 30, width: 30 }}
      aria-label="发送"
    >
      {typing ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.4} />}
    </motion.button>
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 对话态顶部细条 */}
      {hasMessages && <ChatHeader title={conversation?.title ?? '新对话'} />}

      {/* 空态折叠后：主区左上角展开按钮（桌面端） */}
      {!hasMessages && collapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="absolute left-3 top-3 z-20 hidden h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-black/5 lg:flex"
          aria-label="展开侧栏"
        >
          <PanelLeft size={17} />
        </button>
      )}

      {/* 滚动区：空状态 / 消息列表 */}
      <div ref={scrollRef} className="nice-scroll min-h-0 flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* 空态：居中星芒 + 衬线问候（claude.ai 同款，无建议 chips） */
          <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 pb-28 pt-10">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="text-brand"
            >
              <ClaudeMark size={44} />
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-6 font-serif text-[30px] font-bold tracking-tight text-ink md:text-[34px]"
            >
              {greetingByHour()}
            </motion.h1>
          </div>
        ) : (
          /* 消息线程：AI 通栏 markdown，用户右对齐浅灰气泡 */
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%]">
                    {m.tag && (
                      <span className="mb-1 block text-right text-[10px] text-[#4C6FA5]">已上传：{m.tag}</span>
                    )}
                    <div className="rounded-2xl bg-[#F0EEE6] px-4 py-3 text-[14px] leading-relaxed text-ink">{m.content}</div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="group min-w-0">
                  {m.tag && <span className="mb-1 block text-[10px] text-[#4C6FA5]">已上传：{m.tag}</span>}
                  <div className="text-[14px] leading-relaxed text-body">
                    {m.content ? (
                      renderMarkdown(m.content)
                    ) : (
                      <span className="flex items-center gap-2 text-faint">
                        <Loader2 size={14} className="animate-spin" />
                        思考中……
                      </span>
                    )}
                  </div>
                  {m.content && (
                    <MessageActions content={m.content} onRegenerate={regenerate} isLast={m.id === lastAiId} />
                  )}
                </div>
              ),
            )}
            <div className="h-2" />
          </div>
        )}
      </div>

      {/* 输入区：空态=悬浮大卡 / 对话态=底部胶囊条 */}
      {!hasMessages ? (
        <div className="mx-auto w-full max-w-3xl flex-none px-4 pb-16">
          <div className="rounded-2xl border border-line bg-white shadow-lift">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={1}
              placeholder="今天有什么可以帮您？"
              className="block max-h-[160px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[14.5px] text-ink outline-none placeholder:text-faint/70"
            />
            <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
              <input ref={fileRef} type="file" className="hidden" onChange={pickFile} />
              <button
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5',
                  file && 'text-brand',
                )}
                title={file ? `已选：${file}` : '上传文件（模拟）'}
              >
                <Paperclip size={15} />
              </button>
              {sendBtn()}
            </div>
          </div>

          {/* 输入卡下方外部行：左 额度 chip / 右 模型选择 */}
          <div className="mt-2.5 flex items-center justify-between px-1">
            <button
              onClick={() => setQuotaOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11.5px] text-body transition hover:bg-white"
            >
              <CoinIcon size={12} />
              今日额度{' '}
              <span className={cn('font-bold tabular-nums', remaining > 2 ? 'text-emerald-700' : 'text-cred')}>
                {remaining}
              </span>
              /{FREE_CHATS_PER_DAY}
            </button>
            <ModelPicker model={model} onPick={(m) => { setModel(m); pushToast({ type: 'info', title: '模型已切换（模拟）', desc: m }) }} />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl flex-none px-4 pb-3 lg:pb-4">
          <div className="rounded-3xl border border-line bg-white shadow-soft">
            <div className="flex items-end gap-2 px-3 py-2.5">
              <input ref={fileRef} type="file" className="hidden" onChange={pickFile} />
              <button
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'flex h-8 w-8 flex-none items-center justify-center rounded-full text-body transition hover:bg-black/5',
                  file && 'text-brand',
                )}
                title={file ? `已选：${file}` : '上传文件（模拟）'}
              >
                <Plus size={16} />
              </button>
              <textarea
                ref={taRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="继续追问…"
                className="max-h-[160px] min-w-0 flex-1 resize-none self-center bg-transparent py-1.5 text-[14px] text-ink outline-none placeholder:text-faint/70"
              />
              {sendBtn()}
            </div>
          </div>

          {/* 胶囊条下 footer 三段行 */}
          <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
            <div className="flex flex-none items-center gap-0.5">
              <button
                onClick={() => setWeb((v) => !v)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/5',
                  web ? 'bg-brand-soft text-brand-deep' : 'text-faint',
                )}
                title="联网搜索（模拟）"
              >
                <Globe size={13} />
              </button>
              <button
                onClick={() => setDeep((v) => !v)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/5',
                  deep ? 'bg-brand-soft text-brand-deep' : 'text-faint',
                )}
                title="深度思考（模拟）"
              >
                <Brain size={13} />
              </button>
            </div>
            <p className="hidden truncate text-[11px] text-faint sm:block">Claude 是 AI，回复仅供娱乐。</p>
            <div className="flex-none">
              <ModelPicker model={model} onPick={(m) => { setModel(m); pushToast({ type: 'info', title: '模型已切换（模拟）', desc: m }) }} />
            </div>
          </div>
        </div>
      )}

      <QuotaModal open={quotaOpen} onClose={() => setQuotaOpen(false)} />
    </div>
  )
}
