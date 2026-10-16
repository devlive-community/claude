import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ClaudeMark } from '../components/icons'

/** 404：不存在的路径（claude.ai 同款极简风格） */
export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-[calc(100vh-52px)] flex-col items-center justify-center px-4 pb-16 lg:min-h-screen">
      <span className="text-brand">
        <ClaudeMark size={44} />
      </span>
      <h1 className="mt-6 font-serif text-[56px] font-bold leading-none tracking-tight text-ink">404</h1>
      <p className="mt-3 font-serif text-[20px] font-semibold text-ink">此页面不存在。</p>
      <p className="mt-2 max-w-sm text-center text-[13.5px] leading-relaxed text-faint">
        你访问的路径可能已被移动、删除，或者从未存在过。
      </p>
      <button
        onClick={() => navigate('/new')}
        className="mt-7 flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-white transition hover:bg-black"
      >
        <ArrowLeft size={15} /> 返回新对话
      </button>
    </div>
  )
}
