import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Brush, Download, ImageIcon, Loader2, Sparkles } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useUserStore } from '../store/useUserStore'
import { useUIStore } from '../store/useUIStore'
import { cn } from '../lib/utils'

const STYLES = [
  { key: 'ink', label: '水墨山水', img: '/img/bg-ink.jpg' },
  { key: 'green', label: '青绿江南', img: '/img/scroll-bottom.jpg' },
  { key: 'bird', label: '工笔花鸟', img: '/img/paint-flower.jpg' },
  { key: 'cyber', label: '赛博国潮', img: '/img/paint-cyber.jpg' },
]

const STEPS = ['正在研墨……', '勾勒轮廓……', '铺设底色……', '点染上色……', '题字钤印……']

interface Artwork {
  id: number
  prompt: string
  style: string
  img: string
}

let aid = 0

/** AI 绘画页（模拟生成） */
export default function PaintPage() {
  const setTaskDone = useUserStore((s) => s.setTaskDone)
  const pushToast = useUIStore((s) => s.pushToast)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState(STYLES[0])
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<Artwork | null>(null)
  const [history, setHistory] = useState<Artwork[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearInterval(t)), [])

  const generate = () => {
    if (busy) return
    if (!prompt.trim()) {
      pushToast({ type: 'warn', title: '请先描述您想画的画面' })
      return
    }
    setBusy(true)
    setStep(0)
    setTaskDone('paint')
    const iv = window.setInterval(() => {
      setStep((v) => {
        if (v >= STEPS.length - 1) {
          window.clearInterval(iv)
          return v
        }
        return v + 1
      })
    }, 620)
    timers.current.push(iv)
    window.setTimeout(() => {
      window.clearInterval(iv)
      const art: Artwork = { id: ++aid, prompt: prompt.trim(), style: style.label, img: style.img }
      setResult(art)
      setHistory((h) => [art, ...h].slice(0, 8))
      setBusy(false)
      pushToast({ type: 'success', title: '画作完成！', desc: '任务「体验 AI 绘画」已完成，回任务中心领金币' })
    }, STEPS.length * 620 + 400)
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-5 md:px-6 md:pt-7">
      <PageHeader
        seal="绘"
        title="AI 绘画"
        sub="一句话生成国风画作（模拟演示：作品从预置图库中匹配）"
        right={
          <span className="rounded-full border border-gold/50 bg-gold-soft px-3.5 py-1.5 text-xs font-bold text-gold-deep">
            每日任务 +15 金币
          </span>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px] lg:gap-[18px]">
        {/* 画布 */}
        <section className="card overflow-hidden p-4 md:p-5">
          <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-line bg-[#FFFBF2] md:min-h-[460px]">
            <AnimatePresence mode="wait">
              {busy ? (
                <motion.div
                  key="busy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 p-8 text-center"
                >
                  <span className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-dashed border-gold/60" style={{ animation: 'spin-slow 6s linear infinite' }} />
                    <Brush size={26} className="text-gold-deep" />
                  </span>
                  <p className="font-serif text-sm text-body">{STEPS[step]}</p>
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-[#F0E4CE]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#F2CF8D] to-[#C08F36]"
                      animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key={result.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                  <img src={result.img} alt={result.prompt} className="max-h-[460px] w-full object-cover" />
                  <div className="flex items-center gap-2 border-t border-line bg-white/70 px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-xs text-faint">「{result.prompt}」· {result.style} · 模拟生成</span>
                    <button
                      onClick={() => pushToast({ type: 'info', title: '下载为模拟功能', desc: '演示站点不提供真实下载' })}
                      className="btn btn-ghost btn-sm"
                    >
                      <Download size={13} /> 下载
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 p-8 text-center">
                  <ImageIcon size={34} className="text-line" />
                  <p className="mt-1 font-serif text-sm text-faint">画布已备好，就等您一句话</p>
                  <p className="text-xs text-faint/70">试试：「烟雨江南，小桥流水，一叶扁舟」</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* 历史作品 */}
          {history.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {history.map((h) => (
                <button key={h.id} onClick={() => setResult(h)} className="flex-none">
                  <img
                    src={h.img}
                    alt={h.prompt}
                    className={cn(
                      'h-16 w-16 rounded-lg border-2 object-cover transition',
                      result?.id === h.id ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100',
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 控制台 */}
        <section className="card p-5">
          <label className="mb-1.5 block text-xs font-medium text-faint">画面描述</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="描述您想生成的画面，例如：烟雨江南，小桥流水，一叶扁舟……"
            className="nice-scroll block w-full resize-none rounded-xl border border-line bg-white/80 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint/60 focus:border-brand"
          />
          <label className="mb-1.5 mt-4 block text-xs font-medium text-faint">画风</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((st) => (
              <button
                key={st.key}
                onClick={() => setStyle(st)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl border p-2 text-left transition',
                  style.key === st.key ? 'border-gold bg-gold-soft/40 shadow-gold' : 'border-line bg-white/60 hover:border-gold/60',
                )}
              >
                <img src={st.img} alt="" className="h-10 w-10 flex-none rounded-lg object-cover" />
                <span className="text-xs font-bold text-ink">{st.label}</span>
                {style.key === st.key && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-deep text-[9px] text-white">✓</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={busy} className="btn btn-red btn-lg mt-4 w-full">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {busy ? '生成中……' : '立即生成'}
          </button>
          <p className="mt-2 text-center text-[10px] text-faint">
            模拟功能：作品从预置国风图库匹配，不调用真实绘图服务；完成后可回任务中心领取金币
          </p>
        </section>
      </div>
    </div>
  )
}
