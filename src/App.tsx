import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import PaintPage from './pages/PaintPage'
import TasksPage from './pages/TasksPage'
import ShopPage from './pages/ShopPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AboutPage from './pages/AboutPage'
import { useUserStore } from './store/useUserStore'

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
            <Route path="/new" element={<HomePage />} />
            <Route path="/chat/:id" element={<HomePage />} />
            <Route path="/paint" element={<PaintPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AppShell>
      </div>
    </BrowserRouter>
  )
}
