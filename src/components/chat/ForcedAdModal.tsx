import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ADS } from '../sections/AdsSection'

const FORCED_AD_SECONDS = 10

/** 未登录发送前的强制广告：观看 10 秒后解锁本次对话（模拟） */
export default function ForcedAdModal({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: () => void
}) {
  const [left, setLeft] = useState(FORCED_AD_SECONDS)
  const ad = useMemo(() => ADS[Math.floor(Math.random() * ADS.length)], [open])

  useEffect(() => {
    if (!open) {
      setLeft(FORCED_AD_SECONDS)
      return
    }
    const t = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000)
    return () => window.clearInterval(t)
  }, [open])

  const done = left <= 0

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lift"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
          >
            {/* 顶栏：标签 + 倒计时/关闭 */}
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10.5px] text-faint">
                广告 · {ad.tag}
              </span>
              {done ? (
                <button
                  onClick={onComplete}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
                  aria-label="关闭广告"
                >
                  <X size={15} />
                </button>
              ) : (
                <span className="text-[12px] tabular-nums text-faint">{left}s 后可跳过</span>
              )}
            </div>

            {/* 广告内容 */}
            <img src={ad.img} alt={ad.title} className="h-44 w-full object-cover" />
            <div className="px-4 py-3">
              <p className="text-[15px] font-bold text-ink">{ad.title}</p>
              <p className="mt-0.5 text-[13px] text-faint">{ad.sub}</p>
            </div>

            {/* 底部按钮 */}
            <div className="px-4 pb-4">
              {done ? (
                <button
                  onClick={onComplete}
                  className="btn btn-red w-full"
                >
                  关闭广告，解锁本次对话
                </button>
              ) : (
                <div className="h-1 w-full overflow-hidden rounded-full bg-black/[0.08]">
                  <div
                    className="h-full bg-brand transition-all duration-1000 ease-linear"
                    style={{ width: `${((FORCED_AD_SECONDS - left) / FORCED_AD_SECONDS) * 100}%` }}
                  />
                </div>
              )}
              <p className="mt-2.5 text-center text-[10.5px] text-faint">
                本站为娱乐模拟网站，广告与奖励均为模拟，不产生任何真实费用
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
