import { useState } from 'react'
import { Crown, Tv, UserPlus } from 'lucide-react'
import Modal from '../ui/Modal'
import { AdModal, ADS } from '../sections/AdsSection'
import { useUIStore } from '../../store/useUIStore'
import { useNavigate } from 'react-router-dom'
import { useUserStore, SESSION_LIMIT, WEEKLY_LIMIT } from '../../store/useUserStore'
import { cn } from '../../lib/utils'

function fmtClock(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
function fmtWeek(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 使用额度弹窗：claude.ai 原型布局（每5小时/每周进度条）+ 特色回血三件套 */
export default function QuotaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const openInvite = useUIStore((s) => s.openInvite)
  const [ad, setAd] = useState<(typeof ADS)[number] | null>(null)

  const session = useUserStore((s) => s.session)
  const week = useUserStore((s) => s.week)
  const bonusChats = useUserStore((s) => s.bonusChats)
  const isMember = useUserStore((s) => s.isMember)()

  const now = Date.now()
  const su = now >= session.resetAt ? 0 : session.used
  const wu = now >= week.resetAt ? 0 : week.used
  const sessionPct = Math.min(100, Math.round((su / SESSION_LIMIT) * 100))
  const weekPct = Math.min(100, Math.round((wu / WEEKLY_LIMIT) * 100))
  const baseLeft = Math.max(0, Math.min(SESSION_LIMIT - su, WEEKLY_LIMIT - wu))
  const exhausted = !isMember && baseLeft <= 0

  const options = [
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
      title: '开通尊享会员',
      desc: '限时 ¥9.9/月，对话不限量（模拟）',
      cls: 'text-gold-deep bg-gold-soft',
      onClick: () => {
        onClose()
        navigate('/shop')
      },
    },
  ]

  return (
    <>
      <Modal open={open} onClose={onClose} title="您的使用情况" width="max-w-md">
        {/* 方案徽标 + 概览 */}
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-ink">您的使用情况</span>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
              isMember ? 'border-gold/40 bg-gold-soft text-gold-deep' : 'border-line bg-white text-faint',
            )}
          >
            {isMember ? '尊享会员' : '免费版'}
          </span>
          {!isMember && (
            <span className="ml-auto text-[12px] text-faint">
              剩余 <span className={cn('font-bold tabular-nums', baseLeft > 2 ? 'text-emerald-700' : 'text-cred')}>{baseLeft}</span>
              {bonusChats > 0 && <span className="text-emerald-700"> +{bonusChats} 福利</span>} 次
            </span>
          )}
        </div>

        {/* 额度提示语（claude.ai "Heads up" 同款位置） */}
        {exhausted ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            <p className="text-[13px] font-semibold text-amber-900">额度已用完</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-amber-800/80">
              选择下方任意方式，立即解锁更多对话次数。
            </p>
          </div>
        ) : (
          !isMember &&
          (baseLeft <= 2 || weekPct >= 80) && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
              <p className="text-[13px] font-semibold text-amber-900">提醒：按当前节奏，本窗口额度即将用完</p>
              <p className="mt-0.5 text-[12px] text-amber-800/80">重置后自动恢复，也可通过下方方式补充。</p>
            </div>
          )
        )}

        {/* 每 5 小时窗口 */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-ink">本窗口 · 每 5 小时</span>
            <span className="text-[12px] tabular-nums text-faint">
              {isMember ? '不限量' : (
                <>
                  <span className="font-bold text-ink">{su}</span> / {SESSION_LIMIT} 次已用
                </>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
            <div
              className="h-full rounded-full bg-[#2C84DB] transition-all"
              style={{ width: `${isMember ? 0 : sessionPct}%` }}
            />
          </div>
          <p className="mt-1 text-[11.5px] text-faint">重置于 {fmtClock(session.resetAt)}</p>
        </div>

        {/* 每周窗口 */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-ink">本周 · 每 7 天</span>
            <span className="text-[12px] tabular-nums text-faint">
              {isMember ? '不限量' : (
                <>
                  <span className="font-bold text-ink">{wu}</span> / {WEEKLY_LIMIT} 次已用
                </>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
            <div
              className="h-full rounded-full bg-[#E8A33D] transition-all"
              style={{ width: `${isMember ? 0 : weekPct}%` }}
            />
          </div>
          <p className="mt-1 text-[11.5px] text-faint">重置于 {fmtWeek(week.resetAt)}</p>
        </div>

        {/* 特色回血三件套 */}
        <div className="mt-5 border-t border-line pt-3.5">
          <p className="text-[13px] font-semibold text-ink">补充对话次数</p>
          <div className="mt-2.5 space-y-2.5">
            {options.map((o) => {
              const Icon = o.icon
              return (
                <button
                  key={o.title}
                  onClick={o.onClick}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-white/70 p-3 text-left transition hover:border-gold hover:bg-gold-soft/40"
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
        </div>
      </Modal>

      {ad && (
        <AdModal
          ad={ad}
          onClose={() => setAd(null)}
        />
      )}
    </>
  )
}
