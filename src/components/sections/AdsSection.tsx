import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgePercent, Crown, Play, Tv, X } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Modal from '../ui/Modal'
import { useUserStore, MAX_ADS_PER_DAY } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { centerOf, cn } from '../../lib/utils'
import { CoinIcon } from '../icons'

export const ADS = [
  { img: '/img/ad-1.jpg', title: 'AI 助手效率神器', sub: '学会这招，效率翻倍！', tag: '虚拟推广' },
  { img: '/img/ad-2.jpg', title: '限时福利大放送', sub: '超值好礼，限时领取！', tag: '虚构活动' },
  { img: '/img/ad-3.jpg', title: '办公学习工具合集', sub: '精选工具，提升效率！', tag: '虚构推荐' },
  { img: '/img/ad-4.jpg', title: 'AI 实用技巧分享', sub: '让 AI 成为你的生产力！', tag: '虚拟分享' },
]

const AD_DURATION = 30

export function AdModal({
  ad,
  onClose,
}: {
  ad: (typeof ADS)[number] | null
  onClose: () => void
}) {
  const [left, setLeft] = useState(AD_DURATION)
  const [claimed, setClaimed] = useState(false)
  const watchAd = useUserStore((s) => s.watchAd)
  const grantChats = useUserStore((s) => s.grantChats)
  const isMember = useUserStore((s) => s.isMember)
  const pushToast = useUIStore((s) => s.pushToast)
  const flyCoins = useUIStore((s) => s.flyCoins)
  const claimedRef = useRef(false)

  const skipByMember = ad ? isMember() : false

  useEffect(() => {
    if (!ad) return
    setLeft(skipByMember ? 0 : AD_DURATION)
    setClaimed(false)
    claimedRef.current = false
    if (skipByMember) {
      // 会员免广告：直接可领
      return
    }
    const t = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          window.clearInterval(t)
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad])

  if (!ad) return null
  const done = left <= 0
  const progress = done ? 100 : ((AD_DURATION - left) / AD_DURATION) * 100

  const tryClose = () => {
    if (!done && !claimedRef.current) {
      pushToast({ type: 'warn', title: '广告还没看完哦', desc: '看完才有 5 次对话奖励' })
      return
    }
    onClose()
  }

  const claim = () => {
    if (claimedRef.current) return
    claimedRef.current = true
    watchAd()
    grantChats(5)
    setClaimed(true)
    pushToast({ type: 'success', title: '恭喜获得 5 次 AI 对话！', desc: '剩余对话次数已更新' })
    flyCoins(centerOf(document.getElementById('ads')) ?? { x: 400, y: 300 }, 7)
    window.setTimeout(onClose, 900)
  }

  return (
    <Modal open={!!ad} onClose={tryClose} width="max-w-lg" title={<AdTitle ad={ad} />}>
      <div className="relative overflow-hidden rounded-xl border border-line">
        <img src={ad.img} alt={ad.title} className="h-56 w-full object-cover sm:h-64" />
        <AnimatePresence>
          {!done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur"
            >
              广告 <span className="font-bold tabular-nums text-[#F5D98B]">{left}</span> s
            </motion.div>
          )}
        </AnimatePresence>
        {/* 模拟广告文案 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10">
          <p className="font-serif text-lg font-bold text-white">{ad.title}</p>
          <p className="text-xs text-white/80">{ad.sub}（本广告纯属虚构）</p>
        </div>
      </div>

      {/* 播放进度条 */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F0E4CE]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#F04438] to-[#B91C1C]"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 0.9 }}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-faint">
          <CoinIcon size={15} />
          完整观看后可领 <span className="font-bold text-gold-deep">+5 次对话</span>
        </div>
        {done ? (
          claimed ? (
            <span className="btn btn-ghost btn-lg ml-auto">奖励已到账</span>
          ) : (
            <motion.button
              onClick={claim}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="btn btn-red btn-lg ml-auto"
            >
              <CoinIcon size={16} /> 领取 5 次对话
            </motion.button>
          )
        ) : (
          <span className="ml-auto text-xs text-faint">
            {skipByMember ? '尊享会员免广告特权' : '关闭弹窗将无法领取奖励'}
          </span>
        )}
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={tryClose}
        className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white/90 backdrop-blur transition hover:bg-black/45"
        aria-label="关闭广告"
      >
        <X size={16} />
      </button>
    </Modal>
  )
}

function AdTitle({ ad }: { ad: { title: string } }) {
  return (
    <span className="flex items-center gap-2 font-serif text-lg font-bold text-ink">
      <Tv size={18} className="text-cred" />
      正在播放：{ad.title}
    </span>
  )
}

export default function AdsSection() {
  const adWatched = useUserStore((s) => s.daily.adWatched)
  const [current, setCurrent] = useState<(typeof ADS)[number] | null>(null)
  const left = Math.max(0, MAX_ADS_PER_DAY - adWatched)

  return (
    <section id="ads" className="card p-5 md:p-6">
      <SectionHeader
        seal="广"
        title="看广告 · 免费解锁高级对话"
        sub="观看完整广告即可获得 5 次对话机会，每日最多 5 次"
        right={
          <span className="rounded-full border border-gold/50 bg-gold-soft px-3 py-1.5 text-xs font-bold text-gold-deep tabular-nums">
            今日已解锁 {adWatched} / {MAX_ADS_PER_DAY} 次
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ADS.map((ad, i) => {
          const disabled = left <= 0
          return (
            <motion.div
              key={ad.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white/70"
            >
              <div className="relative h-24 overflow-hidden sm:h-28">
                <img
                  src={ad.img}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur">
                  {ad.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-[13px] font-bold text-ink">{ad.title}</p>
                <p className="mt-0.5 text-[11px] text-faint">{ad.sub}</p>
                <button
                  disabled={disabled}
                  onClick={() => setCurrent(ad)}
                  className={cn('btn btn-sm mt-2.5 w-full', disabled ? 'btn-ghost' : 'btn-red')}
                >
                  {disabled ? '今日已达上限' : (
                    <>
                      <Play size={12} /> 观看广告解锁
                    </>
                  )}
                </button>
                <span className="mt-1.5 text-center text-[10px] text-gold-deep">奖励 +5 次对话</span>
              </div>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
        <Crown size={13} className="text-gold" />
        尊享会员可免广告直接领取；
        <BadgePercent size={13} className="text-gold" />
        以上广告内容均为虚构，不指向任何真实商品。
      </p>

      <AdModal ad={current} onClose={() => setCurrent(null)} />
    </section>
  )
}
