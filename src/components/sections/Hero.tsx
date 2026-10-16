import { motion } from 'framer-motion'
import { CalendarCheck, HandCoins, Sparkles, Tv, Users } from 'lucide-react'
import AnimatedNumber from '../ui/AnimatedNumber'
import { useUIStore } from '../../store/useUIStore'
import { useSectionNav } from '../../lib/useSectionNav'

const TAGS = [
  { label: '看广告解锁', icon: Tv, action: 'ads' },
  { label: '砍一刀免费领', icon: HandCoins, action: 'bargain' },
  { label: '每日签到领金币', icon: CalendarCheck, action: 'signin' },
  { label: '邀请好友得额度', icon: Users, action: 'invite' },
]

export default function Hero() {
  const go = useSectionNav()
  const openInvite = useUIStore((s) => s.openInvite)

  const onTag = (action: string) => {
    if (action === 'invite') openInvite('chats')
    else go(action)
  }

  return (
    <section id="hero" className="card overflow-hidden p-6 md:p-9">
      <div className="grid items-center gap-7 lg:grid-cols-[1fr_285px]">
        {/* 左侧文案 */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cred/45 bg-cred-soft px-3 py-1 text-[11px] font-semibold text-cred">
              非官方 · 娱乐模拟站点
            </span>
            <span className="rounded-full border border-gold/50 bg-gold-soft px-3 py-1 text-[11px] font-medium text-gold-deep">
              国风 × 营销 × AI
            </span>
          </div>

          <h1 className="font-brush text-[42px] leading-[1.15] text-ink md:text-6xl">
            更懂<span className="text-cred">中国</span>人的
          </h1>
          <div className="mt-1 inline-flex flex-col">
            <span className="font-serif text-6xl font-black tracking-tight text-ink md:text-7xl">
              Claude
              <span className="ml-2 align-top font-sans text-sm font-semibold text-brand">China Edition</span>
            </span>
            <svg viewBox="0 0 260 14" className="mt-1 h-3 w-44 md:w-56" aria-hidden>
              <path
                d="M4 9 C 60 3, 130 3, 256 7"
                fill="none"
                stroke="#D97757"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
          </div>

          <p className="mt-4 font-serif text-base tracking-[0.28em] text-body md:text-lg">对话世界 · 也懂人间烟火</p>

          {/* 快捷活动标签 */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {TAGS.map((t) => {
              const Icon = t.icon
              return (
                <motion.button
                  key={t.label}
                  onClick={() => onTag(t.action)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-full border border-gold/55 bg-[#FFFBF2] px-4 py-2 text-[13px] font-medium text-body shadow-sm transition hover:border-gold hover:text-gold-deep"
                >
                  <Icon size={15} className="text-gold-deep" />
                  {t.label}
                </motion.button>
              )
            })}
          </div>

          {/* 模拟数据 */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-faint">
            <span>
              已服务客官 <AnimatedNumber value={1028456} className="font-bold text-gold-deep tabular-nums" /> 位
            </span>
            <span className="hidden h-3 w-px bg-line md:block" />
            <span>
              今日发放金币 <AnimatedNumber value={3582000} className="font-bold text-gold-deep tabular-nums" />
            </span>
            <span className="hidden h-3 w-px bg-line md:block" />
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-gold" />
              好评率 99.9%
            </span>
          </div>
        </div>

        {/* 右侧文人插画 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto hidden w-[285px] lg:block"
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="relative overflow-hidden rounded-2xl border border-gold/40 shadow-lift">
              <img src="/img/scholar.jpg" alt="手持折扇的古代文人，扇面题字：Claude 助你妙笔生花" className="h-[360px] w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF4E5] via-transparent to-transparent" style={{ height: '38%', top: '62%' }} />
              {/* 题字 */}
              <div
                className="absolute right-3 top-3 rounded-lg bg-[#FFFBF2]/85 px-1.5 py-2 font-brush text-lg leading-tight text-cred shadow-sm backdrop-blur-sm"
                style={{ writingMode: 'vertical-rl' }}
              >
                助你妙笔生花
              </div>
              {/* 印章 */}
              <div className="absolute bottom-3 right-3 flex h-11 w-11 rotate-3 items-center justify-center rounded-md border-2 border-[#A31515]/70 bg-[#C62828] font-brush text-[13px] leading-tight text-[#FFF4E5] shadow-red">
                <span className="text-center">妙<br />笔</span>
              </div>
            </div>
          </motion.div>
          {/* 扇面说明 */}
          <p className="mt-2.5 text-center text-[11px] text-faint">
            扇面题字 · Claude <span className="text-gold-deep">助你妙笔生花</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
