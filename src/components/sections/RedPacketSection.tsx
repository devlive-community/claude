import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, PartyPopper, Timer, X } from 'lucide-react'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { cn, rand, weightedPick } from '../../lib/utils'
import { CoinIcon } from '../icons'

const RAIN_DURATION = 15
const PICKS = [
  { v: 1, weight: 30 },
  { v: 5, weight: 30 },
  { v: 10, weight: 22 },
  { v: 20, weight: 8 },
  { v: 0, weight: 10 }, // 谢谢参与
]

interface Packet {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  value: number
  opened: boolean
  gone: boolean
}

let pid = 0

/** 全屏红包雨 */
function RainOverlay({ onClose }: { onClose: () => void }) {
  const markPlayed = useUserStore((s) => s.markRedPacketPlayed)
  const pushToast = useUIStore((s) => s.pushToast)
  const [packets, setPackets] = useState<Packet[]>([])
  const [sum, setSum] = useState(0)
  const [count, setCount] = useState(0)
  const [left, setLeft] = useState(RAIN_DURATION)
  const [finished, setFinished] = useState(false)
  const finishedRef = useRef(false)
  const popRef = useRef({ x: 0, y: 0, text: '', key: 0 })
  const [pops, setPops] = useState<{ key: number; x: number; y: number; text: string }[]>([])

  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinished(true)
    setPackets([])
    if (sum > 0) {
      markPlayed(sum)
      pushToast({ type: 'coin', title: `红包雨结束！共获得 ${sum} 金币`, desc: '金币已自动到账' })
    }
  }

  useEffect(() => {
    const spawn = window.setInterval(() => {
      setPackets((ps) => {
        if (ps.length > 34) return ps
        const pick = weightedPick(PICKS)
        return [
          ...ps,
          {
            id: ++pid,
            x: rand(3, 88),
            size: rand(52, 74),
            duration: rand(2.4, 3.8),
            delay: 0,
            value: pick.v,
            opened: false,
            gone: false,
          },
        ]
      })
    }, 300)
    const timer = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          window.clearInterval(timer)
          finish()
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => {
      window.clearInterval(spawn)
      window.clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 点击红包：打开并计入 */
  const openPacket = (p: Packet, e: React.MouseEvent) => {
    if (p.opened || finishedRef.current) return
    setPackets((ps) => ps.map((x) => (x.id === p.id ? { ...x, opened: true } : x)))
    if (p.value > 0) {
      setSum((s) => s + p.value)
      setCount((c) => c + 1)
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const key = ++popRef.current.key
    setPops((old) => [
      ...old,
      { key, x: rect.left + rect.width / 2, y: rect.top, text: p.value > 0 ? `+${p.value} 金币` : '谢谢参与' },
    ])
    window.setTimeout(() => setPops((old) => old.filter((o) => o.key !== key)), 900)
    window.setTimeout(() => setPackets((ps) => ps.filter((x) => x.id !== p.id)), 550)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'radial-gradient(120% 100% at 50% 0%, rgba(142,27,27,0.88), rgba(46,10,10,0.94))' }}
    >
      {/* 顶部状态栏 */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/50 to-transparent px-4 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 backdrop-blur">
          <Gift size={15} className="text-[#F5D98B]" />
          <span className="text-sm font-bold text-white tabular-nums">已抢 {sum} 金币</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-bold text-[#F5D98B] tabular-nums backdrop-blur">
            <Timer size={14} /> {String(left).padStart(2, '0')}s
          </span>
          <button
            onClick={finish}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white/85 backdrop-blur transition hover:bg-black/55"
            aria-label="结束红包雨"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <p className="absolute inset-x-0 top-16 z-10 text-center font-brush text-xl text-white/85">
        点击屏幕，让红包飞一会儿！
      </p>

      {/* 红包 */}
      <AnimatePresence>
        {packets.map((p) => (
          <motion.button
            key={p.id}
            className="absolute z-10"
            style={{ left: `${p.x}%`, top: 0 }}
            initial={{ y: -90 }}
            animate={p.opened ? { scale: [1, 1.35, 1.15], rotate: [0, -8, 8, 0], opacity: 0 } : { y: '105vh' }}
            transition={
              p.opened
                ? { duration: 0.5 }
                : { duration: p.duration, ease: 'linear' }
            }
            onAnimationComplete={() => {
              if (!p.opened) setPackets((ps) => ps.filter((x) => x.id !== p.id))
            }}
            onClick={(e) => openPacket(p, e)}
          >
            <span
              className="relative flex items-center justify-center rounded-xl border-2 border-[#F5D98B]/70 shadow-lift"
              style={{
                width: p.size,
                height: p.size * 1.35,
                background: 'linear-gradient(160deg, #E04338 0%, #C62828 55%, #8E1B1B 100%)',
              }}
            >
              {/* 顶部封盖 */}
              <span
                className="absolute inset-x-0 top-0 rounded-t-[10px] border-b-2 border-[#F5D98B]/80"
                style={{ height: '34%', background: 'linear-gradient(180deg, #F04438, #C62828)' }}
              />
              <span
                className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#F5D98B] to-[#D4A24C] font-serif font-bold text-[#8E1B1B]"
                style={{ width: p.size * 0.5, height: p.size * 0.5, fontSize: p.size * 0.26 }}
              >
                福
              </span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* 点击金额飘字 */}
      {pops.map((o) => (
        <motion.span
          key={o.key}
          className={cn(
            'pointer-events-none fixed z-30 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-bold shadow-lift',
            o.text === '谢谢参与' ? 'bg-white/25 text-white' : 'bg-gradient-to-br from-[#F5D98B] to-[#D4A24C] text-[#5b3a10]',
          )}
          style={{ left: o.x, top: o.y }}
          initial={{ opacity: 0, y: 0, scale: 0.7 }}
          animate={{ opacity: [0, 1, 1, 0], y: -70, scale: 1 }}
          transition={{ duration: 0.9 }}
        >
          {o.text}
        </motion.span>
      ))}

      {/* 结算弹窗 */}
      <AnimatePresence>
        {finished && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="card w-full max-w-xs p-6 text-center"
              style={{ background: '#FFFBF2' }}
              initial={{ scale: 0.85, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.8 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F04438] to-[#B91C1C] shadow-red"
              >
                <PartyPopper size={30} className="text-white" />
              </motion.div>
              <h3 className="mt-3 font-serif text-xl font-bold text-ink">红包雨结束！</h3>
              <p className="mt-1.5 text-sm text-body">
                本次共抢到{' '}
                <span className="font-serif text-2xl font-black text-cred tabular-nums">{sum}</span> 金币
                {count > 0 && <span className="text-xs text-faint">（{count} 个红包）</span>}
              </p>
              <p className="mt-1 text-xs text-faint">
                {sum === 0 ? '手气有点背，明天红包雨再来！' : '金币已自动到账，快去商城看看！'}
              </p>
              <button onClick={onClose} className="btn btn-red btn-lg mt-4 w-full">
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** 红包雨活动卡片 */
export default function RedPacketSection() {
  const played = useUserStore((s) => s.daily.redPacketPlayed)
  const best = useUserStore((s) => s.redPacketBest)
  const [raining, setRaining] = useState(false)

  /** 模拟活动倒计时：从 02:15:30 循环倒数 */
  const [remain, setRemain] = useState(2 * 3600 + 15 * 60 + 30)
  useEffect(() => {
    const t = window.setInterval(() => {
      setRemain((v) => (v <= 1 ? 2 * 3600 + 15 * 60 + 30 : v - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [])
  const hh = String(Math.floor(remain / 3600)).padStart(2, '0')
  const mm = String(Math.floor((remain % 3600) / 60)).padStart(2, '0')
  const ss = String(remain % 60).padStart(2, '0')

  return (
    <section
      id="redpacket"
      className="promo-bg relative flex h-full flex-col overflow-hidden rounded-2xl border border-cred-deep/40 p-5 shadow-red"
    >
      {/* 飘落红包装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[
          { left: '12%', delay: '0s', dur: '5.5s', size: 26 },
          { left: '78%', delay: '1.2s', dur: '6.5s', size: 20 },
          { left: '46%', delay: '2.4s', dur: '7s', size: 16 },
        ].map((r, i) => (
          <motion.span
            key={i}
            className="absolute flex items-center justify-center rounded-md border border-[#F5D98B]/60 bg-[#C62828] font-serif text-[10px] font-bold text-[#F5D98B]"
            style={{ left: r.left, width: r.size, height: r.size * 1.35, top: -40 }}
            animate={{ y: ['0vh', '115vh'], rotate: [0, 16, -12, 8, 0] }}
            transition={{ duration: parseFloat(r.dur), delay: parseFloat(r.delay), repeat: Infinity, ease: 'linear' }}
          >
            福
          </motion.span>
        ))}
        <span className="absolute -right-12 top-1/4 h-40 w-40 rounded-full bg-white/8" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Gift size={20} className="text-[#F5D98B]" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#FFF8EC]">红包雨 · 限时开启</h2>
            <p className="flex items-center gap-1 text-[11px] text-[#F7D9A8]/90">
              <Timer size={11} /> 剩余时间：
              <span className="font-bold tabular-nums text-white">
                {hh}:{mm}:{ss}
              </span>
            </p>
          </div>
        </div>
        <p className="mt-3 font-brush text-xl leading-relaxed text-[#F7D9A8]">点击屏幕，让红包飞一会儿！</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/70">
          15 秒红包雨，手快有手慢无。红包内含 1 / 5 / 10 / 20 金币，也有一部分是「谢谢参与」——毕竟要有惊喜才叫红包雨。
        </p>
      </div>

      {/* 吉祥物 */}
      <div className="relative flex flex-1 items-end justify-center py-3">
        <motion.img
          src="/img/mascot.jpg"
          alt="招财金币小吉祥物"
          className="h-36 w-36 rounded-2xl border-2 border-[#F5D98B]/70 object-cover shadow-lift md:h-40 md:w-40"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute bottom-2 right-4 rounded-full bg-black/25 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur">
          原创招财吉祥物 · 小金元
        </span>
      </div>

      <div className="relative space-y-2">
        {played && (
          <p className="flex items-center justify-center gap-1.5 rounded-lg bg-black/20 py-1.5 text-[11px] text-[#F7D9A8]">
            <CoinIcon size={13} /> 今日战绩：最佳一场抢到 {best} 金币
          </p>
        )}
        <button
          onClick={() => setRaining(true)}
          disabled={played}
          className={cn('btn btn-lg w-full', played ? 'btn-ghost' : 'btn-gold')}
        >
          {played ? '今日已抢，明天再来' : '点击抢红包'}
        </button>
        <p className="text-center text-[10px] text-white/60">模拟活动 · 不涉及真实资金往来</p>
      </div>

      <AnimatePresence>{raining && <RainOverlay onClose={() => setRaining(false)} />}</AnimatePresence>
    </section>
  )
}
