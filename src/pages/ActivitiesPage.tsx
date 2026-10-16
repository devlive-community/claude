import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AdsSection from '../components/sections/AdsSection'
import BargainCard from '../components/sections/BargainCard'
import ShakeCard from '../components/sections/ShakeCard'
import WheelSection from '../components/sections/WheelSection'
import RedPacketSection from '../components/sections/RedPacketSection'
import PageHeader from '../components/ui/PageHeader'
import { cn } from '../lib/utils'

const CHIPS = [
  { label: '看广告', id: 'ads' },
  { label: '砍一刀', id: 'bargain' },
  { label: '摇一摇', id: 'shake' },
  { label: '大转盘', id: 'wheel' },
  { label: '红包雨', id: 'redpacket' },
]

/** 活动广场页：全部营销玩法 */
export default function ActivitiesPage() {
  const [active, setActive] = useState('ads')
  const location = useLocation()

  // 支持从其他页面带 hash 跳转进来（如 /activities#shake）
  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash && CHIPS.some((c) => c.id === hash)) {
      setActive(hash)
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }, [location.hash])

  const jump = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-5 md:px-6 md:pt-7">
      <PageHeader
        seal="活"
        title="活动广场"
        sub="看广告、砍一刀、摇一摇、大转盘、红包雨 —— 熟悉的味道，全部为模拟玩法"
      />

      {/* 页内锚点导航 */}
      <div className="sticky top-16 z-30 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-paper/80 px-4 py-2.5 backdrop-blur no-scrollbar md:mx-0 md:rounded-xl md:px-2">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => jump(c.id)}
            className={cn(
              'flex-none rounded-full border px-4 py-1.5 text-xs font-semibold transition',
              active === c.id
                ? 'border-transparent bg-gradient-to-br from-[#F04438] to-[#B91C1C] text-white shadow-red'
                : 'border-line bg-white/70 text-body hover:border-gold hover:text-gold-deep',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <AdsSection />
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[18px]">
        <BargainCard />
        <ShakeCard />
      </div>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-[18px]">
        <WheelSection />
        <RedPacketSection />
      </div>
    </div>
  )
}
