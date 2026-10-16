import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export default function SectionHeader({
  seal,
  title,
  sub,
  right,
  dark = false,
  className,
}: {
  seal: string
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-end gap-3', className)}>
      <span className="seal mt-0.5">{seal}</span>
      <div className="min-w-0">
        <h2 className={cn('font-serif text-lg font-bold leading-snug md:text-xl', dark ? 'text-[#F7EAD0]' : 'text-ink')}>
          {title}
        </h2>
        {sub && <p className={cn('mt-0.5 text-xs md:text-[13px]', dark ? 'text-[#E7CFA8]/80' : 'text-faint')}>{sub}</p>}
      </div>
      {right && <div className="ml-auto flex-none">{right}</div>}
    </div>
  )
}
