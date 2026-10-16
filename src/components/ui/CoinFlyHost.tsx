import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useUIStore, type CoinFlight } from '../../store/useUIStore'
import { centerOf } from '../../lib/utils'
import { CoinIcon } from '../icons'

function Flight({ flight }: { flight: CoinFlight }) {
  const removeFlight = useUIStore((s) => s.removeFlight)
  const target = useMemo(
    () => centerOf(document.getElementById('nav-coin')) ?? { x: window.innerWidth - 56, y: 28 },
    [],
  )
  useEffect(() => {
    const t = setTimeout(() => removeFlight(flight.id), flight.count * 70 + 1000)
    return () => clearTimeout(t)
  }, [flight, removeFlight])

  return (
    <>
      {Array.from({ length: flight.count }).map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none fixed left-0 top-0 z-[99]"
          initial={{ x: flight.from.x, y: flight.from.y, scale: 1, opacity: 1 }}
          animate={{
            x: [flight.from.x, (flight.from.x + target.x) / 2 + (i - flight.count / 2) * 14, target.x],
            y: [flight.from.y, Math.min(flight.from.y, target.y) - 80 - i * 8, target.y],
            scale: [1, 1.15, 0.45],
            opacity: [1, 1, 0.85],
          }}
          transition={{ duration: 0.85, delay: i * 0.07, ease: 'easeInOut' }}
        >
          <span className="drop-shadow-[0_2px_4px_rgba(143,101,32,0.4)]">
            <CoinIcon size={17} />
          </span>
        </motion.div>
      ))}
    </>
  )
}

/** 金币飞入右上角账户余额动画 */
export default function CoinFlyHost() {
  const flights = useUIStore((s) => s.flights)
  return (
    <div className="pointer-events-none" aria-hidden>
      {flights.map((f) => (
        <Flight key={f.id} flight={f} />
      ))}
    </div>
  )
}
