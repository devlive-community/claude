import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Menu, Send } from 'lucide-react'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { ClaudeMark, CoinIcon } from '../icons'
import AnimatedNumber from '../ui/AnimatedNumber'

const NOTIFICATIONS = [
  { title: '红包雨限时开启', desc: '去活动广场，金币等你来抢！', time: '刚刚' },
  { title: '签到提醒', desc: '连续签到第 7 天可得 50 金币哦～', time: '1 小时前' },
  { title: '砍一刀助力邀请', desc: '您的好友邀请您帮忙砍一刀！', time: '3 小时前' },
]

export default function TopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const navigate = useNavigate()
  const coins = useUserStore((s) => s.coins)
  const coinPulse = useUIStore((s) => s.coinPulse)
  const loggedIn = useUserStore((s) => s.loggedIn)
  const nickname = useUserStore((s) => s.nickname)
  const logout = useUserStore((s) => s.logout)
  const pushToast = useUIStore((s) => s.pushToast)
  const [read, setRead] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line/60 bg-paper/75 px-3 backdrop-blur-xl md:px-5">
      <button
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-black/5 lg:hidden"
        aria-label="打开侧栏"
      >
        <Menu size={18} />
      </button>

      {/* 移动端品牌 */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-brand">
          <ClaudeMark size={22} />
        </span>
        <span className="font-serif text-[15px] font-bold text-ink">Claude</span>
        <span className="rounded-[4px] bg-gradient-to-br from-[#F04438] to-[#B91C1C] px-1 py-px text-[9px] font-bold text-white">中国版</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* 金币 */}
        <button
          onClick={() => navigate('/shop')}
          className="flex h-9 items-center gap-1.5 rounded-full border border-gold/50 bg-gold-soft px-3 transition hover:border-gold"
          title="金币余额，点击前往商城"
        >
          <motion.span key={coinPulse} animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 0] }} transition={{ duration: 0.5 }} className="flex">
            <CoinIcon size={16} />
          </motion.span>
          <span className="text-[13px] font-bold text-gold-deep tabular-nums">
            <AnimatedNumber value={coins} />
          </span>
        </button>

        {/* 通知 */}
        <div className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/60 text-body transition hover:border-gold hover:text-gold-deep"
            aria-label="通知"
          >
            <Bell size={15} />
            {!read && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cred anim-blink" />}
          </button>
          <AnimatePresence>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="card absolute right-0 top-11 z-20 w-72 p-3"
                  style={{ background: '#FFFBF2' }}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-sm font-bold text-ink">通知</span>
                    <button onClick={() => setRead(true)} className="text-xs text-faint hover:text-cred">
                      全部已读
                    </button>
                  </div>
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.title} className="rounded-lg px-2 py-2 hover:bg-card-deep">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink">{n.title}</span>
                        <span className="ml-auto text-[10px] text-faint">{n.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-faint">{n.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* 登录 */}
        {loggedIn ? (
          <button
            onClick={() => {
              logout()
              pushToast({ type: 'info', title: '已退出登录（模拟）' })
            }}
            className="flex h-9 items-center gap-2 rounded-full border border-line bg-white/60 pl-1 pr-3"
            title="点击退出登录"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-xs font-bold text-white">
              {nickname.slice(0, 1)}
            </span>
            <span className="hidden max-w-20 truncate text-xs font-medium text-ink sm:block">{nickname}</span>
          </button>
        ) : (
          <button
            onClick={() => pushToast({ type: 'info', title: '登录为模拟功能', desc: '在活动页体验完整登录流程' })}
            className="btn btn-red btn-sm h-9"
          >
            <Send size={13} /> 登录
          </button>
        )}
      </div>
    </header>
  )
}
