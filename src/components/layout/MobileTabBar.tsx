import { useState } from 'react'
import { CalendarCheck, House, ListChecks, MessageCircleMore, ShoppingBag } from 'lucide-react'
import { useSectionNav } from '../../lib/useSectionNav'
import { cn } from '../../lib/utils'

const TABS = [
  { label: '首页', icon: House, id: 'hero' },
  { label: '对话', icon: MessageCircleMore, id: 'chat' },
  { label: '签到', icon: CalendarCheck, id: 'signin' },
  { label: '任务', icon: ListChecks, id: 'tasks' },
  { label: '商城', icon: ShoppingBag, id: 'shop' },
]

export default function MobileTabBar() {
  const go = useSectionNav()
  const [active, setActive] = useState('hero')
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[#FFFBF2]/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {TABS.map((t) => {
          const Icon = t.icon
          const on = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => {
                setActive(t.id)
                go(t.id)
              }}
              className="flex flex-1 flex-col items-center gap-0.5 py-2"
            >
              <Icon size={20} className={cn('transition-colors', on ? 'text-cred' : 'text-faint')} />
              <span className={cn('text-[10px] font-medium', on ? 'text-cred' : 'text-faint')}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
