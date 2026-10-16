import Hero from '../components/sections/Hero'
import MemberCard from '../components/sections/MemberCard'
import ActivityEntries from '../components/sections/ActivityEntries'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { CoinIcon } from '../components/icons'

/** 金币获取攻略小卡 */
function EarnTips() {
  const navigate = useNavigate()
  const tips = [
    { label: '每日签到', value: '+10 金币', path: '/tasks' },
    { label: '每日任务', value: '最高 +130', path: '/tasks' },
    { label: '摇一摇', value: '最高 +300', path: '/activities' },
    { label: '幸运大转盘', value: '最高 +50', path: '/activities' },
    { label: '红包雨', value: '一场 +40', path: '/activities' },
  ]
  return (
    <section className="card p-5">
      <h3 className="flex items-center gap-2 font-serif text-base font-bold text-ink">
        <CoinIcon size={18} /> 今日金币攻略
      </h3>
      <div className="mt-3 space-y-1.5">
        {tips.map((t) => (
          <button
            key={t.label}
            onClick={() => navigate(t.path)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-gold-soft/40"
          >
            <span className="flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-full bg-gold/20">
              <Check size={10} strokeWidth={3.5} className="text-gold-deep" />
            </span>
            <span className="text-xs text-body">{t.label}</span>
            <span className="ml-auto text-xs font-bold text-gold-deep tabular-nums">{t.value}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

/** 首页：品牌 Hero + 活动聚合入口 + 会员 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-20 md:px-6 md:pt-24">
      <Hero />
      <div className="mt-4 grid gap-4 lg:mt-[18px] lg:grid-cols-[1fr_380px] lg:gap-[18px]">
        <ActivityEntries />
        <div className="space-y-4">
          <MemberCard />
          <EarnTips />
        </div>
      </div>
    </div>
  )
}
