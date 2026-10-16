import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Link2, Lock, Settings, X } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { useUserStore } from '../../store/useUserStore'
import { cn } from '../../lib/utils'

/** 分享会话弹窗：claude.ai Share session 原型同款（主视图 + 设置子视图，全模拟） */
export default function ShareModal({
  open,
  onClose,
  chatId,
}: {
  open: boolean
  onClose: () => void
  chatId: string
}) {
  const pushToast = useUIStore((s) => s.pushToast)
  const nickname = useUserStore((s) => s.nickname)
  const phone = useUserStore((s) => s.phone)
  const loggedIn = useUserStore((s) => s.loggedIn)

  const [view, setView] = useState<'main' | 'settings'>('main')
  const [email, setEmail] = useState('')
  const [access, setAccess] = useState<'invited' | 'link'>('invited')
  const [draftAccess, setDraftAccess] = useState<'invited' | 'link'>('invited')
  const [accessOpen, setAccessOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const displayName = loggedIn ? nickname : '访客'
  const subLine = loggedIn && phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}（模拟账号）` : '未登录 · 模拟账号'

  useEffect(() => {
    if (!open) {
      setView('main')
      setEmail('')
      setAccessOpen(false)
      setCopied(false)
    }
  }, [open])

  const copyLink = () => {
    const link = `${location.origin}/chat/${chatId}`
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true)
        pushToast({ type: 'success', title: '分享链接已复制', desc: link })
        setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => pushToast({ type: 'warn', title: '复制失败，请手动复制', desc: link }))
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-lift"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16 }}
          >
            {view === 'main' ? (
              <>
                <div className="px-6 pt-5">
                  <div className="flex items-start justify-between">
                    <h2 className="text-[18px] font-bold text-ink">分享会话</h2>
                    <button
                      onClick={onClose}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-black/5 hover:text-ink"
                      aria-label="关闭"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="mt-1 text-[13.5px] text-faint">仅分享截止当前的消息内容</p>

                  {/* 邮箱邀请 */}
                  <div className="mt-4 flex gap-2">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="通过邮箱添加用户"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none transition placeholder:text-faint/60 focus:border-brand"
                    />
                    <button
                      disabled={!email.trim()}
                      onClick={() => {
                        pushToast({ type: 'success', title: `邀请已发送（模拟）`, desc: `邀请邮件将发送至 ${email.trim()}` })
                        setEmail('')
                      }}
                      className="h-11 flex-none rounded-xl border border-line bg-white px-4 text-[13.5px] font-medium text-body transition enabled:hover:bg-card-deep disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      邀请
                    </button>
                  </div>

                  {/* 访问权限 */}
                  <p className="mt-5 text-[13px] text-faint">访问权限</p>
                  <button
                    onClick={() => setView('settings')}
                    className="mt-1.5 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-black/[0.04]"
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black/[0.06] text-faint">
                      <Lock size={16} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-ink">
                      {access === 'invited' ? '仅受邀用户' : '任何拥有链接的人'}
                    </span>
                    <ChevronRight size={15} className="flex-none text-faint" />
                  </button>
                  <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <span
                      className={cn(
                        'flex h-10 w-10 flex-none items-center justify-center rounded-full text-[13px] font-bold',
                        loggedIn ? 'bg-gradient-to-br from-brand to-brand-deep text-white' : 'bg-black/[0.06] text-faint',
                      )}
                    >
                      {displayName.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] text-ink">
                        <span className="font-semibold">{displayName}</span>
                        <span className="text-faint">（你）</span>
                      </span>
                      <span className="block truncate text-[12.5px] text-faint">{subLine}</span>
                    </span>
                    <span className="ml-auto flex-none text-[13px] text-faint">所有者</span>
                  </div>

                  <p className="mt-4 text-[12px] leading-relaxed text-faint">
                    请勿在未经许可的情况下分享个人信息或第三方内容，查看
                    <span
                      className="cursor-pointer text-[#2C84DB] underline"
                      onClick={() => pushToast({ type: 'info', title: '使用政策（模拟）' })}
                    >
                      使用政策
                    </span>
                    。
                  </p>
                </div>

                {/* 底部：设置图标 + 复制链接 */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-line px-5 py-4">
                  <button
                    onClick={() => setView('settings')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-body transition hover:bg-card-deep"
                    aria-label="分享设置"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex h-10 items-center gap-2 rounded-full bg-ink px-4.5 text-[14px] font-semibold text-white transition hover:bg-black"
                  >
                    <Link2 size={14} /> {copied ? '已复制' : '复制链接'}
                  </button>
                </div>
              </>
            ) : (
              /* 设置子视图 */
              <div className="px-6 pb-6 pt-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('main')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-black/5"
                    aria-label="返回"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-[18px] font-bold text-ink">分享设置</h2>
                  <button
                    onClick={onClose}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-black/5 hover:text-ink"
                    aria-label="关闭"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="mt-5 text-[13px] text-faint">访问权限</p>
                <div className="relative mt-2">
                  <button
                    onClick={() => setAccessOpen((v) => !v)}
                    className="flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 text-left text-[14.5px] font-semibold text-ink transition hover:bg-card-deep"
                  >
                    <Lock size={15} className="text-faint" />
                    <span className="min-w-0 flex-1 truncate">
                      {draftAccess === 'invited' ? '仅受邀用户' : '任何拥有链接的人'}
                    </span>
                    <ChevronRight
                      size={14}
                      className={cn('flex-none text-faint transition', accessOpen && 'rotate-90')}
                    />
                  </button>
                  {accessOpen && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-line bg-white p-1.5 shadow-lift">
                      {(
                        [
                          { key: 'invited', label: '仅受邀用户', desc: '只有受邀请的用户可以查看' },
                          { key: 'link', label: '任何拥有链接的人', desc: '拥有链接的任何人都可以查看' },
                        ] as const
                      ).map((o) => (
                        <button
                          key={o.key}
                          onClick={() => {
                            setDraftAccess(o.key)
                            setAccessOpen(false)
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-black/[0.04]"
                        >
                          <span className="block text-[13.5px] font-semibold text-ink">{o.label}</span>
                          <span className="block text-[11.5px] text-faint">{o.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDraftAccess(access)
                      setView('main')
                    }}
                    className="h-10 rounded-xl border border-line bg-white px-4 text-[13.5px] font-medium text-body transition hover:bg-card-deep"
                  >
                    返回
                  </button>
                  <button
                    disabled={draftAccess === access}
                    onClick={() => {
                      setAccess(draftAccess)
                      setView('main')
                      pushToast({ type: 'success', title: '分享设置已更新（模拟）' })
                    }}
                    className="h-10 rounded-xl bg-ink px-5 text-[13.5px] font-semibold text-white transition enabled:hover:bg-black disabled:cursor-not-allowed disabled:bg-[#B8B5AC]"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
