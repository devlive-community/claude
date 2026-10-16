import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Vibrate } from 'lucide-react'
import Modal from '../ui/Modal'
import { ClaudeMark, CoinIcon } from '../icons'
import { MAX_SHAKES_PER_DAY, useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { centerOf, rand } from '../../lib/utils'

const SCATTER = [
  { top: '8%', left: '6%', size: 18, delay: '0s' },
  { top: '18%', left: '82%', size: 22, delay: '0.8s' },
  { top: '64%', left: '4%', size: 24, delay: '1.4s' },
  { top: '76%', left: '88%', size: 16, delay: '0.4s' },
  { top: '42%', left: '12%', size: 14, delay: '2s' },
  { top: '46%', left: '90%', size: 20, delay: '1.1s' },
]

export default function ShakeCard() {
  const shakeUsed = useUserStore((s) => s.daily.shakeUsed)
  const shakeOnce = useUserStore((s) => s.shakeOnce)
  const pushToast = useUIStore((s) => s.pushToast)
  const flyCoins = useUIStore((s) => s.flyCoins)

  const [shaking, setShaking] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [motionReady, setMotionReady] = useState(false)
  const lastShakeRef = useRef(0)
  const shakingRef = useRef(false)

  const left = MAX_SHAKES_PER_DAY - shakeUsed

  const doShake = () => {
    if (shakingRef.current) return
    if (left <= 0) {
      pushToast({ type: 'warn', title: '今天 3 次机会用完啦', desc: '明天再来摇，先去做任务赚金币吧' })
      return
    }
    shakingRef.current = true
    setShaking(true)
    setBurstKey((k) => k + 1)
    window.setTimeout(() => {
      const v = shakeOnce()
      shakingRef.current = false
      setShaking(false)
      if (v <= 0) return
      setReward(v)
      pushToast({ type: 'coin', title: `摇一摇获得 ${v} 金币！`, desc: '奖励已自动加入账户' })
      flyCoins(centerOf(document.getElementById('shake')) ?? { x: 300, y: 400 }, 7)
    }, 2000)
  }

  /** 移动端 DeviceMotion：需要用户授权（iOS 13+） */
  const setupMotion = async () => {
    if (motionReady) return
    const DME = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } })
      .DeviceMotionEvent
    if (!DME) return
    try {
      if (typeof DME.requestPermission === 'function') {
        const res = await DME.requestPermission()
        if (res !== 'granted') return
      }
      window.addEventListener('devicemotion', onMotion)
      setMotionReady(true)
    } catch {
      /* 用户拒绝或设备不支持，仍可点击按钮摇一摇 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  const onMotion = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity
    if (!a) return
    const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2)
    const now = Date.now()
    if (mag > 30 && now - lastShakeRef.current > 3500) {
      lastShakeRef.current = now
      doShake()
    }
  }

  useEffect(() => {
    return () => window.removeEventListener('devicemotion', onMotion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="shake" className="promo-bg relative flex flex-col overflow-hidden rounded-2xl border border-cred-deep/40 p-5 shadow-red">
      {/* 金币散落装饰 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {SCATTER.map((c, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{ top: c.top, left: c.left, opacity: 0.75 }}
            animate={{ y: [0, -10, 0], rotate: [0, 14, -8, 0] }}
            transition={{ duration: 4.5, delay: parseFloat(c.delay), repeat: Infinity, ease: 'easeInOut' }}
          >
            <CoinIcon size={c.size} />
          </motion.span>
        ))}
        <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/8" />
        <span className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10" />
      </div>

      <div className="relative">
        <h2 className="font-serif text-lg font-bold text-[#FFF8EC]">摇一摇 · 随机领金币</h2>
        <p className="mt-0.5 text-[11px] text-[#F7D9A8]/90">
          每天 3 次机会，摇出惊喜奖励！今日剩余 <span className="font-bold text-white">{left}</span> 次
        </p>
      </div>

      {/* 手机插画 */}
      <div className="relative flex flex-1 items-center justify-center py-5">
        <motion.div
          animate={shaking ? { rotate: [0, -16, 15, -11, 8, -5, 0], x: [0, -9, 9, -7, 5, -2, 0] } : { rotate: 0, x: 0 }}
          transition={{ duration: shaking ? 1.9 : 0.3, ease: 'easeInOut' }}
          className="relative"
        >
          {/* 爆发金币 */}
          {burstKey > 0 && (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.span
                  key={`${burstKey}-${i}`}
                  className="absolute left-1/2 top-1/2"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                  animate={{
                    x: Math.cos((i / 10) * Math.PI * 2) * rand(60, 95),
                    y: Math.sin((i / 10) * Math.PI * 2) * rand(70, 110),
                    opacity: [1, 1, 0],
                    scale: [0.5, 1.1, 0.6],
                  }}
                  transition={{ duration: 1.4, delay: (i % 5) * 0.08, ease: 'easeOut' }}
                >
                  <CoinIcon size={rand(13, 20)} />
                </motion.span>
              ))}
            </div>
          )}
          <div className="flex h-44 w-24 flex-col items-center justify-center rounded-[1.4rem] border-4 border-white/35 bg-white/12 shadow-lift backdrop-blur-sm">
            <span className="text-brand drop-shadow">
              <ClaudeMark size={34} />
            </span>
            <span className="mt-2 font-brush text-lg text-white">摇一摇</span>
            <CoinIcon size={20} className="mt-1.5 opacity-90" />
          </div>
          <span className="absolute -bottom-2 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-black/25 blur-[2px]" />
        </motion.div>
      </div>

      <button
        onClick={() => {
          setupMotion()
          doShake()
        }}
        disabled={shaking || left <= 0}
        className="btn btn-gold btn-lg relative w-full"
      >
        {shaking ? (
          <>
            <Vibrate size={16} className="animate-pulse" /> 摇晃中……
          </>
        ) : left <= 0 ? (
          '今日机会已用完'
        ) : (
          <>
            <Smartphone size={16} /> 摇一摇
          </>
        )}
      </button>
      <p className="relative mt-2 text-center text-[10px] text-[#F7D9A8]/80">
        手机端可摇动真机触发（需授权体感），桌面端点击按钮即可
      </p>

      {/* 结果弹窗 */}
      <Modal open={reward !== null} onClose={() => setReward(null)} width="max-w-xs">
        <div className="py-2 text-center">
          <motion.div
            animate={{ scale: [0.6, 1.15, 1], rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.7 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F2CF8D] to-[#C08F36] shadow-gold"
          >
            <CoinIcon size={34} />
          </motion.div>
          <h3 className="mt-3 font-serif text-xl font-bold text-ink">恭喜客官！</h3>
          <p className="mt-1 text-sm text-body">
            摇出 <span className="font-serif text-2xl font-black text-cred">{reward}</span> 金币！
          </p>
          <p className="mt-1 text-xs text-faint">奖励已自动加入账户余额</p>
          <button onClick={() => setReward(null)} className="btn btn-gold btn-lg mt-4 w-full">
            开心收下
          </button>
        </div>
      </Modal>
    </section>
  )
}
