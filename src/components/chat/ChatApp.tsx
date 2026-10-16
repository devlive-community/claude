import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CornerDownLeft,
  Copy,
  Loader2,
  Mic,
  MonitorPlay,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { useChatStore, selectActiveConversation } from '../../store/useChatStore'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { generateReply } from '../../lib/mockAI'
import { renderMarkdown } from '../../lib/markdown'
import { cn } from '../../lib/utils'
import { ClaudeMark } from '../icons'
import QuotaModal from './QuotaModal'
import ForcedAdModal from './ForcedAdModal'
import ShareModal from './ShareModal'

/** 模型阵容（与官方 claude.ai 一致） */
const MODELS = [
  { name: 'Fable 5.1', desc: 'For your toughest challenges', credits: true },
  { name: 'Opus 5.5', desc: 'For complex work and everyday tasks' },
  { name: 'Sonnet 5.5', desc: 'Most efficient for simpler tasks' },
  { name: 'Haiku 5.5', desc: 'Fastest for quick answers' },
]
const MORE_MODELS = [
  { name: 'Fable 5', credits: true },
  { name: 'Opus 5' },
  { name: 'Opus 4.8' },
  { name: 'Opus 4.7' },
  { name: 'Opus 4.6' },
  { name: 'Opus 3' },
  { name: 'Sonnet 5' },
  { name: 'Sonnet 4.6' },
  { name: 'Haiku 4.5' },
]
const EFFORTS = [
  { name: 'Low' },
  { name: 'Medium', tag: 'Recommended' },
  { name: 'High' },
  { name: 'Extra' },
  { name: 'Max', warn: '4× or more usage' },
]
const EFFORT_TIP = 'Effort 越高，回复越彻底，但耗时更长、额度消耗更快。'

function greetingByHour() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，客官'
  if (h < 12) return '早上好，客官'
  if (h < 14) return '中午好，客官'
  if (h < 18) return '下午好，客官'
  return '晚上好，客官'
}

/** 关闭浮层的公共遮罩 */
function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-20" onClick={onClose} />
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

