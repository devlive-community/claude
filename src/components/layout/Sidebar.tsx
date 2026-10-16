import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Crown,
  Gift,
  LogIn,
  LogOut,
  MessageSquarePlus,
  PanelLeft,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { cn } from '../../lib/utils'
import { CoinIcon } from '../icons'
import Modal from '../ui/Modal'
import QuotaModal from '../chat/QuotaModal'

/** 底部账户弹层（claude.ai 样式） */
function AccountMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const loggedIn = useUserStore((s) => s.loggedIn)
  const nickname = useUserStore((s) => s.nickname)
  const logout = useUserStore((s) => s.logout)
  const coins = useUserStore((s) => s.coins)
  const pushToast = useUIStore((s) => s.pushToast)

  const items = [
    { label: '设置', icon: Settings, onClick: () => pushToast({ type: 'info', title: '设置（模拟功能）' }) },
    { label: '使用额度', icon: Crown, onClick: 'quota' },
    { label: '金币余额', icon: Gift, onClick: () => { navigate('/shop'); onClose() }, extra: `${coins}` },
    { label: '语言 Language', icon: ChevronRight, onClick: () => pushToast({ type: 'info', title: '语言：简体中文（模拟）' }) },
    { label: '获取帮助', icon: ChevronRight, onClick: () => { navigate('/about'); onClose() } },
    { label: '查看所有方案', icon: ChevronRight, onClick: () => { navigate('/shop'); onClose() } },
  ] as const

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-2 right-2 z-50 mb-2 overflow-hidden rounded-xl border border-line bg-white shadow-lift"
          >
            <div className="border-b border-line px-3.5 py-2.5">
              <p className="truncate text-[12.5px] font-semibold text-ink">{loggedIn ? nickname : '未登录'}</p>
              <p className="text-[11px] text-faint">guest@claude-china.demo · 免费版</p>
            </div>
            <div className="p-1.5">
              {items.map((it) => {
                const Icon = it.icon
                return (
                  <button
                    key={it.label}
                    onClick={() => {
                      if (it.onClick === 'quota') {
                        window.dispatchEvent(new CustomEvent('open-quota-modal'))
                      } else if (typeof it.onClick === 'function') {
                        it.onClick()
                      }
                      onClose()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] text-body transition hover:bg-black/[0.04]"
                  >
                    <Icon size={14} className="text-faint" />
                    <span className="flex-1">{it.label}</span>
                    {'extra' in it && it.extra && <span className="text-[11px] font-semibold text-gold-deep tabular-nums">{it.extra}</span>}
                  </button>
                )
              })}
              {loggedIn ? (
                <button
                  onClick={() => {
                    logout()
                    pushToast({ type: 'info', title: '已退出登录（模拟）' })
                    onClose()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] text-body transition hover:bg-black/[0.04]"
                >
                  <LogOut size={14} className="text-faint" /> 退出登录
                </button>
              ) : (
                <button
                  onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('open-login-modal')) }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] text-body transition hover:bg-black/[0.04]"
                >
                  <LogIn size={14} className="text-faint" /> 登录 / 注册
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const login = useUserStore((s) => s.login)
  const pushToast = useUIStore((s) => s.pushToast)
  const [phone, setPhone] = useState('')
  const submit = () => {
    if (!/^1\d{10}$/.test(phone)) {
      pushToast({ type: 'warn', title: '请输入正确的手机号' })
      return
    }
    const nick = `客官${phone.slice(-4)}`
    login(nick)
    pushToast({ type: 'success', title: `欢迎回来，${nick}！`, desc: '登录状态仅为本地模拟' })
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="登录" width="max-w-xs">
      <div className="space-y-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="手机号（模拟登录，不收集信息）"
          inputMode="numeric"
          className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-faint/60 focus:border-brand"
        />
        <button onClick={submit} className="btn btn-red w-full">
          <LogIn size={14} /> 登录 / 注册
        </button>
        <p className="text-center text-[11px] text-faint">本站为娱乐模拟网站，登录不收集任何真实信息</p>
      </div>
    </Modal>
  )
}

