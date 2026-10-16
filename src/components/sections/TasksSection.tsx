import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AtSign,
  CalendarCheck,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Gift,
  MessageCircleMore,
  Palette,
  Share2,
  Tv,
  UserPlus,
} from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import Modal from '../ui/Modal'
import { TASK_META, TASK_REWARDS, useUserStore, type TaskId } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { useNavigate } from 'react-router-dom'
import { centerOf, cn } from '../../lib/utils'
import { CoinIcon } from '../icons'

const TASK_STYLE: Record<TaskId, { icon: typeof CalendarCheck; cls: string }> = {
  sign: { icon: CalendarCheck, cls: 'text-cred bg-cred-soft' },
  chat: { icon: MessageCircleMore, cls: 'text-brand-deep bg-brand-soft' },
  ad: { icon: Tv, cls: 'text-[#4C6FA5] bg-[#EDF3FB]' },
  share: { icon: Share2, cls: 'text-emerald-700 bg-emerald-50' },
  invite: { icon: UserPlus, cls: 'text-purple-600 bg-purple-50' },
  paint: { icon: Palette, cls: 'text-[#C07A2B] bg-[#FBF0DE]' },
}

/** 分享弹窗：模拟分享，不接任何真实平台 */
function ShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const setTaskDone = useUserStore((s) => s.setTaskDone)
  const pushToast = useUIStore((s) => s.pushToast)
  const channels = [
    { label: '微信好友', icon: MessageCircleMore },
    { label: '朋友圈', icon: Camera },
    { label: '微博', icon: AtSign },
  ]
  const share = (label: string) => {
    setTaskDone('share')
    pushToast({ type: 'success', title: `已分享到${label}（模拟）`, desc: '任务完成，回来领取金币吧' })
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="分享活动赚金币" sealChar="享" width="max-w-xs">
      <p className="mb-3 text-xs text-body">这是模拟分享：不会真的唤起任何 App，点击渠道即视为分享成功。</p>
      <div className="grid grid-cols-3 gap-2">
        {channels.map((c) => {
          const Icon = c.icon
          return (
            <button
              key={c.label}
              onClick={() => share(c.label)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-white/70 py-3 transition hover:border-gold hover:bg-gold-soft/50"
            >
              <Icon size={20} className="text-gold-deep" />
              <span className="text-[11px] text-body">{c.label}</span>
            </button>
          )
        })}
      </div>
      <button
        onClick={() => {
          navigator.clipboard
            .writeText('https://claude-china.demo/s/CLE-8888')
            .then(() => pushToast({ type: 'success', title: '活动链接已复制（模拟）' }))
        }}
        className="btn btn-ghost mt-3 w-full"
      >
        <Copy size={13} /> 复制活动链接
      </button>
    </Modal>
  )
}

export default function TasksSection() {
  const tasks = useUserStore((s) => s.tasks)
  const claimTask = useUserStore((s) => s.claimTask)
  const pushToast = useUIStore((s) => s.pushToast)
  const flyCoins = useUIStore((s) => s.flyCoins)
  const openInvite = useUIStore((s) => s.openInvite)
  const navigate = useNavigate()
  const [shareOpen, setShareOpen] = useState(false)

  const onAction = (id: TaskId) => {
    switch (id) {
      case 'sign':
        document.getElementById('signin')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        break
      case 'chat':
        navigate('/chat')
        break
      case 'ad':
        navigate('/activities')
        break
      case 'share':
        setShareOpen(true)
        break
      case 'invite':
        openInvite('chats')
        break
      case 'paint':
        navigate('/paint')
        break
    }
  }

  const onClaim = (id: TaskId, e: React.MouseEvent) => {
    claimTask(id)
    pushToast({ type: 'coin', title: `任务完成，获得 ${TASK_REWARDS[id]} 金币！` })
    flyCoins(centerOf(e.currentTarget as HTMLElement) ?? { x: 400, y: 300 }, 6)
  }

  return (
    <section id="tasks" className="card p-5 md:p-6">
      <SectionHeader
        seal="任"
        title="每日任务 · 轻松赚金币"
        sub="完成任务即可获得金币奖励，金币可兑换对话次数或会员体验"
        right={
          <button onClick={() => navigate('/shop')} className="btn btn-ghost btn-sm">
            更多任务 <ChevronRight size={13} />
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(TASK_META) as TaskId[]).map((id, i) => {
          const meta = TASK_META[id]
          const style = TASK_STYLE[id]
          const Icon = style.icon
          const done = tasks.done[id]
          const claimed = tasks.claimed[id]
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3.5 transition',
                claimed ? 'border-line bg-white/40 opacity-70' : 'border-line bg-white/70 hover:border-gold/60',
              )}
            >
              <span className={cn('flex h-11 w-11 flex-none items-center justify-center rounded-xl', style.cls)}>
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{meta.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gold-deep">
                  <CoinIcon size={12} /> 领取 {TASK_REWARDS[id]} 金币
                </p>
              </div>
              {claimed ? (
                <span className="flex flex-none items-center gap-1 rounded-lg bg-card-deep px-3 py-1.5 text-xs text-faint">
                  <Check size={12} /> 已领取
                </span>
              ) : done ? (
                <motion.button
                  onClick={(e) => onClaim(id, e)}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="btn btn-gold btn-sm flex-none"
                >
                  <Gift size={13} /> 领取
                </motion.button>
              ) : (
                <button onClick={() => onAction(id)} className="btn btn-red btn-sm flex-none">
                  {meta.action}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-faint">
        邀请好友按钮会打开模拟邀请弹窗，不会打扰任何真实好友；任务每日 0 点刷新
      </p>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </section>
  )
}
