import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  Clock,
  Code2,
  CreditCard,
  Crown,
  Gauge,
  Globe,
  Palette,
  Plug,
  Puzzle,
  Settings2,
  Search,
  ShieldCheck,
  Sparkles,
  Tv,
  User,
  UserPlus,
  Wand2,
  X,
  Zap,
} from 'lucide-react'
import { AdModal, ADS } from '../sections/AdsSection'
import { useUIStore } from '../../store/useUIStore'
import { useNavigate } from 'react-router-dom'
import { useUserStore, SESSION_LIMIT, WEEKLY_LIMIT, SESSION_LIMIT_MEMBER, WEEKLY_LIMIT_MEMBER } from '../../store/useUserStore'
import { cn } from '../../lib/utils'

function fmtClock(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
function fmtWeek(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 左侧设置菜单（claude.ai 原型同款分组；仅“使用额度”有真实内容，其余为模拟入口） */
const MENU: { group: string; items: { label: string; icon: typeof Gauge }[] }[] = [
  {
    group: '设置',
    items: [
      { label: '通用', icon: Settings2 },
      { label: '账户', icon: User },
      { label: '隐私', icon: ShieldCheck },
      { label: '账单', icon: CreditCard },
      { label: '使用额度', icon: Gauge },
    ],
  },
  {
    group: '能力',
    items: [
      { label: '能力', icon: Zap },
      { label: '记忆', icon: Brain },
      { label: '设计系统', icon: Palette },
      { label: '反思', icon: Sparkles },
      { label: '时间与专注', icon: Clock },
      { label: 'Claude Code', icon: Code2 },
      { label: '浏览器', icon: Globe },
    ],
  },
  {
    group: '自定义',
    items: [
      { label: '技能', icon: Wand2 },
      { label: '连接器', icon: Puzzle },
      { label: '插件', icon: Plug },
    ],
  },
]

/** 使用额度弹窗：左设置菜单 + 右内容区（claude.ai 原型同款）+ 特色回血三件套 */
export default function QuotaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const openInvite = useUIStore((s) => s.openInvite)
  const pushToast = useUIStore((s) => s.pushToast)
  const [ad, setAd] = useState<(typeof ADS)[number] | null>(null)
  const [kw, setKw] = useState('')

  const session = useUserStore((s) => s.session)
  const week = useUserStore((s) => s.week)
  const bonusChats = useUserStore((s) => s.bonusChats)
  const isMember = useUserStore((s) => s.isMember)()

  const now = Date.now()
  const su = now >= session.resetAt ? 0 : session.used
  const wu = now >= week.resetAt ? 0 : week.used
  const sl = isMember ? SESSION_LIMIT_MEMBER : SESSION_LIMIT
  const wl = isMember ? WEEKLY_LIMIT_MEMBER : WEEKLY_LIMIT
  const sessionPct = Math.min(100, Math.round((su / sl) * 100))
  const weekPct = Math.min(100, Math.round((wu / wl) * 100))
  const baseLeft = Math.max(0, Math.min(sl - su, wl - wu))
  const exhausted = baseLeft <= 0

  const perks = [
    {
      icon: Tv,
      title: '看广告领取 5 次对话',
      desc: '观看 30 秒模拟广告，每日 5 次',
      cls: 'text-[#4C6FA5] bg-[#EDF3FB]',
      onClick: () => setAd(ADS[Math.floor(Math.random() * ADS.length)]),
    },
    {
      icon: UserPlus,
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
      title: isMember ? '尊享会员生效中' : '开通尊享会员',
      desc: isMember ? '享受更大的会员额度窗口' : '限时 ¥9.9/月，额度窗口提升 5 倍（模拟）',
      cls: 'text-gold-deep bg-gold-soft',
      onClick: () => {
        onClose()
        navigate('/shop')
      },
    },
  ]

  return (
    <>
      {createPortal(
        <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#2a1a10]/50 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div
            className="relative flex h-[calc(100vh-44px)] w-[calc(100vw-40px)] overflow-hidden rounded-2xl bg-white shadow-lift lg:w-[calc(100vw-296px)] lg:max-w-[1080px]"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
          >
            {/* 左侧：搜索 + 设置菜单 */}
            <aside className="w-52 flex-none overflow-y-auto border-r border-line bg-paper p-3 nice-scroll">
              <div className="mb-3 flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-2.5">
                <Search size={13} className="flex-none text-faint" />
                <input
                  value={kw}
                  onChange={(e) => setKw(e.target.value)}
                  placeholder="搜索"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
                />
              </div>
              {MENU.map((g) => {
                const items = g.items.filter((it) => it.label.includes(kw.trim()))
                if (items.length === 0) return null
                return (
                <div key={g.group} className="mb-3">
                  <p className="px-2 pb-1 text-[11px] font-medium text-faint">{g.group}</p>
                  {g.items.map((it) => {
                    const Icon = it.icon
                    const active = it.label === '使用额度'
                    return (
                      <button
                        key={it.label}
                        onClick={() => {
                          if (!active) pushToast({ type: 'info', title: `${it.label}（模拟功能）` })
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-left text-[13.5px] transition',
                          active ? 'bg-black/[0.07] font-medium text-ink' : 'text-body hover:bg-black/[0.04]',
                        )}
                      >
                        <Icon size={15} className="flex-none text-faint" />
                        {it.label}
                      </button>
                    )
                  })}
                </div>
                )
              })}
            </aside>

            {/* 右侧：内容区 */}
            <div className="nice-scroll relative min-w-0 flex-1 overflow-y-auto p-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-black/5 hover:text-ink"
                aria-label="关闭"
              >
                <X size={16} />
              </button>

              {/* 标题 + 徽标 */}
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-ink">您的使用情况</span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    isMember ? 'border-gold/40 bg-gold-soft text-gold-deep' : 'border-line bg-white text-faint',
                  )}
                >
                  {isMember ? '尊享会员' : '免费版'}
                </span>
              </div>

              {/* 额度提示语（claude.ai "Heads up" 同款位置） */}
              {exhausted ? (
                <p className="mt-3 text-[17px] font-bold leading-snug text-ink">
                  额度已用完，选择下方方式立即解锁更多对话次数。
                </p>
              ) : (
                baseLeft <= 2 &&
                !isMember && (
                  <p className="mt-3 text-[17px] font-bold leading-snug text-ink">
                    提醒：按当前节奏，本窗口额度即将用完。
                  </p>
                )
              )}

              {/* 本 5 小时窗口（三段式：标签 | 进度条 | 百分比） */}
              <div className="mt-6 flex items-center gap-4">
                <div className="w-36 flex-none">
                  <p className="text-[13px] font-semibold text-ink">当前会话</p>
                  <p className="mt-0.5 whitespace-nowrap text-[11.5px] text-faint">已用 {su} / {sl} 次</p>
                  <p className="whitespace-nowrap text-[11.5px] text-faint">重置于 {fmtClock(session.resetAt)}</p>
                </div>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.08]">
                  <div
                    className={cn('h-full rounded-full transition-all', sessionPct >= 75 ? 'bg-[#E8A33D]' : 'bg-[#2C84DB]')}
                    style={{ width: `${sessionPct}%` }}
                  />
                </div>
                <span className="w-16 flex-none text-right text-[12px] tabular-nums text-faint">
                  <span className="font-bold text-ink">{Math.round((su / sl) * 100)}%</span> 已用
                </span>
              </div>

              {/* 本周窗口 */}
              <div className="mt-6 flex items-center gap-4">
                <div className="w-36 flex-none">
                  <p className="text-[13px] font-semibold text-ink">本周</p>
                  <p className="mt-0.5 whitespace-nowrap text-[11.5px] text-faint">已用 {wu} / {wl} 次</p>
                  <p className="whitespace-nowrap text-[11.5px] text-faint">重置于 {fmtWeek(week.resetAt)}</p>
                </div>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.08]">
                  <div
                    className={cn('h-full rounded-full transition-all', weekPct >= 75 ? 'bg-[#E8A33D]' : 'bg-[#2C84DB]')}
                    style={{ width: `${weekPct}%` }}
                  />
                </div>
                <span className="w-16 flex-none text-right text-[12px] tabular-nums text-faint">
                  <span className="font-bold text-ink">{Math.round((wu / wl) * 100)}%</span> 已用
                </span>
              </div>

              {/* 限额重置（原型 Limit resets 区块） */}
              <div className="mt-7">
                <p className="text-[13.5px] font-semibold text-ink">限额重置</p>
                <p className="mt-1 text-[13px] font-semibold text-ink">暂无其他排队中的重置</p>
                <p className="mt-0.5 text-[12px] text-faint">产生后，这里会显示该重置及其到期时间。</p>
              </div>

              {/* 福利次数（原型 Cloud session credits 区块样式） */}
              <div className="mt-7">
                <p className="text-[13.5px] font-semibold text-ink">福利次数</p>
                <p className="mt-1 text-[12px] text-faint">基础额度用完后自动抵扣，看广告、邀请好友可获得。</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12.5px] text-body">当前剩余</span>
                  <span className="text-[12.5px] tabular-nums text-faint">
                    <span className="font-bold text-emerald-700">{bonusChats}</span> 次
                  </span>
                </div>
              </div>

              {/* 补充对话次数（原 Buy more usage 位置的特色回血三件套） */}
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-[13.5px] font-semibold text-ink">补充对话次数</p>
                <div className="mt-2.5 space-y-2">
                  {perks.map((o) => {
                    const Icon = o.icon
                    return (
                      <button
                        key={o.title}
                        onClick={o.onClick}
                        className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left transition hover:border-gold hover:bg-gold-soft/40"
                      >
                        <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${o.cls}`}>
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-semibold text-ink">{o.title}</span>
                          <span className="block text-[11.5px] text-faint">{o.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 text-center text-[11px] text-faint">以上均为模拟功能，不产生任何真实费用</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
        </AnimatePresence>,
        document.body,
      )}
      {ad && <AdModal ad={ad} onClose={() => setAd(null)} />}
    </>
  )
}
