import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import PaintPage from './pages/PaintPage'
import TasksPage from './pages/TasksPage'
import ShopPage from './pages/ShopPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import { useUserStore } from './store/useUserStore'

/** 福利功能登录守卫：未登录访问 /tasks /shop /activities /paint 时拦截 */
function RequireLogin({ children }: { children: ReactNode }) {
  const loggedIn = useUserStore((s) => s.loggedIn)
  if (loggedIn) return <>{children}</>
  return (
    <div className="flex min-h-[calc(100vh-52px)] flex-col items-center justify-center gap-2 px-4 pb-16 lg:min-h-screen">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.05] text-faint">
        <LogIn size={22} />
      </span>
      <h1 className="mt-3 font-serif text-[22px] font-bold text-ink">登录后可使用此功能</h1>
      <p className="max-w-xs text-center text-[13.5px] leading-relaxed text-faint">
        每日签到、金币商城、活动玩法与 AI 绘画都需要登录（模拟账号）后使用。
      </p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
        className="btn btn-red mt-2"
      >
        <LogIn size={14} /> 登录 / 注册
      </button>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const ensureDaily = useUserStore((s) => s.ensureDaily)
  useEffect(() => {
    ensureDaily()
    const t = window.setInterval(ensureDaily, 60_000)
    return () => window.clearInterval(t)
  }, [ensureDaily])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="relative min-h-screen">
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/new" replace />} />
            <Route path="/new" element={<HomePage key="new" />} />
            <Route path="/chat/:id" element={<HomePage key="chat" />} />
            <Route path="/paint" element={<RequireLogin><PaintPage /></RequireLogin>} />
            <Route path="/tasks" element={<RequireLogin><TasksPage /></RequireLogin>} />
            <Route path="/shop" element={<RequireLogin><ShopPage /></RequireLogin>} />
            <Route path="/activities" element={<RequireLogin><ActivitiesPage /></RequireLogin>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </div>
    </BrowserRouter>
  )
}
