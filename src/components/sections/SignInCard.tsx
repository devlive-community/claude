import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { CoinIcon } from '../icons'
import { SIGN_REWARDS, useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { centerOf, cn } from '../../lib/utils'
import AnimatedNumber from '../ui/AnimatedNumber'

export default function SignInCard() {
  const signedInToday = useUserStore((s) => s.signedInToday)
  const signCount = useUserStore((s) => s.signCount)
  const streak = useUserStore((s) => s.streak)
  const signIn = useUserStore((s) => s.signIn)
  const pushToast = useUIStore((s) => s.pushToast)
  const flyCoins = useUIStore((s) => s.flyCoins)
  const btnRef = useRef<HTMLButtonElement>(null)

  /** 当前周期内已签到的格数 */
  const cyclePos = signCount % 7

  const handleSign = () => {
    if (signedInToday) return
    const reward = signIn()
    if (reward <= 0) return
    const newStreak = useUserStore.getState().streak
    const from = centerOf(btnRef.current)
    if (from) flyCoins(from, 8)
    pushToast({ type: 'coin', title: `签到成功，获得 ${reward} 金币！`, desc: `已连续签到 ${newStreak} 天` })
  }

  return (
    <section id="signin" className="card flex flex-col overflow-hidden">
      {/* 红金标题带 */}
      <div className="promo-bg px-5 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <CoinIcon size={22} />
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#FFF8EC]">每日签到</h2>
            <p className="text-[11px] text-[#F7D9A8]/90">连续签到赢金币，好礼不断</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-[#F7D9A8]/80">连续签到</p>
            <p className="font-serif text-xl font-bold leading-none text-white">
              <AnimatedNumber value={streak} />
              <span className="ml-0.5 text-[11px] font-normal">天</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* 7 日日历 */}
        <div className="grid grid-cols-7 gap-1.5">
          {SIGN_REWARDS.map((reward, i) => {
            const checked = i < cyclePos
            const isToday = i === cyclePos && !signedInToday
            const justSigned = i === cyclePos - 1 && signedInToday && (signCount - 1) % 7 === i
            return (
              <div
                key={i}
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-xl border py-2.5 transition',
                  checked
                    ? 'border-gold/60 bg-gold-soft/70'
                    : isToday
                      ? 'border-cred bg-cred-soft shadow-[0_0_0_3px_rgba(198,40,40,0.12)]'
                      : 'border-line bg-white/50',
                )}
              >
                <span className={cn('text-[10px] font-medium', checked || isToday ? 'text-cred' : 'text-faint')}>
                  {i === 6 ? '第7天' : `第${i + 1}天`}
                </span>
                {checked ? (
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#F2CF8D] to-[#C08F36] text-white shadow-gold',
                      justSigned && 'ring-2 ring-cred/40',
                    )}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                ) : (
                  <CoinIcon size={22} className={isToday ? 'opacity-100' : 'opacity-55'} />
                )}
                <span className={cn('text-[10px] font-bold tabular-nums', checked ? 'text-gold-deep' : 'text-body')}>
                  {reward}
                </span>
                {isToday && (
                  <motion.span
                    className="absolute -top-1.5 rounded-full bg-cred px-1.5 py-px text-[9px] font-bold text-white"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{ left: '50%', x: '-50%' }}
                  >
                    今日
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* 签到按钮 */}
        <motion.button
          ref={btnRef}
          onClick={handleSign}
          disabled={signedInToday}
          whileTap={!signedInToday ? { scale: 0.96 } : undefined}
          className={cn('btn btn-lg mt-4 w-full', signedInToday ? 'btn-ghost' : 'btn-red')}
        >
          {signedInToday ? '今日已签到，明天再来' : '立即签到'}
        </motion.button>
        <p className="mt-2 text-center text-[10px] text-faint">
          {signedInToday ? '签到奖励已到账，金币可去商城兑换对话次数' : '签到奖励自动存入右上角金币账户'}
        </p>
      </div>
    </section>
  )
}
