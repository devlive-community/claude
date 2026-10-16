import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Axe,
  CalendarCheck,
  ChevronRight,
  Gift,
  MessageCircleMore,
  RotateCw,
  ShoppingBag,
  Smartphone,
  Tv,
} from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import { CoinIcon } from '../icons'
import { useUserStore } from '../../store/useUserStore'
import { cn } from '../../lib/utils'

/** 首页活动入口宫格 */
export default function ActivityEntries() {
  const navigate = useNavigate()
  const chatLeft = useUserStore((s) => s.chatsRemaining())
  const signedToday = useUserStore((s) => s.signedInToday)

  const ENTRIES = [
    {
      title: 'AI 对话',
      desc: chatLeft > 0 ? `今日还可免费聊 ${chatLeft} 次` : '额度用完，看广告回血',
      icon: MessageCircleMore,
      cls: 'text-brand-deep bg-brand-soft',
      path: '/chat',
      tag: '核心功能',
    },
    {
      title: '看广告解锁',
      desc: '看 30 秒广告领 5 次对话',
      icon: Tv,
      cls: 'text-[#4C6FA5] bg-[#EDF3FB]',
      path: '/activities',
      hash: 'ads',
      tag: '每日 5 次',
    },
    {
      title: '每日签到',
      desc: signedToday ? '今日已签到，明天继续' : '连签 7 天可领 50 金币',
      icon: CalendarCheck,
      cls: 'text-cred bg-cred-soft',
      path: '/tasks',
      tag: signedToday ? '已签到' : '未签到',
    },
    {
      title: '砍一刀',
      desc: '好友助力 0 元领尊享会员',
      icon: Axe,
      cls: 'text-[#C07A2B] bg-[#FBF0DE]',
      path: '/activities',
      hash: 'bargain',
      tag: '0 元购',
    },
    {
      title: '摇一摇',
      desc: '每天 3 次，摇出金币惊喜',
      icon: Smartphone,
      cls: 'text-cred bg-cred-soft',
      path: '/activities',
      hash: 'shake',
      tag: '每日 3 次',
    },
    {
      title: '幸运大转盘',
      desc: '每天 1 次免费抽奖机会',
      icon: RotateCw,
      cls: 'text-gold-deep bg-gold-soft',
      path: '/activities',
      hash: 'wheel',
      tag: '免费抽',
    },
    {
      title: '红包雨',
      desc: '15 秒手速大战，红包从天降',
      icon: Gift,
      cls: 'text-cred bg-cred-soft',
      path: '/activities',
      hash: 'redpacket',
      tag: '限时',
    },
    {
      title: '金币商城',
      desc: '金币兑换对话次数与会员',
      icon: ShoppingBag,
      cls: 'text-gold-deep bg-gold-soft',
      path: '/shop',
      tag: '兑换',
    },
  ]

  return (
    <section className="card p-5 md:p-6">
      <SectionHeader
        seal="惠"
        title="活动广场 · 总有一款适合您"
        sub="中国互联网特色营销玩法一网打尽，全部为模拟功能"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ENTRIES.map((e, i) => {
          const Icon = e.icon
          return (
            <motion.button
              key={e.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(e.path)}
              className="group relative flex flex-col items-start rounded-xl border border-line bg-white/70 p-4 text-left transition hover:border-gold/70 hover:bg-gold-soft/30"
            >
              <span className="absolute right-3 top-3 rounded-full bg-gold-soft/80 px-2 py-0.5 text-[10px] font-semibold text-gold-deep">
                {e.tag}
              </span>
              <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', e.cls)}>
                <Icon size={23} />
              </span>
              <span className="mt-3 font-serif text-[15px] font-bold text-ink">{e.title}</span>
              <span className="mt-0.5 text-[11px] leading-snug text-faint">{e.desc}</span>
              <span className="mt-2.5 flex items-center gap-0.5 text-[11px] font-semibold text-cred opacity-70 transition group-hover:opacity-100">
                立即前往 <ChevronRight size={12} />
              </span>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
        <CoinIcon size={13} /> 所有活动的奖励均与右上角金币账户联动，刷新不丢失
      </p>
    </section>
  )
}