export default function Sidebar({
  open,
  collapsed,
  onClose,
  onCollapse,
}: {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onCollapse: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const newConversation = useChatStore((s) => s.newConversation)
  const setActive = useChatStore((s) => s.setActive)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const isMember = useUserStore((s) => s.isMember)
  const loggedIn = useUserStore((s) => s.loggedIn)
  const nickname = useUserStore((s) => s.nickname)
  const [search, setSearch] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    if (!kw) return conversations
    return conversations.filter((c) => c.title.toLowerCase().includes(kw))
  }, [conversations, search])

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  const startNewChat = () => {
    newConversation()
    navigate('/')
    onClose()
  }

  const content = (
    <div className="flex h-full flex-col bg-[#F0EEE6]">
      {/* 顶行：折叠 + Logo + 搜索/新建图标 */}
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-3">
        <button
          onClick={() => (window.matchMedia('(min-width: 1024px)').matches ? onCollapse() : onClose())}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
          aria-label="收起侧栏"
        >
          <PanelLeft size={16} />
        </button>
        <span className="font-serif text-[17px] font-bold tracking-tight text-ink">Claude</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={() => document.getElementById('sidebar-search')?.focus()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
            aria-label="搜索对话"
          >
            <Search size={15} />
          </button>
          <button
            onClick={startNewChat}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
            aria-label="新对话"
          >
            <MessageSquarePlus size={16} />
          </button>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5 lg:hidden" aria-label="关闭">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="px-3 pt-2">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-2.5">
          <Search size={13} className="flex-none text-faint" />
          <input
            id="sidebar-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
          />
        </div>
      </div>

      {/* 导航（福利玩法） */}
      <div className="mt-3 space-y-0.5 px-3">
        {[
          { label: '每日签到', icon: CalendarCheck, path: '/tasks' },
          { label: '活动广场', icon: Gift, path: '/activities', badge: 'New' },
          { label: '金币商城', icon: ShoppingBag, path: '/shop' },
        ].map((w) => {
          const Icon = w.icon
          return (
            <button
              key={w.label}
              onClick={() => go(w.path)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2 py-[6px] text-left text-[13px] transition hover:bg-black/[0.05]',
                location.pathname === w.path ? 'bg-black/[0.07] font-medium text-ink' : 'text-body',
              )}
            >
              <Icon size={15} className="text-faint" />
              {w.label}
              {w.badge && (
                <span className="ml-1 rounded-md bg-black/[0.06] px-1.5 py-px text-[9px] font-semibold text-faint">{w.badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Recents */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 nice-scroll">
        <div className="flex items-center justify-between px-2 pb-1">
          <p className="text-[11px] font-medium text-faint">最近</p>
          <CoinIcon size={13} className="opacity-50" />
        </div>
        <div className="space-y-px">
          {filtered.length === 0 && <p className="px-2 py-1.5 text-xs text-faint/70">暂无对话</p>}
          {filtered.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group flex cursor-pointer items-center rounded-lg px-2 py-[6px] transition',
                c.id === activeId ? 'bg-black/[0.07]' : 'hover:bg-black/[0.04]',
              )}
              onClick={() => {
                setActive(c.id)
                navigate('/')
                onClose()
              }}
            >
              <span className={cn('min-w-0 flex-1 truncate text-[13px]', c.id === activeId ? 'font-medium text-ink' : 'text-body')}>
                {c.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(c.id)
                }}
                className="ml-1 flex-none rounded-md p-1 text-faint opacity-0 transition hover:bg-cred-soft hover:text-cred group-hover:opacity-100"
                aria-label="删除"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* 底部账户 */}
      <div className="relative border-t border-black/[0.06] p-2.5">
        <AccountMenu open={accountOpen} onClose={() => setAccountOpen(false)} />
        <button
          onClick={() => (loggedIn ? setAccountOpen((v) => !v) : setLoginOpen(true))}
          className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-black/[0.04]"
        >
          <span
            className={cn(
              'flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold',
              loggedIn ? 'bg-gradient-to-br from-brand to-brand-deep text-white' : 'bg-white text-faint ring-1 ring-line',
            )}
          >
            {loggedIn ? nickname.slice(0, 1) : <LogIn size={12} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium text-ink">{loggedIn ? nickname : '登录 / 注册'}</span>
            <span className="flex items-center gap-1 text-[10.5px] text-faint">
              {isMember() ? '尊享会员' : '免费版'} <ChevronDown size={9} />
            </span>
          </span>
          <CoinIcon size={14} className="flex-none opacity-70" />
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[248px] border-r border-black/[0.05]',
          collapsed ? 'hidden' : 'hidden lg:block',
        )}
      >
        {content}
      </aside>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-black/10 shadow-lift"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              {content}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <QuotaModalHost />
      <LoginModalHost />
    </>
  )
}

/** 全局额度弹窗宿主（由自定义事件触发） */
function QuotaModalHost() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-quota-modal', handler)
    return () => window.removeEventListener('open-quota-modal', handler)
  }, [])
  return <QuotaModal open={open} onClose={() => setOpen(false)} />
}

/** 全局登录弹窗宿主（由自定义事件触发） */
function LoginModalHost() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-login-modal', handler)
    return () => window.removeEventListener('open-login-modal', handler)
  }, [])
  return <LoginModal open={open} onClose={() => setOpen(false)} />
}
