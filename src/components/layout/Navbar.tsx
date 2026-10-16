import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, Crown, LogOut, Send } from 'lucide-react'
import { useUserStore } from '../../store/useUserStore'
import { useUIStore } from '../../store/useUIStore'
import { useSectionNav } from '../../lib/useSectionNav'
import { cn } from '../../lib/utils'
import { ClaudeMark, CoinIcon } from '../icons'
import AnimatedNumber from '../ui/AnimatedNumber'
import Modal from '../ui/Modal'

const MENU: Array<{ label: string; section?: string; path?: string }> = [
  { label: '首页', section: 'hero' },
  { label: 'AI 对话', section: 'chat' },
  { label: 'AI 绘画', path: '/paint' },
  { label: '任务中心', section: 'tasks' },
  { label: '金币商城', section: 'shop' },
  { label: '活动广场', section: 'wheel' },
  { label: '关于我们', path: '/about' },
]

const NOTIFICATIONS = [
  { title: '红包雨限时开启', desc: '点击红包雨活动卡片，金币等你来抢！', time: '刚刚' },
  { title: '签到提醒', desc: '连续签到第 7 天可得 50 金币哦～', time: '1 小时前' },
  { title: '砍一刀助力邀请', desc: '您的好友邀请您帮忙砍一刀！', time: '3 小时前' },
]

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const login = useUserStore((s) => s.login)
  const pushToast = useUIStore((s) => s.pushToast)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [agree, setAgree] = useState(true)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (countdown <= 0 && timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [countdown])
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      pushToast({ type: 'warn', title: '请输入正确的手机号' })
      return
    }
    setCountdown(60)
    timer.current = setInterval(() => setCountdown((c) => c - 1), 1000)
    setCode('8888')
    pushToast({ type: 'info', title: '验证码已发送（模拟）', desc: '这是娱乐模拟网站，验证码为 8888' })
  }

  const submit = () => {
    if (!/^1\d{10}$/.test(phone)) {
      pushToast({ type: 'warn', title: '请输入正确的手机号' })
      return
    }
    if (code !== '8888') {
      pushToast({ type: 'warn', title: '验证码不正确', desc: '模拟验证码为 8888' })
      return
    }
    if (!agree) {
      pushToast({ type: 'warn', title: '请先勾选同意用户协议' })
      return
    }
    const nick = `客官${phone.slice(-4)}`
    login(nick)
    pushToast({ type: 'success', title: `欢迎回家，${nick}！`, desc: '登录状态仅为本地模拟' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="登录 / 注册" sealChar="录" width="max-w-sm">
      <div className="space-y-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-faint">手机号</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="请输入手机号"
            inputMode="numeric"
            className="h-11 w-full rounded-xl border border-line bg-white/80 px-3.5 text-sm text-ink outline-none transition placeholder:text-faint/60 focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-faint">验证码</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="请输入验证码"
              inputMode="numeric"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white/80 px-3.5 text-sm text-ink outline-none transition placeholder:text-faint/60 focus:border-brand"
            />
            <button
              onClick={sendCode}
              disabled={countdown > 0}
              className="btn btn-ghost btn-sm flex-none px-3"
              style={{ height: 44 }}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-xs text-faint">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 accent-[#C62828]"
          />
          <span>
            我已阅读并同意 <span className="text-cred">《模拟用户协议》</span> 与{' '}
            <span className="text-cred">《娱乐免责声明》</span>。本站为娱乐模拟网站，不收集任何真实信息。
          </span>
        </label>
        <button onClick={submit} className="btn btn-red btn-lg w-full">
          登录 / 注册
        </button>
      </div>
    </Modal>
  )
}

export default function Navbar() {
  const coins = useUserStore((s) => s.coins)
  const coinPulse = useUIStore((s) => s.coinPulse)
  const loggedIn = useUserStore((s) => s.loggedIn)
  const nickname = useUserStore((s) => s.nickname)
  const isMember = useUserStore((s) => s.isMember)
  const logout = useUserStore((s) => s.logout)
  const pushToast = useUIStore((s) => s.pushToast)
  const goSection = useSectionNav()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [read, setRead] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300',
          scrolled
            ? 'border-b border-line/80 bg-[#FFFBF2]/90 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-[#FFFBF2]/60 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 md:px-6">
          {/* 品牌 */}
          <button onClick={() => goSection('hero')} className="flex items-center gap-2.5 text-left">
            <span className="text-brand">
              <ClaudeMark size={30} />
            </span>
            <span className="leading-tight">
              <span className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-wide text-ink">Claude</span>
                <span className="rounded-[5px] bg-gradient-to-br from-[#F04438] to-[#B91C1C] px-1.5 py-px text-[10px] font-bold text-white shadow-red">
                  中国版
                </span>
              </span>
              <span className="hidden text-[10px] tracking-[0.2em] text-faint sm:block">AI 也要入乡随俗</span>
            </span>
          </button>

          {/* 菜单 */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {MENU.map((m) => (
              <button
                key={m.label}
                onClick={() => (m.path ? navigate(m.path) : goSection(m.section!))}
                className={cn(
                  'rounded-lg px-3 py-2 text-[13px] font-medium text-body transition hover:bg-cred-soft/60 hover:text-cred',
                )}
              >
                {m.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:gap-2.5">
            {/* 金币余额 */}
            <button
              id="nav-coin"
              onClick={() => goSection('shop')}
              className="flex h-9 items-center gap-1.5 rounded-full border border-gold/50 bg-gold-soft px-3 transition hover:border-gold"
              title="金币余额，点击前往金币商城"
            >
              <motion.span
                key={coinPulse}
                animate={{ scale: [1, 1.35, 1], rotate: [0, -12, 0] }}
                transition={{ duration: 0.5 }}
                className="flex"
              >
                <CoinIcon size={17} />
              </motion.span>
              <span className="text-sm font-bold text-gold-deep tabular-nums">
                <AnimatedNumber value={coins} />
              </span>
            </button>

            {/* 通知 */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/70 text-body transition hover:border-gold hover:text-gold-deep"
                aria-label="通知"
              >
                <Bell size={16} />
                {!read && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cred anim-blink" />}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      className="card absolute right-0 top-11 z-20 w-80 p-3"
                      style={{ background: '#FFFBF2' }}
                    >
                      <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-sm font-bold text-ink">通知</span>
                        <button
                          onClick={() => setRead(true)}
                          className="text-xs text-faint transition hover:text-cred"
                        >
                          全部已读
                        </button>
                      </div>
                      <div className="space-y-1">
                        {NOTIFICATIONS.map((n) => (
                          <div key={n.title} className="rounded-lg px-2 py-2 transition hover:bg-card-deep">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-ink">{n.title}</span>
                              <span className="ml-auto text-[10px] text-faint">{n.time}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-faint">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 登录 */}
            {loggedIn ? (
              <div className="relative group">
                <button className="flex h-9 items-center gap-2 rounded-full border border-line bg-white/70 pl-1 pr-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-xs font-bold text-white">
                    {nickname.slice(0, 1)}
                  </span>
                  <span className="hidden max-w-20 truncate text-xs font-medium text-ink sm:block">{nickname}</span>
                  <ChevronDown size={13} className="text-faint" />
                </button>
                <div className="card invisible absolute right-0 top-11 z-20 w-44 p-2 opacity-0 shadow-lift transition-all group-hover:visible group-hover:opacity-100" style={{ background: '#FFFBF2' }}>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-body">
                    <Crown size={14} className="text-gold" />
                    {isMember() ? '尊享会员生效中' : '普通客官'}
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      pushToast({ type: 'info', title: '已退出登录（模拟）' })
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-body transition hover:bg-cred-soft hover:text-cred"
                  >
                    <LogOut size={14} /> 退出登录
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="btn btn-red btn-sm h-9">
                <Send size={13} />
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
