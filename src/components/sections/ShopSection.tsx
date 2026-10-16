import { motion } from 'framer-motion'
import { Crown, MessageCircleMore, ShoppingBag, Sparkles } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { CoinIcon } from '../icons'

interface Goods {
  name: string
  cost: number
  kind: 'chats' | 'member'
  value: number
  icon: typeof Crown
  hot?: boolean
}

const GOODS: Goods[] = [
  { name: '5 次 AI 对话', cost: 100, kind: 'chats', value: 5, icon: MessageCircleMore },
  { name: '15 次 AI 对话', cost: 200, kind: 'chats', value: 15, icon: MessageCircleMore, hot: true },
  { name: '1 天 Pro 体验', cost: 500, kind: 'member', value: 1, icon: Crown },
  { name: '3 天 Pro 体验', cost: 1000, kind: 'member', value: 3, icon: Crown, hot: true },
  { name: '7 天 Pro 体验', cost: 2000, kind: 'member', value: 7, icon: Crown },
  { name: '30 天 Pro 体验', cost: 5000, kind: 'member', value: 30, icon: Sparkles },
]

export default function ShopSection() {
  const coins = useUserStore((s) => s.coins)
  const spendCoins = useUserStore((s) => s.spendCoins)
  const grantChats = useUserStore((s) => s.grantChats)
  const grantMember = useUserStore((s) => s.grantMember)
  const pushToast = useUIStore((s) => s.pushToast)

  const buy = (g: Goods) => {
    if (!spendCoins(g.cost)) {
      pushToast({ type: 'warn', title: '金币不足！', desc: `还差 ${g.cost - coins} 金币，去做任务赚金币吧` })
      return
    }
    if (g.kind === 'chats') {
      grantChats(g.value)
      pushToast({ type: 'success', title: `兑换成功：${g.name}！`, desc: '对话次数已到账' })
    } else {
      grantMember(g.value)
      pushToast({ type: 'success', title: `兑换成功：${g.name}！`, desc: '模拟会员已生效' })
    }
  }

  return (
    <section id="shop" className="card p-5 md:p-6">
      <SectionHeader
        seal="兑"
        title="金币商城 · 你的努力值得被看见"
        sub="使用金币兑换对话次数或会员体验"
        right={
          <span className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold-soft px-3 py-1.5 text-xs font-bold text-gold-deep tabular-nums">
            <CoinIcon size={14} /> 当前 {coins} 金币
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {GOODS.map((g, i) => {
          const Icon = g.icon
          const afford = coins >= g.cost
          return (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col items-center rounded-xl border p-4 text-center transition ${
                afford ? 'border-line bg-white/70 hover:border-gold' : 'border-line/70 bg-white/40'
              }`}
            >
              {g.hot && (
                <span className="absolute -top-2 right-2 rounded-full bg-gradient-to-br from-[#F04438] to-[#B91C1C] px-2 py-0.5 text-[10px] font-bold text-white shadow-red">
                  热卖
                </span>
              )}
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  g.kind === 'member' ? 'bg-gold-soft text-gold-deep' : 'bg-brand-soft text-brand-deep'
                }`}
              >
                <Icon size={20} />
              </span>
              <p className="mt-2 text-[13px] font-bold text-ink">{g.name}</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-gold-deep tabular-nums">
                <CoinIcon size={15} /> {g.cost}
              </p>
              <button
                onClick={() => buy(g)}
                className={`btn btn-sm mt-3 w-full ${afford ? 'btn-red' : 'btn-ghost'}`}
              >
                <ShoppingBag size={13} /> {afford ? '兑换' : '金币不足'}
              </button>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-faint">
        兑换立即生效 · 会员均为模拟权益 · 金币可通过签到、任务、摇一摇、转盘与红包雨获取
      </p>
    </section>
  )
}
