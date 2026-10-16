import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, Github, ShieldAlert, Sparkles } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { ClaudeMark } from '../components/icons'

const FEATURES = [
  '看广告解锁 AI 对话额度',
  '邀请好友砍一刀，免费解锁 Claude Pro',
  '每日签到领取金币，连续签到有惊喜',
  '摇一摇领金币（支持手机体感）',
  '红包雨限时活动，15 秒手速大战',
  '每日任务赚金币',
  '幸运大转盘，每天一次免费抽奖',
  '金币商城兑换对话次数与会员',
  '尊享会员限时特惠（模拟）',
  'AI 对话额度不足时的花式回血',
]

const STACK = ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Framer Motion', 'Zustand', 'React Router', 'Lucide Icons']

export default function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-[900px] px-4 pb-14 pt-5 md:px-6 md:pt-7">
      <PageHeader seal="关" title="关于我们" sub="一个用来回答「如果 Claude 入乡随俗会怎样」的娱乐模拟项目" />

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-start gap-4 p-6"
      >
        <span className="text-brand">
          <ClaudeMark size={38} />
        </span>
        <div>
          <h2 className="font-serif text-lg font-bold text-ink">Claude 中国版是什么？</h2>
          <p className="mt-2 text-sm leading-relaxed text-body">
            如果 Claude 入乡随俗，学会了签到、砍一刀、摇一摇、红包雨这一整套运营玩法，它会变成什么样子？
            本站把这个脑洞做成了一个可以真正运行的网站：它既有 Claude 式的对话体验，
            又有砍一刀、摇一摇、看广告、领金币、签到、红包雨、大转盘、邀请好友、限时福利——
            每一样都似曾相识，每一样都在认真地搞笑。
          </p>
          <p className="mt-2 text-sm leading-relaxed text-body">
            站内所有「AI 能力」均在浏览器本地模拟生成，所有金币、会员、对话额度只保存在您自己的
            localStorage 里。它是一面可爱的哈哈镜，不是一个真实的产品。
          </p>
        </div>
      </motion.section>

      <section className="card mt-4 p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-ink">
          <Sparkles size={18} className="text-gold-deep" /> 特色玩法
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-[13px] text-body">
              <span className="h-1.5 w-1.5 flex-none rounded-full bg-cred" />
              {f}
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-4 p-6">
        <h2 className="font-serif text-lg font-bold text-ink">技术栈</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-line bg-gold-soft/50 px-3 py-1 text-xs font-medium text-body">
              {s}
            </span>
          ))}
        </div>
        <a
          href="https://github.com/devlive-community/claude-ch"
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost mt-4"
        >
          <Github size={15} /> 查看源码仓库 <ExternalLink size={13} />
        </a>
      </section>

      <section className="card mt-4 border-cred/40 bg-cred-soft/40 p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-cred">
          <ShieldAlert size={19} /> 免责声明
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-cred-deep">
          <strong>非官方娱乐模拟网站，与 Anthropic 无关联。</strong>
          Claude 及相关名称仅用于讽刺性创意表达。所有广告、支付、奖励、会员均为模拟功能，不产生真实交易；
          本站不收集任何个人信息，所有数据仅保存在您的浏览器本地，清除浏览器数据即可完全重置。
        </p>
        <button onClick={() => navigate('/new')} className="btn btn-red mt-4">
          回到首页，继续体验
        </button>
      </section>
    </div>
  )
}
