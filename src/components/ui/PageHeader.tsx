import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/** 子页面统一页头 */
export default function PageHeader({
  seal,
  title,
  sub,
  right,
}: {
  seal: string
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 pt-2">
      <motion.span
        initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        className="seal !h-11 !w-11 !text-xl"
      >
        {seal}
      </motion.span>
      <div className="min-w-0">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-2xl font-bold text-ink md:text-[28px]"
        >
          {title}
        </motion.h1>
        {sub && <p className="mt-1 text-[13px] text-faint">{sub}</p>}
      </div>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  )
}
