import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Axe, Crown, PartyPopper, UserPlus } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Modal from '../ui/Modal'
import AnimatedNumber from '../ui/AnimatedNumber'
import { BARGAIN_BASE, useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { centerOf, cn, pick, rand } from '../../lib/utils'
import { CoinIcon } from '../icons'

const FUNNY = [
  '只差最后一刀！',
  '再邀请一位好友！',
  '距离免费体验只差一点点！',
  '这一刀下去，AI 都得感动！',
  '您已经砍了 18 次最后一刀！',
  '砍价砍到手抽筋，快乐快乐～',
]

function rel(ts: number) {
  const d = Date.now() - ts
  if (d < 60_000) return '刚刚'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} 分钟前`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} 小时前`
  return `${Math.floor(d / 86_400_000)} 天前`
}

/** 砍价爆发粒子：金币 + 小红包 */
function Burst({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (trigger <= 0) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 1300)
    return () => clearTimeout(t)
  }, [trigger])
  const parts = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: rand(-130, 130),
    y: rand(-150, -40),
    r: rand(-260, 260),
    coin: i % 3 !== 2,
    size: rand(14, 24),
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      <AnimatePresence>
        {show &&
          parts.map((p) => (
            <motion.div
              key={`${trigger}-${p.id}`}
              className="absolute left-1/2 top-2/3"
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, scale: [0.4, 1, 0.7], opacity: [1, 1, 0], rotate: p.r }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            >
              {p.coin ? (
                <CoinIcon size={p.size} />
              ) : (
                <span
                  className="flex items-center justify-center rounded-[3px] bg-gradient-to-b from-[#E04338] to-[#B91C1C] font-serif text-[9px] font-bold text-[#F5D98B] shadow"
                  style={{ width: p.size, height: p.size * 1.3 }}
                >
                  福
                </span>
              )}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}

export default function BargainCard() {
  const price = useUserStore((s) => s.bargain.price)
  const helpers = useUserStore((s) => s.bargain.helpers)
  const round = useUserStore((s) => s.bargain.round)
  const cutBargain = useUserStore((s) => s.cutBargain)
  const resetBargain = useUserStore((s) => s.resetBargain)
  const grantMember = useUserStore((s) => s.grantMember)
  const canSelfCutToday = useUserStore((s) => s.canSelfCutToday)
  const pushToast = useUIStore((s) => s.pushToast)
  const openInvite = useUIStore((s) => s.openInvite)
  const flyCoins = useUIStore((s) => s.flyCoins)

  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [burst, setBurst] = useState(0)
  const [funny, setFunny] = useState(FUNNY[0])
  const [claimed, setClaimed] = useState(false)

  const progress = Math.min(100, ((BARGAIN_BASE - price) / BARGAIN_BASE) * 100)

  useEffect(() => {
    if (price <= 0 && !claimed) setSuccess(true)
  }, [price, claimed])

  const selfCut = () => {
    if (!canSelfCutToday()) {
      pushToast({ type: 'warn', title: '今天自己已经砍过啦', desc: '每天限一次，快邀请好友帮忙' })
      return
    }
    const amount = 30
    cutBargain(amount, '我自己', true)
    setBurst((k) => k + 1)
    setFunny(pick(FUNNY))
    pushToast({ type: 'coin', title: `恭喜砍掉 ¥${amount.toFixed(2)}！`, desc: '继续邀请好友助力！' })
  }

    if (!useUserStore.getState().loggedIn) {
      pushToast({ type: 'warn', title: '请先登录后再开通会员', desc: '会员跟随账号，退出登录即失效' })
      return
    }
  const claim = () => {
    grantMember(30)
    setClaimed(true)
    setSuccess(false)
    pushToast({ type: 'success', title: '尊享会员（30 天）已到账！', desc: '本站为模拟会员，仅供娱乐' })
    flyCoins(centerOf(document.getElementById('bargain')) ?? { x: 300, y: 300 }, 10)
    resetBargain()
  }

  return (
    <section id="bargain" className="card flex flex-col p-5 md:p-6">
      <SectionHeader
        seal="砍"
        title={
          <span className="flex items-center gap-1.5">
            砍一刀 · 免费领 Pro
            <Axe size={17} className="text-cred" />
          </span>
        }
        sub="邀请好友帮你砍价，0 元体验尊享会员（模拟游戏）"
        right={
          <span className="rounded-full bg-cred-soft px-2.5 py-1 text-[10px] font-bold text-cred">第 {round} 轮</span>
        }
      />

      {/* 价格进度 */}
      <div className="rounded-xl bg-gradient-to-br from-[#FFF0E8] to-[#FBE3D6] p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] text-faint">原价 <s className="tabular-nums">¥{BARGAIN_BASE.toFixed(2)}</s></p>
            <p className="font-serif text-4xl font-black leading-none text-cred tabular-nums">
              ¥<AnimatedNumber value={price} decimals={2} />
            </p>
          </div>
          <p className="text-xs text-body">
            还差 <span className="font-bold text-cred tabular-nums">¥{price.toFixed(2)}</span>
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F3DDC9]">
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-[#F5D98B] via-[#F04438] to-[#B91C1C]"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          >
            <span className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
          </motion.div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gold-deep">{funny}</p>
      </div>

      {/* 助力记录 */}
      <div className="mt-3.5 flex-1 space-y-2">
        <p className="text-xs font-bold text-ink">模拟助力记录</p>
        {helpers.length === 0 && <p className="py-2 text-xs text-faint">还没有人助力，来试试自己先砍一刀？</p>}
        {helpers.slice(0, 3).map((h, i) => (
          <div key={`${h.ts}-${i}`} className="flex items-center gap-2.5 rounded-lg bg-white/60 px-2.5 py-1.5">
            <span
              className={cn(
                'flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold text-white',
                h.self ? 'bg-gradient-to-br from-[#D97757] to-[#B0522F]' : 'bg-gradient-to-br from-[#E8B04B] to-[#C08F36]',
              )}
            >
              {h.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-body">
              {h.name} <span className="text-faint">{h.self ? '(本尊出手)' : '帮砍了一刀'}</span>
            </span>
            <span className="text-xs font-bold text-cred tabular-nums">-¥{h.amount.toFixed(2)}</span>
            <span className="w-14 flex-none text-right text-[10px] text-faint">{rel(h.ts)}</span>
          </div>
        ))}
      </div>

      <button onClick={() => setOpen(true)} className="btn btn-red btn-lg mt-4 w-full">
        <Axe size={16} /> 邀请好友砍一刀
      </button>
      <p className="mt-2 text-center text-[10px] text-faint">模拟砍价游戏 · 不涉及真实支付或提现</p>

      {/* 砍价弹窗 */}
      <Modal open={open} onClose={() => setOpen(false)} title="砍一刀 · 免费领尊享会员" sealChar="砍" width="max-w-sm">
        <div className="relative">
          <Burst trigger={burst} />
          <div className="promo-bg rounded-xl p-5 text-center">
            <p className="text-xs text-[#F7D9A8]">好友每砍一刀，价格就会暴跌！</p>
            <p className="mt-1.5 font-serif text-4xl font-black text-white tabular-nums">
              ¥<AnimatedNumber value={price} decimals={2} />
            </p>
            <p className="mt-0.5 text-xs text-white/70 line-through">原价 ¥{BARGAIN_BASE.toFixed(2)}</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/25">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#F5D98B] to-[#D4A24C]"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 16 }}
              />
            </div>
            <p className="mt-2 text-[11px] text-white/85">
              砍到 ¥0.00 = 免费拿 30 天尊享会员（无限对话 · 深度思考）
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-gold-deep">{funny}</p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button onClick={selfCut} className="btn btn-gold btn-lg">
            <Axe size={15} /> 自己先砍一刀
          </button>
          <button
            onClick={() => {
              setOpen(false)
              openInvite('bargain')
            }}
            className="btn btn-red btn-lg"
          >
            <UserPlus size={15} /> 邀请好友
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-faint">
          每天可自己砍一刀（本回合 {!canSelfCutToday() ? '已用' : '未用'}），好友助力不限次数
        </p>
      </Modal>

      {/* 成功弹窗 */}
      <Modal open={success} onClose={() => setSuccess(false)} width="max-w-xs">
        <div className="py-2 text-center">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F2CF8D] to-[#C08F36] shadow-gold"
          >
            <PartyPopper size={30} className="text-white" />
          </motion.div>
          <h3 className="mt-3 font-serif text-xl font-bold text-ink">砍价成功！</h3>
          <p className="mt-1.5 text-sm text-body">
            ¥{BARGAIN_BASE.toFixed(2)} → <span className="font-bold text-cred">¥0.00</span>
          </p>
          <div className="mt-3 rounded-xl border border-gold/50 bg-gold-soft/60 p-3">
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-gold-deep">
              <Crown size={16} /> 30 天尊享会员
            </div>
            <p className="mt-1 text-[11px] text-faint">无限对话 · 深度思考 · 会员标识，模拟权益即刻生效</p>
          </div>
          <button onClick={claim} className="btn btn-red btn-lg mt-4 w-full">
            收下会员，再来一轮
          </button>
        </div>
      </Modal>
    </section>
  )
}
