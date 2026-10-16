import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  sealChar?: string
  width?: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, sealChar, width = 'max-w-md', children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#2a1a10]/50 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div
            className={cn('card relative max-h-[86vh] w-full overflow-y-auto p-5 nice-scroll', width)}
            style={{ background: '#FFFBF2' }}
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-faint transition hover:bg-cred-soft hover:text-cred"
              aria-label="关闭"
            >
              <X size={17} />
            </button>
            {(title || sealChar) && (
              <div className="mb-4 flex items-center gap-2.5 pr-8">
                {sealChar && <span className="seal">{sealChar}</span>}
                {typeof title === 'string' ? (
                  <h3 className="font-serif text-lg font-bold text-ink">{title}</h3>
                ) : (
                  title
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
