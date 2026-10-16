import ChatSection from '../components/sections/ChatSection'
import QuickActions from '../components/sections/QuickActions'
import PageHeader from '../components/ui/PageHeader'
import { useUserStore, FREE_CHATS_PER_DAY } from '../store/useUserStore'

/** AI 对话页 */
export default function ChatPage() {
  const remaining = useUserStore((s) => s.chatsRemaining())
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-20 md:px-6 md:pt-24">
      <PageHeader
        seal="聊"
        title="AI 对话"
        sub="多轮对话 · Markdown · 代码块，回复为本地模拟生成，额度与其他活动联动"
        right={
          <span className="rounded-full border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 tabular-nums">
            今日剩余 {remaining} / {FREE_CHATS_PER_DAY} 次
          </span>
        }
      />
      <ChatSection />
      <div className="mt-4">
        <QuickActions />
      </div>
    </div>
  )
}
