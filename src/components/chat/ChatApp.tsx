import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Brain, Globe, Loader2, Paperclip, RefreshCw, ChevronDown, Copy, Check } from 'lucide-react'
import { useChatStore, selectActiveConversation } from '../../store/useChatStore'
import { useUserStore, FREE_CHATS_PER_DAY } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { generateReply } from '../../lib/mockAI'
import { renderMarkdown } from '../../lib/markdown'
import { cn } from '../../lib/utils'
import { ClaudeMark } from '../icons'
import QuotaModal from './QuotaModal'

const MODELS = ['Claude Sonnet 4.5', 'Claude Opus 4.1', 'Claude Haiku 4.5']

const SUGGESTIONS = [
  '帮我写一份周报，重点是砍一刀活动上线',
  '用 Python 写一个快速排序，带注释',
  '写一首关于「连续签到七天」的诗',
  '推荐一份成都三日游美食攻略',
]

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

  const [web, setWeb] = useState(false)
  const [deep, setDeep] = useState(false)
  const [model, setModel] = useState(MODELS[0])
  const [modelOpen, setModelOpen] = useState(false)
  const [file, setFile] = useState<string | null>(null)
  const [quotaOpen, setQuotaOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<number | null>(null)

  const messages = conversation?.messages ?? []

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

  /** 输入框自适应高度 */
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
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

  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id
  const hasMessages = messages.length > 0
  const pct = (Math.max(0, Math.min(FREE_CHATS_PER_DAY, remaining)) / FREE_CHATS_PER_DAY) * 100

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 滚动区：空状态 / 消息列表 */}
      <div ref={scrollRef} className="nice-scroll flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 py-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-soft"
            >
              <span className="text-brand">
                <ClaudeMark size={32} />
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-5 font-serif text-[26px] font-bold text-ink md:text-3xl"
            >
              {greetingByHour()}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="mt-2 text-sm text-faint"
            >
              今天想聊点什么？每日免费对话还剩 {remaining} 次～
            </motion.p>

            {/* 快捷建议（Claude 官网风格 pills） */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-7 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setDraft(s)
                    taRef.current?.focus()
                  }}
                  className="rounded-full border border-line bg-transparent px-4 py-2 text-[13px] text-body transition hover:border-brand/50 hover:bg-white"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%]">
                    {m.tag && (
                      <span className="mb-1 block text-right text-[10px] text-[#4C6FA5]">已上传：{m.tag}</span>
                    )}
                    <div className="rounded-2xl rounded-tr-md bg-[#F0E4CE]/80 px-4 py-3 text-[14px] leading-relaxed text-ink">
                      {m.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="group flex gap-3">
                  <span className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <span className="text-brand">
                      <ClaudeMark size={17} />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
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
                </div>
              ),
            )}
            <div className="h-2" />
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="mx-auto w-full max-w-3xl flex-none px-4 pb-20 lg:pb-5">
        <div className="rounded-2xl border border-line bg-white/90 shadow-soft backdrop-blur">
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
            placeholder={hasMessages ? '继续追问……' : '有什么问题尽管问我吧……'}
            className="block max-h-[200px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[14px] text-ink outline-none placeholder:text-faint/70"
          />
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
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
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5',
                file && 'text-brand',
              )}
              title={file ? `已选：${file}` : '上传文件（模拟）'}
            >
              <Paperclip size={15} />
            </button>
            <button
              onClick={() => setWeb((v) => !v)}
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-black/5', web ? 'bg-brand-soft text-brand-deep' : 'text-body')}
              title="联网搜索（模拟）"
            >
              <Globe size={15} />
            </button>
            <button
              onClick={() => setDeep((v) => !v)}
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-black/5', deep ? 'bg-brand-soft text-brand-deep' : 'text-body')}
              title="深度思考（模拟）"
            >
              <Brain size={15} />
            </button>

            {/* 模型选择（claude.ai 位置：发送键左侧） */}
            <div className="relative ml-auto">
              <button
                onClick={() => setModelOpen((v) => !v)}
                className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12.5px] font-medium text-body transition hover:bg-black/5"
              >
                {model} <ChevronDown size={12} className={cn('text-faint transition', modelOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {modelOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="card absolute bottom-9 left-0 z-30 w-52 p-1.5"
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

            {/* 发送按钮（Claude 官网式圆形） */}
            <motion.button
              onClick={() => send()}
              disabled={typing || !draft.trim()}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'ml-auto flex h-9 w-9 items-center justify-center rounded-full text-white transition',
                typing || !draft.trim() ? 'bg-[#DAD7CE]' : 'bg-ink hover:bg-black',
              )}
              aria-label="发送"
            >
              {typing ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={17} strokeWidth={2.4} />}
            </motion.button>
          </div>
        </div>

        {/* 额度提示 */}
        <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] text-faint">
          <div className="h-1 w-14 overflow-hidden rounded-full bg-black/[0.07]">
            <motion.div
              className={cn('h-full rounded-full', remaining > 2 ? 'bg-[#6FBF73]' : 'bg-gradient-to-r from-[#F04438] to-[#B91C1C]')}
              animate={{ width: `${pct}%` }}
            />
          </div>
          <span>
            今日免费对话 <span className={cn('font-bold tabular-nums', remaining > 0 ? 'text-emerald-700' : 'text-cred')}>{remaining}</span>/{FREE_CHATS_PER_DAY}
          </span>
          <button onClick={() => setQuotaOpen(true)} className="font-semibold text-cred underline-offset-2 hover:underline">
            {remaining > 0 ? '看广告 / 邀请好友可加次数' : '额度用完，点此回血 →'}
          </button>
          <span className="hidden md:inline">回复为本地模拟生成</span>
        </div>
      </div>

      <QuotaModal open={quotaOpen} onClose={() => setQuotaOpen(false)} />
    </div>
  )
}
