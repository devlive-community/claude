import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import InkBackground from './components/InkBackground'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import MobileTabBar from './components/layout/MobileTabBar'
import InviteModal from './components/layout/InviteModal'
import ToastHost from './components/ui/ToastHost'
import CoinFlyHost from './components/ui/CoinFlyHost'
import HomePage from './pages/HomePage'
import PaintPage from './pages/PaintPage'
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
        <InkBackground />
        <div className="paper-noise" aria-hidden />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/paint" element={<PaintPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
        <MobileTabBar />
        <InviteModal />
        <ToastHost />
        <CoinFlyHost />
      </div>
    </BrowserRouter>
  )
}
