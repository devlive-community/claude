import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { rand } from '../lib/utils'

/** 一朵梅花 */
function Blossom({ x, y, s = 1, o = 1 }: { x: number; y: number; s?: number; o?: number }) {
  const petals = [0, 72, 144, 216, 288].map((a) => {
    const rad = (a * Math.PI) / 180
    return { cx: Math.cos(rad) * 5.2, cy: Math.sin(rad) * 5.2 }
  })
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {petals.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="4.6" fill="#F0B7C5" />
      ))}
      <circle r="2.1" fill="#E39CB1" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180
        return <circle key={a} cx={Math.cos(rad) * 2.6} cy={Math.sin(rad) * 2.6} r="0.7" fill="#D4A24C" />
      })}
    </g>
  )
}

/** 左上角梅花枝 */
function PlumBranch() {
  return (
    <svg viewBox="0 0 300 190" className="pointer-events-none absolute -left-2 -top-2 w-40 md:w-64 opacity-90" aria-hidden>
      <g fill="none" stroke="#6B4A33" strokeLinecap="round" opacity="0.85">
        <path d="M-12 14 C 70 24, 140 44, 226 108" strokeWidth="8" />
        <path d="M104 40 C 130 30, 162 12, 190 4" strokeWidth="4.5" />
        <path d="M164 66 C 186 68, 212 58, 234 44" strokeWidth="3.5" />
        <path d="M64 24 C 82 42, 92 64, 96 92" strokeWidth="3" />
        <path d="M226 108 C 238 118, 244 128, 246 140" strokeWidth="2.5" />
      </g>
      <Blossom x={190} y={6} s={1.05} />
      <Blossom x={234} y={44} s={0.9} />
      <Blossom x={246} y={140} s={0.85} o={0.92} />
      <Blossom x={96} y={92} s={0.95} o={0.95} />
      <Blossom x={148} y={34} s={0.7} o={0.85} />
      <Blossom x={206} y={78} s={0.75} o={0.9} />
      <Blossom x={64} y={24} s={0.65} o={0.85} />
    </svg>
  )
}

/** 右上角飞檐与红灯笼 */
function EaveLanterns() {
  return (
    <div className="pointer-events-none absolute -right-1 -top-1 flex items-start gap-3 pr-2 md:gap-5 md:pr-4" aria-hidden>
      <svg viewBox="0 0 120 74" className="hidden h-16 w-auto opacity-70 md:block" style={{ transform: 'scaleX(-1)' }}>
        <path d="M8 30 Q 44 8 112 14 Q 70 22 40 34 Q 22 42 8 56 Z" fill="#5C4231" opacity="0.55" />
        <path d="M18 52 Q 48 36 104 40 Q 66 48 40 58 Q 28 62 18 70 Z" fill="#5C4231" opacity="0.4" />
      </svg>
      {[{ s: 58, d: '0s' }, { s: 40, d: '0.7s' }].map((l, i) => (
        <div key={i} className="anim-sway" style={{ animationDelay: l.d }}>
          <svg viewBox="0 0 44 92" style={{ width: l.s, height: (l.s * 92) / 44 }}>
            <line x1="22" y1="0" x2="22" y2="14" stroke="#8F6520" strokeWidth="2" />
            <rect x="12" y="14" width="20" height="5" rx="2" fill="#D4A24C" />
            <ellipse cx="22" cy="42" rx="17" ry="21" fill="#C62828" stroke="#8E1B1B" strokeWidth="1.4" />
            <path d="M13 30 Q 22 26 31 30 M11 42 Q 22 38 33 42 M13 54 Q 22 50 31 54" fill="none" stroke="#8E1B1B" strokeWidth="1.2" opacity="0.65" />
            <rect x="12" y="63" width="20" height="5" rx="2" fill="#D4A24C" />
            <line x1="22" y1="68" x2="22" y2="80" stroke="#D4A24C" strokeWidth="1.6" />
            <circle cx="22" cy="83" r="3" fill="#D4A24C" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/** 飘落的梅花瓣 */
function PetalFall() {
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: rand(2, 96),
        size: rand(10, 18),
        delay: rand(0, 14),
        duration: rand(11, 19),
        sway: rand(24, 60),
        opacity: rand(0.35, 0.75),
        rotateFrom: rand(-120, 120),
      })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-[3] overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%`, top: -30, opacity: p.opacity }}
          initial={{ y: -40, rotate: p.rotateFrom }}
          animate={{ y: ['0vh', '108vh'], x: [0, p.sway, -p.sway / 2, p.sway / 3, 0], rotate: [p.rotateFrom, p.rotateFrom + 200] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear', x: { duration: p.duration / 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 16 16">
            <path d="M8 1 C 12 3, 14.5 7, 12.5 11 C 11 14, 5 14, 3.5 11 C 1.5 7, 4 3, 8 1 Z" fill="#F0B7C5" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

/** 缓慢漂移的祥云 */
function DriftingClouds() {
  const clouds = useMemo(
    () => [
      { top: '9%', scale: 1, duration: 130, delay: 0, opacity: 0.5 },
      { top: '30%', scale: 0.6, duration: 170, delay: 30, opacity: 0.35 },
      { top: '58%', scale: 0.8, duration: 150, delay: 70, opacity: 0.3 },
    ],
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden>
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, opacity: c.opacity }}
          initial={{ x: '-20vw' }}
          animate={{ x: '115vw' }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'linear' }}
        >
          <svg width={150 * c.scale} height={60 * c.scale} viewBox="0 0 150 60">
            <g fill="none" stroke="#C9A86A" strokeWidth="2.4" strokeLinecap="round">
              <path d="M14 42 C 2 42, 2 26, 16 26 C 16 12, 38 10, 44 20 C 52 8, 74 10, 76 24 C 90 20, 98 32, 90 42 Z" />
              <path d="M36 42 C 36 36, 46 34, 50 38 M58 42 C 58 36, 68 34, 72 38" opacity="0.7" />
            </g>
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

/** 全站国风背景层 */
export default function InkBackground() {
  return (
    <>
      {/* 水墨山水底图 */}
      <div className="fixed inset-0 z-0" aria-hidden>
        <img src="/img/bg-ink.jpg" alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,248,236,0.72) 0%, rgba(255,248,236,0.55) 40%, rgba(255,248,236,0.66) 100%)',
          }}
        />
      </div>
      <DriftingClouds />
      <PetalFall />
      {/* 顶部装饰 */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[3] hidden lg:block">
        <PlumBranch />
        <EaveLanterns />
      </div>
    </>
  )
}

/** 页面底部山水画卷 */
export function InkScrollFooter() {
  return (
    <div
      className="relative h-36 w-full overflow-hidden md:h-44"
      style={{
        WebkitMaskImage: 'linear-gradient(180deg, transparent, black 35%, black 75%, transparent)',
        maskImage: 'linear-gradient(180deg, transparent, black 35%, black 75%, transparent)',
      }}
      aria-hidden
    >
      <img src="/img/scroll-bottom.jpg" alt="" className="h-full w-full object-cover opacity-80" />
    </div>
  )
}
