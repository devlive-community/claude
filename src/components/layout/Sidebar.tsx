import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  Crown,
  Gift,
  LogIn,
  MessageSquarePlus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { cn } from '../../lib/utils'
import { ClaudeMark, CoinIcon } from '../icons'
import Modal from '../ui/Modal'

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

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const newConversation = useChatStore((s) => s.newConversation)
  const setActive = useChatStore((s) => s.setActive)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const coins = useUserStore((s) => s.coins)
  const isMember = useUserStore((s) => s.isMember)
  const loggedIn = useUserStore((s) => s.loggedIn)
  const nickname = useUserStore((s) => s.nickname)
  const logout = useUserStore((s) => s.logout)
  const pushToast = useUIStore((s) => s.pushToast)
  const [loginOpen, setLoginOpen] = useState(false)

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
      {/* 品牌区（与 claude.ai 一致：星芒 + Claude） */}
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <span className="text-ink">
          <ClaudeMark size={24} />
        </span>
        <span className="font-serif text-[17px] font-bold tracking-tight text-ink">Claude</span>
        <button onClick={onClose} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-faint hover:bg-black/5 lg:hidden" aria-label="收起侧栏">
          <X size={16} />
        </button>
      </div>

      {/* 新对话 */}
      <div className="px-3 pt-2">
        <button
          onClick={startNewChat}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-black/5"
        >
          <MessageSquarePlus size={16} className="text-brand" />
          新对话
        </button>
      </div>

      {/* 对话记录（Recents） */}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 nice-scroll">
        <p className="px-2 pb-1 text-[11px] font-medium text-faint">对话</p>
        {conversations.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-faint/70">暂无对话</p>
        )}
        <div className="space-y-0.5">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group flex cursor-pointer items-center rounded-lg px-2 py-[7px] transition',
                c.id === activeId ? 'bg-black/[0.06]' : 'hover:bg-black/[0.04]',
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
                aria-label="删除对话"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* 福利入口（特色玩法） */}
        <p className="mt-5 px-2 pb-1 text-[11px] font-medium text-faint">福利</p>
        <div className="space-y-0.5">
          {[
            { label: '每日签到', icon: CalendarCheck, path: '/tasks' },
            { label: '活动广场', icon: Gift, path: '/activities' },
            { label: '金币商城', icon: ShoppingBag, path: '/shop' },
          ].map((w) => {
            const Icon = w.icon
            return (
              <button
                key={w.label}
                onClick={() => go(w.path)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left transition hover:bg-black/[0.04]',
                  location.pathname === w.path && 'bg-black/[0.06]',
                )}
              >
                <Icon size={15} className={cn(w.label === '每日签到' ? 'text-cred' : w.label === '活动广场' ? 'text-brand' : 'text-gold-deep')} />
                <span className="text-[13px] text-body">{w.label}</span>
              </button>
            )
          })}
          {/* 金币与会员（claude.ai 的方案区位置） */}
          <button
            onClick={() => go('/shop')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left transition hover:bg-black/[0.04]"
          >
            <CoinIcon size={15} />
            <span className="text-[13px] font-semibold text-gold-deep tabular-nums">{coins}</span>
            <span className="text-[12px] text-faint">金币</span>
            <span className="ml-auto text-[11px] text-faint">去兑换 →</span>
          </button>
          <button
            onClick={() => go('/shop')}
            className={cn(
              'mt-1 flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition',
              isMember() ? 'border-gold/40 bg-member text-[#E7D6B8]' : 'border-transparent bg-member text-[#E7D6B8] hover:bg-member-2',
            )}
          >
            <Crown size={15} className="text-gold" />
            <span className="text-[12.5px] font-semibold">{isMember() ? '尊享会员生效中' : '尊享会员'}</span>
            {!isMember() && <span className="ml-auto text-[11px] font-bold text-gold">¥9.9/月</span>}
          </button>
        </div>
      </div>

      {/* 底部账户（claude.ai 结构） */}
      <div className="border-t border-black/[0.06] p-3">
        {loggedIn ? (
          <div className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-black/[0.04]">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-xs font-bold text-white">
              {nickname.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">{nickname}</span>
              <span className="block text-[10.5px] text-faint">免费版 · 模拟</span>
            </span>
            <button
              onClick={() => {
                logout()
                pushToast({ type: 'info', title: '已退出登录（模拟）' })
              }}
              className="text-[11px] text-faint opacity-0 transition hover:text-cred group-hover:opacity-100"
            >
              退出
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-black/[0.04]"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line bg-white text-faint">
              <LogIn size={13} />
            </span>
            <span className="text-[13px] text-body">登录 / 注册</span>
          </button>
        )}
        <button onClick={() => go('/about')} className="mt-1 block px-2 text-left text-[10.5px] leading-relaxed text-faint/80 hover:text-cred">
          非官方娱乐模拟网站 · 与 Anthropic 无关联 · 所有奖励均为模拟功能
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-black/[0.06] lg:block">{content}</aside>
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
    </>
  )
}
