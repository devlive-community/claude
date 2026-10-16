import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  Crown,
  Gift,
  MessageSquarePlus,
  MessagesSquare,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { cn } from '../../lib/utils'
import { ClaudeMark, CoinIcon } from '../icons'
import AnimatedNumber from '../ui/AnimatedNumber'

const WELFARE = [
  { label: '每日签到', desc: '连签 7 天 50 金币', icon: CalendarCheck, path: '/tasks', cls: 'text-cred bg-cred-soft' },
  { label: '活动广场', desc: '砍一刀 · 摇一摇 · 红包雨', icon: Gift, path: '/activities', cls: 'text-[#C07A2B] bg-[#FBF0DE]', hot: true },
  { label: '金币商城', desc: '金币兑对话次数', icon: ShoppingBag, path: '/shop', cls: 'text-gold-deep bg-gold-soft' },
]

function relTime(ts: number) {
  const d = Date.now() - ts
  if (d < 60_000) return '刚刚'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} 分钟前`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} 小时前`
  return `${Math.floor(d / 86_400_000)} 天前`
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
  const pushToast = useUIStore((s) => s.pushToast)

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  const content = (
    <div className="flex h-full flex-col bg-[#F7EFDF]/95 backdrop-blur-xl lg:bg-[#F7EFDF]/70">
      {/* 品牌区 */}
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <span className="text-brand">
          <ClaudeMark size={26} />
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-[15px] font-bold text-ink">Claude</span>
            <span className="rounded-[4px] bg-gradient-to-br from-[#F04438] to-[#B91C1C] px-1 py-px text-[9px] font-bold text-white">
              中国版
            </span>
          </div>
          <p className="text-[10px] tracking-widest text-faint">AI 也要入乡随俗</p>
        </div>
        <button onClick={onClose} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-faint hover:bg-black/5 lg:hidden" aria-label="收起侧栏">
          <X size={16} />
        </button>
      </div>

      {/* 新对话 */}
      <div className="px-3">
        <button
          onClick={() => {
            newConversation()
            navigate('/')
            onClose()
          }}
          className="flex w-full items-center gap-2 rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-gold hover:bg-white"
        >
          <MessageSquarePlus size={16} className="text-brand" />
          新对话
          <span className="ml-auto text-[10px] font-normal text-faint">⌘K</span>
        </button>
      </div>

      {/* 对话历史 */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 nice-scroll">
        <p className="flex items-center gap-1.5 px-1.5 pb-1.5 text-[11px] font-semibold text-faint">
          <MessagesSquare size={12} /> 对话记录
        </p>
        {conversations.length === 0 && (
          <p className="px-1.5 py-2 text-xs leading-relaxed text-faint/80">还没有对话，发一条消息开始吧～</p>
        )}
        <div className="space-y-0.5">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition',
                c.id === activeId ? 'bg-white/90 shadow-sm' : 'hover:bg-white/60',
              )}
              onClick={() => {
                setActive(c.id)
                navigate('/')
                onClose()
              }}
            >
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate text-[13px]', c.id === activeId ? 'font-semibold text-ink' : 'text-body')}>
                  {c.title}
                </span>
                <span className="block text-[10px] text-faint">{relTime(c.ts)}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(c.id)
                  pushToast({ type: 'info', title: '对话已删除' })
                }}
                className="flex-none rounded-md p-1 text-faint opacity-0 transition hover:bg-cred-soft hover:text-cred group-hover:opacity-100"
                aria-label="删除对话"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 福利中心 */}
      <div className="border-t border-line/70 px-3 py-3">
        <p className="flex items-center gap-1.5 px-1.5 pb-2 text-[11px] font-semibold text-faint">
          <Sparkles size={12} className="text-gold" /> 福利中心
        </p>
        <div className="space-y-1">
          {WELFARE.map((w) => {
            const Icon = w.icon
            return (
              <button
                key={w.label}
                onClick={() => go(w.path)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/80',
                  location.pathname === w.path && 'bg-white/90 shadow-sm',
                )}
              >
                <span className={cn('flex h-8 w-8 flex-none items-center justify-center rounded-lg', w.cls)}>
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">{w.label}</span>
                  <span className="block truncate text-[10px] text-faint">{w.desc}</span>
                </span>
                {w.hot && (
                  <span className="ml-auto flex-none rounded-full bg-gradient-to-br from-[#F04438] to-[#B91C1C] px-1.5 py-px text-[9px] font-bold text-white">
                    热
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 金币与会员 */}
        <button
          onClick={() => go('/shop')}
          className="mt-2.5 flex w-full items-center gap-2 rounded-xl border border-gold/45 bg-gold-soft/70 px-3 py-2 transition hover:border-gold"
        >
          <CoinIcon size={17} />
          <span className="text-[13px] font-bold text-gold-deep tabular-nums">
            <AnimatedNumber value={coins} />
          </span>
          <span className="text-[10px] text-faint">金币余额</span>
          <span className="ml-auto text-[11px] font-semibold text-cred">去兑换 →</span>
        </button>
        <button
          onClick={() => go('/shop')}
          className={cn(
            'mt-1.5 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition',
            isMember() ? 'border border-gold/50 bg-member text-[#E7D6B8]' : 'bg-member text-[#E7D6B8] hover:bg-member-2',
          )}
        >
          <Crown size={15} className="text-gold" />
          <span className="text-[12px] font-bold">{isMember() ? '尊享会员生效中' : '尊享会员 · 限时特惠'}</span>
          {!isMember() && <span className="ml-auto text-[10px] text-[#F5D98B]">¥9.9/月</span>}
        </button>
      </div>

      {/* 底部用户与声明 */}
      <div className="border-t border-line/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-[10px] font-bold text-white">
                {nickname.slice(0, 1)}
              </span>
              <span className="truncate text-[11px] text-body">{nickname}</span>
            </>
          ) : (
            <span className="text-[11px] text-faint">未登录（本地模拟）</span>
          )}
          <button onClick={() => go('/about')} className="ml-auto text-[10px] text-faint underline-offset-2 hover:text-cred hover:underline">
            免责声明
          </button>
        </div>
        <p className="mt-1 text-[9.5px] leading-relaxed text-faint/70">
          非官方娱乐模拟网站，与 Anthropic 无关联；所有奖励均为模拟功能。
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* 桌面固定侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-line/70 lg:block">{content}</aside>
      {/* 移动端抽屉 */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[#2a1a10]/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line shadow-lift"
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
    </>
  )
}
