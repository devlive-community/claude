import { ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { InkScrollFooter } from '../InkBackground'
import { ClaudeMark } from '../icons'

const LINKS = [
  { label: 'AI 对话', path: '/chat' },
  { label: '每日签到', path: '/tasks' },
  { label: '活动广场', path: '/activities' },
  { label: 'AI 绘画', path: '/paint' },
  { label: '金币商城', path: '/shop' },
  { label: '关于我们', path: '/about' },
]

const EVENTS = ['看广告解锁对话', '红包雨限时开启', '摇一摇领金币', '邀请好友砍一刀', '限时会员特惠', '连续签到赢金币']

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="relative z-10">
      <InkScrollFooter />
      <div className="mx-auto max-w-[1440px] px-4 pb-28 md:px-6 lg:pb-8">
        <div className="card mb-5 grid gap-6 p-6 md:grid-cols-3 md:p-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-brand">
                <ClaudeMark size={26} />
              </span>
              <span className="font-serif text-base font-bold text-ink">Claude 中国版</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-faint">
              如果 Claude 入乡随俗，学会了签到、砍一刀、摇一摇、红包雨这一整套运营玩法，它会变成什么样子？——
              这是一个用来回答这个问题的娱乐模拟项目。
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-serif text-sm font-bold text-ink">快速导航</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {LINKS.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className="text-left text-xs text-body transition hover:text-cred"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-serif text-sm font-bold text-ink">活动一览</h4>
            <div className="flex flex-wrap gap-1.5">
              {EVENTS.map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-line bg-gold-soft/60 px-2.5 py-1 text-[11px] text-body"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card mb-5 flex flex-col items-start gap-2 border-cred/40 bg-cred-soft/50 p-4 md:flex-row md:items-center md:gap-3">
          <ShieldAlert size={20} className="flex-none text-cred" />
          <p className="text-xs leading-relaxed text-cred-deep">
            <strong className="font-serif">非官方娱乐模拟网站，与 Anthropic 无关联。</strong>
            所有广告、支付、奖励、会员均为模拟功能，不产生真实交易；本站不收集任何个人信息，所有数据仅保存在您的浏览器本地。
          </p>
        </div>

        <p className="text-center text-[11px] text-faint">
          © 2026 Claude 中国版 · 仅供娱乐与创意表达 · Made with 国风 &amp; 热闹
        </p>
      </div>
    </footer>
  )
}
