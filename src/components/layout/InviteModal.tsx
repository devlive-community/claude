import { Copy, UserPlus } from 'lucide-react'
import Modal from '../ui/Modal'
import { useUIStore } from '../../store/useUIStore'
import { useUserStore, BARGAIN_BASE } from '../../store/useUserStore'
import { pick, rand, cn } from '../../lib/utils'
import { CoinIcon } from '../icons'

const FRIENDS = [
  '大学室友阿强',
  '微信好友小美',
  '楼下便利店老板',
  '健身教练 Kevin',
  '表弟小磊',
  '同事阿花',
  '老班长',
  '邻居张阿姨',
  '网友「一剪梅」',
  '常点外卖的骑手小哥',
]

const INVITE_LINK = 'https://claude-china.demo/i/CLE-8888'

export default function InviteModal() {
  const open = useUIStore((s) => s.inviteOpen)
  const mode = useUIStore((s) => s.inviteMode)
  const close = useUIStore((s) => s.closeInvite)
  const pushToast = useUIStore((s) => s.pushToast)
  const price = useUserStore((s) => s.bargain.price)
  const cutBargain = useUserStore((s) => s.cutBargain)
  const inviteChatReward = useUserStore((s) => s.inviteChatReward)
  const setTaskDone = useUserStore((s) => s.setTaskDone)

  const copyLink = () => {
    navigator.clipboard
      .writeText(INVITE_LINK)
      .then(() => pushToast({ type: 'success', title: '邀请链接已复制（模拟）', desc: INVITE_LINK }))
      .catch(() => pushToast({ type: 'warn', title: '复制失败', desc: '请手动复制' }))
  }

  const helpBargain = () => {
    const amount = Math.round(rand(4, 12) * 10) / 10
    const name = pick(FRIENDS)
    cutBargain(amount, name)
    pushToast({ type: 'coin', title: `好友助力成功！`, desc: `${name} 帮您砍掉了 ¥${amount.toFixed(2)}` })
    if (price - amount <= 0) {
      close()
    }
  }

  const helpChats = () => {
    const ok = inviteChatReward()
    if (!ok) {
      pushToast({ type: 'warn', title: '今日邀请奖励已领取', desc: '明天再来邀请好友吧' })
      return
    }
    setTaskDone('invite')
    pushToast({ type: 'success', title: '好友已接受邀请！', desc: '获得 20 次 AI 对话' })
    close()
  }

  const isBargain = mode === 'bargain'

  return (
    <Modal open={open} onClose={close} title={isBargain ? '邀请好友砍一刀' : '邀请好友领对话'} sealChar="邀" width="max-w-sm">
      <div className="space-y-4">
        <div className={cn('rounded-xl p-4 text-center', isBargain ? 'promo-bg' : 'bg-gradient-to-br from-[#D97757] to-[#B0522F]')}>
          {isBargain ? (
            <>
              <p className="text-xs text-[#F7D9A8]">当前砍价进度</p>
              <p className="mt-1 font-serif text-3xl font-bold text-white tabular-nums">
                ¥{price.toFixed(2)}
                <span className="ml-2 text-sm font-normal text-white/70 line-through">¥{BARGAIN_BASE.toFixed(2)}</span>
              </p>
              <div className="mx-auto mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F5D98B] to-[#D4A24C] transition-all duration-700"
                  style={{ width: `${Math.min(100, ((BARGAIN_BASE - price) / BARGAIN_BASE) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-white/75">砍到 ¥0.00 即可免费获得 30 天尊享会员</p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                <CoinIcon size={34} />
              </div>
              <p className="mt-2 font-serif text-xl font-bold text-white">+20 次 AI 对话</p>
              <p className="mt-1 text-[11px] text-white/75">模拟好友接受邀请后即刻到账，每日限领一次</p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white/70 p-3">
          <p className="mb-1.5 text-xs font-medium text-faint">活动说明（模拟）</p>
          <p className="text-xs leading-relaxed text-body">
            {isBargain
              ? '这是娱乐模拟砍价游戏：点击下方「模拟好友助力」即可体验好友帮砍效果，不涉及真实支付与提现。'
              : '这是娱乐模拟邀请活动：模拟好友接受邀请即可获得对话额度，不会打扰任何真实好友。'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-dashed border-line bg-card-deep/60 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-xs text-faint">{INVITE_LINK}</span>
          <button onClick={copyLink} className="btn btn-ghost btn-sm flex-none">
            <Copy size={13} /> 复制
          </button>
        </div>

        <button onClick={isBargain ? helpBargain : helpChats} className="btn btn-red btn-lg w-full">
          <UserPlus size={16} />
          {isBargain ? '模拟好友助力' : '模拟好友接受邀请'}
        </button>
      </div>
    </Modal>
  )
}
