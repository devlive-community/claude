import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { useUIStore, type ToastType } from '../../store/useUIStore'
import { CoinIcon } from '../icons'

const ICONS: Record<ToastType, { node: React.ReactNode; cls: string }> = {
  success: { node: <CheckCircle2 size={18} />, cls: 'text-emerald-600 bg-emerald-50' },
  coin: { node: <CoinIcon size={18} />, cls: 'bg-gold-soft' },
  info: { node: <Info size={18} />, cls: 'text-[#4C6FA5] bg-[#EDF3FB]' },
  warn: { node: <TriangleAlert size={18} />, cls: 'text-cred bg-cred-soft' },
}

export default function ToastHost() {
  const toasts = useUIStore((s) => s.toasts)
  const dismiss = useUIStore((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed bottom-20 left-3 right-3 z-[90] flex flex-col items-center gap-2 md:bottom-6 md:left-auto md:right-5 md:items-end">
      <AnimatePresence>
        {toasts.map((t) => {
          const ic = ICONS[t.type]
          return (
            <motion.button
              key={t.id}
              layout
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-[#FFFBF2]/95 px-4 py-3 text-left shadow-lift backdrop-blur"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${ic.cls}`}>{ic.node}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{t.title}</span>
                {t.desc && <span className="block truncate text-xs text-faint">{t.desc}</span>}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