/** Project 下拉（claude.ai 同款：搜索 + 新建；默认无预置项目） */
function ProjectMenu() {
  const [open, setOpen] = useState(false)
  const [kw, setKw] = useState('')
  const pushToast = useUIStore((s) => s.pushToast)
  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (open) setKw('') }}
        className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[12.5px] font-medium text-body transition hover:bg-black/5"
      >
        Project <ChevronDown size={12} className={cn('text-faint transition', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <Overlay onClose={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="card absolute bottom-9 left-0 z-30 w-60 p-1.5"
            >
              <div className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2">
                <Search size={13} className="flex-none text-faint" />
                <input
                  value={kw}
                  onChange={(e) => setKw(e.target.value)}
                  placeholder="搜索或创建项目"
                  className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-faint"
                />
                <SlidersHorizontal size={13} className="flex-none text-faint" />
              </div>
              {kw.trim() ? (
                <button
                  onClick={() => { setOpen(false); setKw(''); pushToast({ type: 'info', title: `创建项目「${kw.trim()}」（模拟功能）` }) }}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-body transition hover:bg-black/[0.04]"
                >
                  <Plus size={14} className="flex-none text-faint" />
                  <span className="truncate">创建项目「{kw.trim()}」</span>
                </button>
              ) : (
                <button
                  onClick={() => { setOpen(false); pushToast({ type: 'info', title: '新建项目（模拟功能）' }) }}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-body transition hover:bg-black/[0.04]"
                >
                  <Plus size={14} className="text-faint" /> 新建项目
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 模型行：Opus 5.5 / Medium / Manual，三个下拉（claude.ai 同款） */
/** 模型行：模型名 + Effort 一体按钮 / Permission mode 按钮（claude.ai 同款）
 * variant：new=新对话完整模型列表 / chat=对话态精简菜单（仅当前模型） */
function ModelLine({ model, onPickModel, variant = 'chat' }: { model: string; onPickModel: (m: string) => void; variant?: 'new' | 'chat' }) {
  const [mainOpen, setMainOpen] = useState(false)
  const [permOpen, setPermOpen] = useState(false)
  const [effort, setEffort] = useState('Medium')
  const [perm, setPerm] = useState<'Manual' | 'Auto'>('Manual')
  const pushToast = useUIStore((s) => s.pushToast)
  const current = MODELS.find((m) => m.name === model)
  const moreList = [...MODELS.filter((m) => m.name !== model), ...MORE_MODELS]

  const pick = (name: string, credits?: boolean) => {
    if (credits) {
      pushToast({ type: 'warn', title: `${name} 需要使用额度`, desc: '模拟提示：仅尊享会员可用' })
      return
    }
    onPickModel(name)
    pushToast({ type: 'info', title: '模型已切换（模拟）', desc: name })
    setMainOpen(false)
  }

  return (
    <div className="flex items-center gap-0.5 text-[12.5px]">
      {/* 模型 + Effort 一体按钮 */}
      <div className="relative">
        <button
          onClick={() => { setMainOpen((v) => !v); setPermOpen(false) }}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition hover:bg-black/5',
            mainOpen && 'bg-black/5',
          )}
        >
          <span className="font-semibold text-body">{model}</span>
          <span className="text-faint">{effort}</span>
        </button>
        <AnimatePresence>
          {mainOpen && (
            <>
              <Overlay onClose={() => setMainOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="card absolute bottom-9 right-0 z-30 w-72 p-1.5"
              >
                {variant === 'new' ? (
                  /* 新对话：完整模型列表（claude.ai 新对话同款） */
                  <>
                    {MODELS.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => pick(m.name, m.credits)}
                        className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-black/[0.04]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-ink">
                            <span className="flex-none">{m.name}</span>
                            {m.credits && (
                              <span className="inline-flex flex-none items-center gap-1 whitespace-nowrap rounded-full border border-line px-1.5 py-px text-[9.5px] font-normal text-faint">
                                <CircleAlert size={9} /> 需要使用额度
                              </span>
                            )}
                          </span>
                          <span className="block text-[11.5px] text-faint">{m.desc}</span>
                        </span>
                        {m.credits ? (
                          <span className="mt-0.5 flex-none rounded-full bg-[#E8F0FE] px-2 py-0.5 text-[10px] font-semibold text-[#1A73E8]">购买额度</span>
                        ) : (
                          m.name === model && <Check size={15} className="mt-0.5 flex-none text-[#2C84DB]" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  /* 对话态：顶部仅当前模型（+ 蓝勾） */
                  <div className="flex items-start gap-2 px-2.5 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-ink">{model}</span>
                      <span className="block text-[11.5px] text-faint">{current?.desc ?? '经典模型'}</span>
                    </span>
                    <Check size={15} className="mt-0.5 flex-none text-[#2C84DB]" strokeWidth={2.5} />
                  </div>
                )}
                <div className="my-1 border-t border-line" />
                {/* Effort 行（hover 展开子菜单） */}
                <div className="group relative">
                  <button className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-ink transition hover:bg-black/[0.04]">
                    Effort
                    <span className="flex items-center gap-1 text-[12px] text-faint">
                      {effort} <ChevronRight size={12} />
                    </span>
                  </button>
                  <div className="card invisible absolute bottom-0 left-full z-40 ml-1 w-60 p-1.5 opacity-0 transition group-hover:visible group-hover:opacity-100">
                    <p className="px-2.5 pb-1.5 pt-1 text-[11px] leading-relaxed text-faint">{EFFORT_TIP}</p>
                    {EFFORTS.map((e) => (
                      <button
                        key={e.name}
                        onClick={() => { setEffort(e.name); setMainOpen(false); pushToast({ type: 'info', title: `Effort 已设为 ${e.name}（模拟）` }) }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-ink transition hover:bg-black/[0.04]"
                      >
                        {e.name}
                        {e.tag && <span className="rounded-full border border-line px-1.5 py-px text-[9.5px] text-faint">{e.tag}</span>}
                        {e.warn && <span className="rounded-full bg-amber-50 px-1.5 py-px text-[9.5px] text-amber-700">⚠ {e.warn}</span>}
                        {e.name === effort && <Check size={13} className="ml-auto text-[#2C84DB]" strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                </div>
                {/* More models 行（hover 展开二级列表） */}
                <div className="group relative">
                  <button className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-ink transition hover:bg-black/[0.04]">
                    更多模型
                    <ChevronRight size={12} className="text-faint" />
                  </button>
                  <div className="card invisible absolute bottom-0 left-full z-40 ml-1 max-h-72 w-72 overflow-y-auto p-1.5 opacity-0 transition group-hover:visible group-hover:opacity-100 nice-scroll">
                    {moreList.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => pick(m.name, m.credits)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-ink transition hover:bg-black/[0.04]"
                      >
                        <span className="flex-none whitespace-nowrap">{m.name}</span>
                        {m.credits && (
                          <>
                            <span className="inline-flex flex-none items-center gap-1 whitespace-nowrap rounded-full border border-line px-1.5 py-px text-[9.5px] text-faint">
                              <CircleAlert size={9} /> 需要使用额度
                            </span>
                            <span className="ml-auto flex-none whitespace-nowrap rounded-full bg-[#E8F0FE] px-2 py-0.5 text-[10px] font-semibold text-[#1A73E8]">购买额度</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="border-t border-line px-2.5 pb-1 pt-2 text-[11px] leading-relaxed text-faint">
                  Fable 5.1 包含在 Max 方案中，Pro 方案可通过使用额度体验。<span className="cursor-pointer underline">了解更多</span>
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Permission mode 按钮（hover 才有背景） */}
      <div className="relative">
        <button
          onClick={() => { setPermOpen((v) => !v); setMainOpen(false) }}
          className={cn(
            'rounded-lg px-2 py-1 text-faint transition hover:bg-black/[0.06] hover:text-body',
            permOpen && 'bg-black/[0.06] text-body',
          )}
        >
          {perm}
        </button>
        <AnimatePresence>
          {permOpen && (
            <>
              <Overlay onClose={() => setPermOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="card absolute bottom-9 right-0 z-30 w-64 p-2"
              >
                <p className="px-1.5 pb-1 text-[12px] text-faint">权限模式</p>
                {(
                  [
                    { name: 'Manual' as const, desc: 'Claude 在使用新工具或打开新网站前会先询问。' },
                    { name: 'Auto' as const, desc: 'Claude 自主运行，遇到不确定的操作会暂停询问。' },
                  ]
                ).map((p) => (
                  <button
                    key={p.name}
                    onClick={() => { setPerm(p.name); setPermOpen(false); pushToast({ type: 'info', title: `权限模式：${p.name}（模拟）` }) }}
                    className="flex w-full items-start gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-black/[0.04]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-ink">{p.name}</span>
                      <span className="block text-[11px] leading-relaxed text-faint">{p.desc}</span>
                    </span>
                    {p.name === perm && <Check size={14} className="mt-1 flex-none text-[#2C84DB]" strokeWidth={2.5} />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MicMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-0.5 rounded-lg px-1 text-body transition hover:bg-black/5"
        aria-label="语音输入"
      >
        <Mic size={15} />
        <ChevronDown size={11} className="text-faint" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <Overlay onClose={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="card absolute bottom-10 right-0 z-30 w-52 p-3"
            >
              <div className="flex items-center gap-2.5">
                <Mic size={15} className="flex-none text-faint" />
                <div className="h-1.5 flex-1 rounded-full bg-black/[0.08]" />
              </div>
              <p className="pt-2.5 text-[13px] text-faint">未找到语音设备</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 对话态顶部细条：左标题 / 右收藏+分享 */
function ChatHeader({ title, chatId }: { title: string; chatId: string }) {
  const pushToast = useUIStore((s) => s.pushToast)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  const [shareOpen, setShareOpen] = useState(false)
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
          onClick={() => setShareOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12.5px] font-medium text-body transition hover:bg-card-deep"
        >
          <Share2 size={12} /> 分享
        </button>
      </div>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} chatId={chatId} />
    </header>
  )
}

export default function ChatApp() {
  const { id: routeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const conversations = useChatStore((s) => s.conversations)
  const activeConv = useChatStore(selectActiveConversation)
  const typing = useChatStore((s) => s.typing)
  const setTyping = useChatStore((s) => s.setTyping)
  const addMsg = useChatStore((s) => s.addMsg)
  const updateLastAi = useChatStore((s) => s.updateLastAi)
  const removeLastAi = useChatStore((s) => s.removeLastAi)
  const renameFromFirstMessage = useChatStore((s) => s.renameFromFirstMessage)

  const consumeChat = useUserStore((s) => s.consumeChat)
  const grantChats = useUserStore((s) => s.grantChats)
  const setTaskDone = useUserStore((s) => s.setTaskDone)
  const pushToast = useUIStore((s) => s.pushToast)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)

  const [draft, setDraft] = useState('')
  const [web] = useState(false)
  const [deep] = useState(false)
  const [model, setModel] = useState('Opus 5.5')
  const [file, setFile] = useState<string | null>(null)
  const [quotaOpen, setQuotaOpen] = useState(false)
  /** 未登录发送：对话流内提示卡片，用户点击后才看 10 秒广告解锁 */
  const [forcedAd, setForcedAd] = useState(false)
  const [pendingNotice, setPendingNotice] = useState(false)
  const pendingRef = useRef<string | null>(null)
  const adUnlockedRef = useRef(false)
  const loggedIn = useUserStore((s) => s.loggedIn)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<number | null>(null)
  const [atBottom, setAtBottom] = useState(true)
  const atBottomRef = useRef(true)

  /** 滚动监听：距底 40px 内视为在底部；上翻时显示回底按钮且不再自动跟随 */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    atBottomRef.current = bottom
    setAtBottom(bottom)
  }, [])

  /** 当前会话：/chat/:id 由 URL 派生；/new 跟随 activeId */
  const conversation = useMemo(
    () => (routeId ? conversations.find((c) => c.id === routeId) ?? null : activeConv),
    [routeId, conversations, activeConv],
  )
  const messages = conversation?.messages ?? []
  const hasMessages = messages.length > 0
  /** 对话视图：已有消息 或 存在待解锁的挂起消息 */
  const inChatView = hasMessages || pendingNotice
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id

  /** 路由同步：/new 保证空会话；/chat/:id 激活对应会话（无效则回 /new） */
  useLayoutEffect(() => {
    const st = useChatStore.getState()
    if (!routeId) {
      const conv = st.conversations.find((c) => c.id === st.activeId)
      if (conv && conv.messages.length > 0) st.newConversation()
    } else if (st.conversations.some((c) => c.id === routeId)) {
      if (st.activeId !== routeId) st.setActive(routeId)
    } else {
      navigate('/new', { replace: true })
    }
  }, [routeId, navigate])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  /** 浏览器标签页标题：新对话 - Claude / 对话名字 - Claude */
  useEffect(() => {
    document.title = hasMessages && conversation ? `${conversation.title} - Claude` : '新对话 - Claude'
  }, [hasMessages, conversation?.id, conversation?.title])

  useEffect(() => {
    const el = scrollRef.current
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, typing])

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
      // 未登录：在对话流中显示解锁提示卡片，用户点击后才看广告
      if (!useUserStore.getState().loggedIn && !adUnlockedRef.current) {
        pendingRef.current = content
        setPendingNotice(true)
        return
      }
      adUnlockedRef.current = false
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
      // 新对话发送首条消息后，URL 切换到 /chat/<id>
      if (!routeId) {
        const nid = useChatStore.getState().activeId
        if (nid) navigate(`/chat/${nid}`, { replace: true })
      }
      const reply = generateReply(content, { web, deep })
      window.setTimeout(() => stream(reply), 600)
    },
    [draft, consumeChat, addMsg, setDraft, setTaskDone, setTyping, web, deep, file, stream, renameFromFirstMessage, routeId, navigate],
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

  /** 登录成功后自动发送挂起的对话（免广告） */
  useEffect(() => {
    if (loggedIn && pendingNotice) {
      setPendingNotice(false)
      const c = pendingRef.current
      pendingRef.current = null
      if (c) send(c)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, pendingNotice])

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
        'ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-full text-white transition',
        typing || !draft.trim() ? 'bg-[#DAD7CE]' : 'bg-ink hover:bg-black',
      )}
      aria-label="发送"
    >
      {typing ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.4} />}
    </motion.button>
  )

  const composerTools = (
    <>
      <input ref={fileRef} type="file" className="hidden" onChange={pickFile} />
      <button
        onClick={() => fileRef.current?.click()}
        className={cn(
          'flex h-8 w-8 flex-none items-center justify-center rounded-lg text-body transition hover:bg-black/5',
          file && 'text-brand',
        )}
        title={file ? `已选：${file}` : '上传文件（模拟）'}
      >
        <Plus size={16} />
      </button>
    </>
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* 对话态顶部细条 */}
      {inChatView && <ChatHeader title={conversation?.title ?? '新对话'} chatId={conversation?.id ?? ''} />}

      {/* 上翻时：输入框上方居中浮动“滚到底部”按钮（claude.ai 同款） */}
      {hasMessages && !atBottom && (
        <button
          onClick={() => {
            const el = scrollRef.current
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
          }}
          className="absolute bottom-[118px] left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lift transition hover:bg-[#F0EEE6] hover:shadow-none"
          aria-label="滚动到最下面"
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* 空态折叠后：主区左上角展开按钮（桌面端） */}
      {!inChatView && collapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="absolute left-3 top-3 z-20 hidden h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-black/5 lg:flex"
          aria-label="展开侧栏"
        >
          <PanelLeft size={17} />
        </button>
      )}

      {/* 空态：问候 + 输入卡 + 卡外行整体屏幕居中（claude.ai 同款） */}
      {!inChatView ? (
        <div className="nice-scroll flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-8">
          <div className="w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-7 flex items-center justify-center gap-3"
            >
              <span className="text-brand">
                <ClaudeMark size={30} />
              </span>
              <h1 className="font-serif text-[30px] font-bold tracking-tight text-ink md:text-[32px]">
                {greetingByHour()}
              </h1>
            </motion.div>

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
              <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
                {composerTools}
                {draft.trim() || typing ? (
                  sendBtn()
                ) : (
                  <div className="flex items-center gap-1">
                    <MicMenu />
                    <button
                      onClick={() => pushToast({ type: 'info', title: '语音模式（模拟功能）' })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
                      title="语音模式"
                      aria-label="语音模式"
                    >
                      <AudioLines size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 输入卡下方外部行：左 Project / 右 模型行（claude.ai 同款） */}
            <div className="mt-2.5 flex items-center justify-between px-1">
              <ProjectMenu />
              <ModelLine model={model} onPickModel={setModel} variant="new" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 消息线程：AI 通栏 markdown，用户右对齐浅灰气泡 */}
          <div ref={scrollRef} onScroll={handleScroll} className="nice-scroll min-h-0 flex-1 overflow-y-auto">
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
            {pendingNotice && (
              <>
                {/* 待解锁的用户消息（半透明待发送态） */}
                <div className="flex justify-end opacity-60">
                  <div className="max-w-[80%] rounded-2xl bg-[#F0EEE6] px-4 py-3 text-[14px] leading-relaxed text-ink">
                    {pendingRef.current}
                  </div>
                </div>
                {/* 解锁提示卡片：用户点击后才播放广告 */}
                <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#EDF3FB] text-[#4C6FA5]">
                      <MonitorPlay size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink">本次对话需要看广告解锁</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-faint">
                        观看一段 10 秒模拟广告即可解锁本次发送；登录后无需看广告。
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button onClick={() => setForcedAd(true)} className="btn btn-red">
                          <MonitorPlay size={14} /> 看广告解锁
                        </button>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
                          className="rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium text-body transition hover:bg-card-deep"
                        >
                          登录后免广告
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="h-2" />
            </div>
          </div>

          {/* 对话态：大圆角输入条 + 官方式 footer 三段行 */}
          <div className="mx-auto w-full max-w-3xl flex-none px-4 pb-3 lg:pb-4">
            <div className="rounded-[20px] border border-line bg-white shadow-soft">
              <div className="flex items-center gap-2 pl-5 pr-2">
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
                  placeholder="Reply"
                  className="max-h-[160px] min-w-0 flex-1 resize-none bg-transparent py-4 text-[14px] text-ink outline-none placeholder:text-faint/70"
                />
                <motion.button
                  onClick={() => send()}
                  disabled={typing || !draft.trim()}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    'flex h-8 w-8 flex-none items-center justify-center rounded-lg transition',
                    typing || !draft.trim() ? 'text-[#B8B5AC]' : 'text-ink hover:bg-black/5',
                  )}
                  aria-label="发送"
                >
                  {typing ? <Loader2 size={15} className="animate-spin" /> : <CornerDownLeft size={16} />}
                </motion.button>
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
              <div className="flex flex-none items-center gap-0.5">
                <input ref={fileRef} type="file" className="hidden" onChange={pickFile} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-faint transition hover:bg-black/5 hover:text-body',
                    file && 'text-brand',
                  )}
                  title={file ? `已选：${file}` : '上传文件（模拟）'}
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => pushToast({ type: 'info', title: '语音输入（模拟）', desc: '未找到语音设备' })}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-faint transition hover:bg-black/5 hover:text-body"
                  title="语音输入"
                >
                  <Mic size={14} />
                </button>
                <button
                  onClick={() => pushToast({ type: 'info', title: '语音模式（模拟功能）' })}
                  className="flex h-7 items-center gap-0.5 rounded-lg px-1 text-faint transition hover:bg-black/5 hover:text-body"
                  title="语音模式"
                >
                  <AudioLines size={14} />
                  <ChevronDown size={10} />
                </button>
              </div>
              <p className="hidden truncate text-[11px] text-faint sm:block">Claude 是 AI，回复仅供娱乐。</p>
              <div className="flex-none">
                <ModelLine model={model} onPickModel={setModel} />
              </div>
            </div>
          </div>
        </>
      )}

      <QuotaModal open={quotaOpen} onClose={() => setQuotaOpen(false)} />
      <ForcedAdModal
        open={forcedAd}
        onComplete={() => {
          grantChats(1)
          adUnlockedRef.current = true
          setForcedAd(false)
          setPendingNotice(false)
          const c = pendingRef.current
          pendingRef.current = null
          if (c) send(c)
        }}
      />
    </div>
  )
}
