import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Coffee, GraduationCap, Palette, PenLine } from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { useSectionNav } from '../../lib/useSectionNav'

const ACTIONS = [
  {
    title: 'AI 写作',
    desc: '文案、论文、邮件',
    icon: PenLine,
    cls: 'text-[#4C6FA5] bg-[#EDF3FB]',
    prompt: '帮我写一篇关于「秋天的第一杯奶茶」的朋友圈文案，要皮一点但要体面。',
  },
  {
    title: '代码编程',
    desc: '生成代码、调试优化',
    icon: Code2,
    cls: 'text-emerald-700 bg-emerald-50',
    prompt: '用 Python 写一个快速排序，带注释。',
  },
  {
    title: 'AI 绘画',
    desc: '一句话生成精美图片',
    icon: Palette,
    cls: 'text-purple-600 bg-purple-50',
    to: '/paint',
  },
  {
    title: '生活百科',
    desc: '旅游攻略、美食推荐',
    icon: Coffee,
    cls: 'text-[#C07A2B] bg-[#FBF0DE]',
    prompt: '推荐一份成都三日游的美食攻略，预算友好，本地人常去的那种。',
  },
  {
    title: '学习辅导',
    desc: '答疑解惑、知识整理',
    icon: GraduationCap,
    cls: 'text-[#4C6FA5] bg-[#EDF3FB]',
    prompt: '用通俗的话解释一下什么是递归，最好举个例子。',
  },
]

export default function QuickActions() {
  const setDraft = useChatStore((s) => s.setDraft)
  const go = useSectionNav()
  const navigate = useNavigate()

  const onClick = (a: (typeof ACTIONS)[number]) => {
    if (a.to) {
      navigate(a.to)
      return
    }
    setDraft(a.prompt!)
    go('chat')
  }

  return (
    <section id="quick" className="area-quick order-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon
          return (
            <motion.button
              key={a.title}
              onClick={() => onClick(a)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="card card-hover flex items-center gap-3 p-4 text-left"
            >
              <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ${a.cls}`}>
                <Icon size={21} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{a.title}</span>
                <span className="block truncate text-[11px] text-faint">{a.desc}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
