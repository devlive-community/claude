import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Coins, MessageCircleMore, Palette, Share2, Tv, UserPlus } from 'lucide-react'
import { CoinIcon } from '../icons'

const LINKS = [
  { label: '每日签到', value: '+10 金币/天', icon: CalendarCheck, path: '/tasks' },
  { label: '完成一次对话', value: '+5 金币', icon: MessageCircleMore, path: '/chat' },
  { label: '观看广告', value: '+20 金币', icon: Tv, path: '/activities' },
  { label: '分享活动', value: '+30 金币', icon: Share2, path: '/tasks' },
  { label: '邀请好友', value: '+50 金币', icon: UserPlus, path: '/tasks' },
  { label: '体验 AI 绘画', value: '+15 金币', icon: Palette, path: '/paint' },
]

/** 金币获取途径卡片 */
export default function TaskLinksCard() {
  const navigate = useNavigate()
  return (
    <section className="card p-5">
      <h3 className="flex items-center gap-2 font-serif text-base font-bold text-ink">
        <Coins size={17} className="text-gold-deep" />
        金币不够用？去赚一点
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {LINKS.map((l, i) => {
          const Icon = l.icon
          return (
            <motion.button
              key={l.label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(l.path)}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-white/60 px-3 py-2.5 text-left transition hover:border-gold/70 hover:bg-gold-soft/30"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-gold-soft text-gold-deep">
                <Icon size={15} />
              </span>
              <span className="text-[13px] font-semibold text-ink">{l.label}</span>
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-gold-deep">
                <CoinIcon size={12} />
                {l.value}
              </span>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-faint">金币与对话次数全站联动，右上角余额实时更新</p>
    </section>
  )
}
