import { useState } from 'react'
import { Crown, Tv, UserPlus } from 'lucide-react'
import Modal from '../ui/Modal'
import { AdModal, ADS } from '../sections/AdsSection'
import { useUIStore } from '../../store/useUIStore'
import { useNavigate } from 'react-router-dom'

/** 客官，您的智慧余额不足！—— 特色回血三件套 */
export default function QuotaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const openInvite = useUIStore((s) => s.openInvite)
  const [ad, setAd] = useState<(typeof ADS)[number] | null>(null)

  const options = [
    {
      icon: Tv,
      title: '看广告领取 5 次对话',
      desc: '观看 30 秒模拟广告，每日 5 次',
      cls: 'text-[#4C6FA5] bg-[#EDF3FB]',
      onClick: () => setAd(ADS[Math.floor(Math.random() * ADS.length)]),
    },
    {
      icon: UserPlus,
      title: '邀请好友领取 20 次对话',
      desc: '模拟好友接受邀请即刻到账',
      cls: 'text-cred bg-cred-soft',
      onClick: () => {
        onClose()
        openInvite('chats')
      },
    },
    {
      icon: Crown,
      title: '开通尊享会员',
      desc: '限时 ¥9.9/月，对话不限量（模拟）',
      cls: 'text-gold-deep bg-gold-soft',
      onClick: () => {
        onClose()
        navigate('/shop')
      },
    },
  ]

  return (
    <>
      <Modal open={open} onClose={onClose} title="客官，您的智慧余额不足！" sealChar="缺" width="max-w-sm">
        <p className="mb-4 text-sm text-body">今天的免费对话已经用完啦。不过莫慌，本站三大回血方式任您选：</p>
        <div className="space-y-2.5">
          {options.map((o) => {
            const Icon = o.icon
            return (
              <button
                key={o.title}
                onClick={o.onClick}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-white/70 p-3.5 text-left transition hover:border-gold hover:bg-gold-soft/40"
              >
                <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${o.cls}`}>
                  <Icon size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink">{o.title}</span>
                  <span className="block text-xs text-faint">{o.desc}</span>
                </span>
                <span className="ml-auto text-faint">→</span>
              </button>
            )
          })}
        </div>
        <p className="mt-3.5 text-center text-[11px] text-faint">以上均为模拟功能，不产生任何真实费用</p>
      </Modal>
      <AdModal ad={ad} onClose={() => setAd(null)} />
    </>
  )
}
