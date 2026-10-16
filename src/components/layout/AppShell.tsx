import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Footer from './Footer'
import MobileTabBar from './MobileTabBar'
import InviteModal from './InviteModal'
import ToastHost from '../ui/ToastHost'
import CoinFlyHost from '../ui/CoinFlyHost'

/** 应用外壳：Claude 官网式侧栏 + 主内容区 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isChatHome = location.pathname === '/'

  return (
    <div className="relative min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <div className={isChatHome ? 'flex flex-1 flex-col' : 'flex-1'}>
          {children}
          {!isChatHome && <Footer />}
        </div>
      </div>
      <MobileTabBar />
      <InviteModal />
      <ToastHost />
      <CoinFlyHost />
    </div>
  )
}
