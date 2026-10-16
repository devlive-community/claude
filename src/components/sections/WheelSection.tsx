import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Gift, History, MessageCircleMore, Sparkles } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Modal from '../ui/Modal'
import { CoinIcon } from '../icons'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { centerOf, weightedPick } from '../../lib/utils'

type PrizeType = 'coins' | 'chats' | 'member' | 'none'

interface Prize {
  label: string
  sub: string
  type: PrizeType
  value: number
  weight: number
}

const PRIZES: Prize[] = [
  { label: '5 金币', sub: '', type: 'coins', value: 5, weight: 16 },
  { label: '10 次对话', sub: '', type: 'chats', value: 10, weight: 6 },
  { label: '20 金币', sub: '', type: 'coins', value: 20, weight: 12 },
  { label: '5 次对话', sub: '', type: 'chats', value: 5, weight: 10 },
  { label: '10 金币', sub: '', type: 'coins', value: 10, weight: 16 },
  { label: '1 天会员', sub: '', type: 'member', value: 1, weight: 5 },
  { label: '谢谢参与', sub: '', type: 'none', value: 0, weight: 27 },
  { label: '50 金币', sub: '', type: 'coins', value: 50, weight: 8 },
]

const SEG = 360 / PRIZES.length

export default function WheelSection() {
  const spinUsed = useUserStore((s) => s.daily.spinUsed)
  const useSpin = useUserStore((s) => s.useSpin)
  const addCoins = useUserStore((s) => s.addCoins)
  const grantChats = useUserStore((s) => s.grantChats)
  const grantMember = useUserStore((s) => s.grantMember)
  const pushToast = useUIStore((s) => s.pushToast)
  const flyCoins = useUIStore((s) => s.flyCoins)

  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Prize | null>(null)
  const [records, setRecords] = useState<{ label: string; ts: number }[]>([])

  const canSpin = !spinning && spinUsed < 1

  const spin = () => {
    if (!canSpin) {
      if (spinUsed >= 1) pushToast({ type: 'warn', title: '今日免费抽奖已用完', desc: '每天一次，明天再来' })
      return
    }
    const prize = weightedPick(PRIZES)
    const k = PRIZES.indexOf(prize)
    const targetMod = (360 - (k * SEG + SEG / 2) + 360) % 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = ((targetMod - currentMod) % 360 + 360) % 360 + 360 * 5
    setRotation((r) => r + delta)
    setSpinning(true)
    useSpin()

    window.setTimeout(() => {
      setSpinning(false)
      setResult(prize)
      setRecords((rs) => [{ label: prize.label, ts: Date.now() }, ...rs].slice(0, 5))
      if (prize.type === 'coins') {
        addCoins(prize.value)
        pushToast({ type: 'coin', title: `转盘中奖：${prize.label}！`, desc: '金币已到账' })
        flyCoins(centerOf(document.getElementById('wheel')) ?? { x: 400, y: 300 }, 8)
      } else if (prize.type === 'chats') {
        grantChats(prize.value)
        pushToast({ type: 'success', title: `转盘中奖：${prize.value} 次 AI 对话！`, desc: '额度已到账' })
      } else if (prize.type === 'member') {
        grantMember(1)
        pushToast({ type: 'success', title: '转盘中奖：1 天尊享会员！', desc: '模拟会员即刻生效' })
      } else {
        pushToast({ type: 'info', title: '谢谢参与', desc: '客官常来，明天再战！' })
      }
    }, 3200)
  }

  const wheelColors = ['#C62828', '#E8B04B']

  return (
    <section id="wheel" className="card p-5 md:p-6">
      <SectionHeader
        seal="抽"
        title="幸运大转盘 · 每天一次免费抽奖"
        sub="转动转盘，赢取金币、对话次数或会员体验！"
        right={
          <span className="rounded-full border border-cred/40 bg-cred-soft px-3 py-1.5 text-xs font-bold text-cred">
            {spinUsed >= 1 ? '今日已抽' : '今日可抽 1 次'}
          </span>
        }
      />

      <div className="grid items-center gap-6 lg:grid-cols-[340px_1fr]">
        {/* 转盘 */}
        <div className="relative mx-auto h-[300px] w-[300px] md:h-[340px] md:w-[340px]">
          {/* 固定指针 */}
          <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
            <motion.div
              animate={spinning ? { rotate: [0, -14, 10, -6, 0] } : {}}
              transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
              className="h-0 w-0 border-x-[11px] border-t-[22px] border-x-transparent border-t-[#B91C1C] drop-shadow-md"
              style={{ filter: 'drop-shadow(0 2px 3px rgba(143,101,32,.5))' }}
            />
          </div>
          {/* 外圈灯泡 */}
          {Array.from({ length: 16 }).map((_, i) => {
            const deg = (i * 360) / 16
            return (
              <span
                key={i}
                className={`absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${i % 2 ? 'bg-[#F5D98B]' : 'bg-white'} ${i % 2 ? '' : 'anim-blink'}`}
                style={{
                  transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(calc(-150px - 0px))`,
                  animationDelay: `${(i % 4) * 0.35}s`,
                }}
              />
            )
          })}
          <div className="absolute inset-2 rounded-full border-[6px] border-[#D4A24C] shadow-lift" style={{ background: '#8E1B1B' }}>
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                background: `conic-gradient(${PRIZES.map((_, i) => `${wheelColors[i % 2]} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(', ')})`,
              }}
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: [0.12, 0.8, 0.18, 1] }}
            >
              {PRIZES.map((p, i) => (
                <div
                  key={p.label}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${i * SEG + SEG / 2}deg) translateY(-104px) rotate(${-(i * SEG + SEG / 2)}deg)` }}
                >
                  <div
                    className={`flex flex-col items-center ${
                      i % 2 === 0 ? 'text-white' : 'text-[#5b3a10]'
                    }`}
                  >
                    <span className="text-[13px] font-bold leading-tight">{p.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
            {/* 中央按钮 */}
            <button
              onClick={spin}
              disabled={!canSpin}
              className={`absolute left-1/2 top-1/2 z-10 flex h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-[#FFF4E5] shadow-lift transition ${
                canSpin
                  ? 'bg-gradient-to-br from-[#F04438] to-[#B91C1C] hover:scale-105 active:scale-95'
                  : 'bg-gradient-to-br from-[#9a8a72] to-[#6B5A46]'
              }`}
            >
              <span className="font-serif text-[15px] font-bold leading-tight text-white">
                {spinUsed >= 1 ? '明日' : '立即'}
              </span>
              <span className="font-serif text-[15px] font-bold leading-tight text-white">
                {spinUsed >= 1 ? '再来' : '抽奖'}
              </span>
            </button>
          </div>
          <div className="absolute inset-6 rounded-full" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.25)' }} />
        </div>

        {/* 说明与记录 */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/40 bg-gold-soft/50 p-4">
            <h3 className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
              <Sparkles size={15} className="text-gold-deep" /> 活动说明（模拟）
            </h3>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-body">
              <li>· 每位客官每天 1 次免费抽奖机会，0 点刷新</li>
              <li>· 奖品：金币、AI 对话次数、1 天尊享会员（模拟权益）</li>
              <li>· 「谢谢参与」概率极高，这很中国特色，请理性抽奖</li>
              <li>· 中奖奖励自动发放，可在金币商城消费</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-white/60 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <History size={15} className="text-gold-deep" /> 本次抽奖记录
            </h3>
            {records.length === 0 ? (
              <p className="mt-2 text-xs text-faint">还没有抽过，说不定下一发就是 50 金币！</p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {records.map((r, i) => (
                  <div key={`${r.ts}-${i}`} className="flex items-center gap-2 text-xs">
                    <span className="text-faint">{new Date(r.ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className={r.label === '谢谢参与' ? 'text-faint' : 'font-bold text-cred'}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-faint">
            <span className="flex items-center gap-1">
              <CoinIcon size={13} /> 金币可去商城兑换
            </span>
            <span className="flex items-center gap-1">
              <MessageCircleMore size={13} className="text-brand" /> 对话次数自动累加
            </span>
            <span className="flex items-center gap-1">
              <Crown size={13} className="text-gold" /> 会员为模拟状态
            </span>
          </div>
        </div>
      </div>

      {/* 中奖结果弹窗 */}
      <Modal open={!!result} onClose={() => setResult(null)} width="max-w-xs">
        {result && (
          <div className="py-2 text-center">
            <motion.div
              animate={{ scale: [0.6, 1.15, 1], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 0.7 }}
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-gold ${
                result.type === 'none' ? 'bg-gradient-to-br from-[#B8A78F] to-[#8a7663]' : 'bg-gradient-to-br from-[#F2CF8D] to-[#C08F36]'
              }`}
            >
              {result.type === 'none' ? (
                <Gift size={30} className="text-white" />
              ) : result.type === 'coins' ? (
                <CoinIcon size={34} />
              ) : result.type === 'chats' ? (
                <MessageCircleMore size={30} className="text-white" />
              ) : (
                <Crown size={30} className="text-[#5b3a10]" />
              )}
            </motion.div>
            <h3 className="mt-3 font-serif text-xl font-bold text-ink">
              {result.type === 'none' ? '谢谢参与' : '恭喜中奖！'}
            </h3>
            <p className="mt-1 text-sm text-body">
              {result.type === 'none' ? (
                '就差一点点，客官明天再战！'
              ) : (
                <>
                  获得 <span className="font-serif text-xl font-black text-cred">{result.label}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-faint">
              {result.type === 'none' ? '本转盘为模拟功能，未消耗任何真实运气（划掉）' : '奖励已自动发放到账'}
            </p>
            <button onClick={() => setResult(null)} className="btn btn-gold btn-lg mt-4 w-full">
              {result.type === 'none' ? '知道了' : '开心收下'}
            </button>
          </div>
        )}
      </Modal>
    </section>
  )
}
