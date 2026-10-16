import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, MessageSquarePlus, PanelLeft } from 'lucide-react'
import Sidebar from './Sidebar'
import InviteModal from './InviteModal'
import ToastHost from '../ui/ToastHost'
import CoinFlyHost from '../ui/CoinFlyHost'
import { ClaudeMark } from '../icons'

/** 应用外壳：与 claude.ai 一致 —— 侧栏承载一切，无顶栏、无页脚 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isChatHome = location.pathname === '/'

  return (
    <div className="relative min-h-screen bg-paper">
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onCollapse={() => setCollapsed(true)}
      />

      {/* 折叠后：主区左上角悬浮展开按钮（桌面端，claude.ai 同款位置） */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed left-3 top-3 z-40 hidden h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-black/5 lg:flex"
          aria-label="展开侧栏"
        >
          <PanelLeft size={17} />
        </button>
      )}

      {/* 移动端顶栏（claude.ai 移动端样式：菜单 + Logo + 新对话） */}
      <div
        className="sticky top-0 z-30 flex items-center gap-1 border-b border-black/[0.05] bg-paper/90 px-2 backdrop-blur lg:hidden"
        style={{ height: 52 }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
          aria-label="打开菜单"
        >
          <Menu size={19} />
        </button>
        <span className="flex items-center gap-1.5">
          <span className="text-ink">
            <ClaudeMark size={20} />
          </span>
          <span className="font-serif text-[15px] font-bold text-ink">Claude</span>
        </span>
        <button
          onClick={() => navigate('/')}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
          aria-label="新对话"
        >
          <MessageSquarePlus size={18} />
        </button>
      </div>

      {/* 主区：桌面端为固定侧栏让位；折叠后自然占满 */}
      <div
        className={
          'transition-[padding] duration-200 ' +
          (collapsed ? '' : 'lg:pl-[248px] ') +
          (isChatHome
            ? 'flex min-h-[calc(100vh-52px)] flex-col lg:min-h-screen'
            : 'min-h-[calc(100vh-52px)] lg:min-h-screen')
        }
      >
        {children}
      </div>

      <InviteModal />
      <ToastHost />
      <CoinFlyHost />
    </div>
  )
}
