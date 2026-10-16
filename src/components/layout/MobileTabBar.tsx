import { useNavigate, useLocation } from 'react-router-dom'
import { Gift, House, ListChecks, MessageCircleMore, ShoppingBag as ShoppingBagIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

const TABS = [
  { label: '对话', icon: MessageCircleMore, path: '/' },
  { label: '活动', icon: Gift, path: '/activities' },
  { label: '任务', icon: ListChecks, path: '/tasks' },
  { label: '商城', icon: ShoppingBagIcon, path: '/shop' },
  { label: '绘画', icon: House, path: '/paint' },
]

export default function MobileTabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[#FFFBF2]/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {TABS.map((t) => {
          const Icon = t.icon
          const on = location.pathname === t.path
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
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
