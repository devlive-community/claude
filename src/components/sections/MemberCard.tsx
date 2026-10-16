import { useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Check, Crown, ShieldAlert } from 'lucide-react'
import Modal from '../ui/Modal'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'

const BENEFITS = [
  '无限次 AI 对话',
  '更快的响应速度',
  '深度思考功能',
  '文件上传与分析',
  '专属会员标识',
  '优先体验新功能',
]

export default function MemberCard() {
  const memberExpiresAt = useUserStore((s) => s.memberExpiresAt)
  const isMember = useUserStore((s) => s.isMember)
  const grantMember = useUserStore((s) => s.grantMember)
  const pushToast = useUIStore((s) => s.pushToast)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const active = isMember()
  const expireStr = memberExpiresAt ? new Date(memberExpiresAt).toLocaleDateString('zh-CN') : ''

  const confirm = () => {
    grantMember(30)
    setConfirmOpen(false)
    pushToast({
      type: 'success',
      title: '尊享会员开通成功（模拟）',
      desc: '有效期 30 天，未产生任何真实扣费',
    })
  }

  return (
    <section
      id="member"
      className="relative flex flex-col overflow-hidden rounded-2xl border bg-member p-5"
      style={{ borderColor: 'rgba(212,162,76,0.35)' }}
    >
      {/* 黑金装饰 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(130% 70% at 80% 0%, rgba(212,162,76,0.28), transparent 55%), radial-gradient(120% 80% at 0% 100%, rgba(217,119,87,0.15), transparent 50%)',
          }}
        />
        <div className="absolute -right-8 -top-8 h-32 w-32 rotate-45 border border-gold/20" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rotate-45 border border-gold/10" />
      </div>

      <div className="relative flex items-start gap-3">
        <motion.span
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#F2CF8D] to-[#B8862F] shadow-gold"
        >
          <Crown size={22} className="text-[#5b3a10]" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="gold-text font-serif text-lg font-bold">Claude 尊享会员</h2>
            <span className="rounded-md bg-gradient-to-br from-[#F04438] to-[#B91C1C] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-red">
              限时特惠
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#C9B48E]">尊享 AI 智慧，开启非凡体验。</p>
        </div>
        {active && (
          <span className="flex flex-none items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-2 py-1 text-[10px] font-bold text-gold">
            <BadgeCheck size={12} /> 生效中
          </span>
        )}
      </div>

      {/* 权益列表 */}
      <ul className="relative mt-4 grid flex-1 gap-1.5">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2 text-[12.5px] text-[#E7D6B8]">
            <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-gold/20">
              <Check size={10} strokeWidth={3.5} className="text-gold" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* 价格与按钮 */}
      <div className="relative mt-4 rounded-xl border border-gold/25 bg-black/25 p-3.5">
        <div className="flex items-end gap-2">
          <span className="font-serif text-[26px] font-black leading-none text-[#F5D98B]">
            ¥9.9
            <span className="text-sm font-medium text-[#C9B48E]"> / 月</span>
          </span>
          <s className="pb-0.5 text-xs text-[#8a7663]">原价 ¥49.00</s>
        </div>
        <button onClick={() => setConfirmOpen(true)} className="btn btn-red btn-lg mt-3 w-full">
          <Crown size={15} />
          {active ? `续费（至 ${expireStr}）` : '立即开通'}
        </button>
        <p className="mt-2 flex items-start gap-1 text-[10px] leading-relaxed text-[#9a8a72]">
          <ShieldAlert size={11} className="mt-0.5 flex-none" />
          会员为模拟状态，点击不接入任何实际支付，也不会产生真实扣费
        </p>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="确认开通尊享会员？" sealChar="会" width="max-w-xs">
        <div className="rounded-xl border border-gold/40 bg-gold-soft/50 p-3.5 text-center">
          <Crown size={26} className="mx-auto text-gold-deep" />
          <p className="mt-1.5 font-serif text-lg font-bold text-ink">Claude 尊享会员 · 30 天</p>
          <p className="mt-0.5 text-xs text-faint">模拟价格 ¥9.9 / 月（限时特惠）</p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-body">
          这是娱乐模拟网站的模拟开通流程：<strong className="text-cred">不会产生任何真实费用</strong>
          ，会员权益全部为模拟实现（对话不限量也是模拟的，毕竟回复本来就是本地生成的）。
        </p>
        <div className="mt-4 flex gap-2.5">
          <button onClick={() => setConfirmOpen(false)} className="btn btn-ghost flex-1">
            再想想
          </button>
          <button onClick={confirm} className="btn btn-red flex-1">
            <Crown size={14} /> 模拟开通
          </button>
        </div>
      </Modal>
    </section>
  )
}
