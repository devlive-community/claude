import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

/* 轻量 Markdown 渲染：代码块、行内代码、加粗、斜体、链接、标题、列表、引用、分割线 */

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-[#3a2b1e]">
      <div className="flex items-center justify-between bg-[#231910] px-3.5 py-2">
        <span className="font-mono text-[11px] tracking-wide text-[#C9A86A]">{lang || 'code'}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#C9A86A] transition hover:bg-white/10 hover:text-[#F5D98B]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="nice-scroll overflow-x-auto bg-[#2B1F16] p-3.5">
        <code className="font-mono text-[12.5px] leading-relaxed text-[#EFE2CB]">{code}</code>
      </pre>
    </div>
  )
}

function inline(text: string, prefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${prefix}-${i++}`
    if (tok.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-bold text-ink">
          {tok.slice(2, -2)}
        </strong>,
      )
    } else if (tok.startsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-[#F0E4CE] px-1 py-0.5 font-mono text-[12px] text-[#8E4A20]">
          {tok.slice(1, -1)}
        </code>,
      )
    } else if (tok.startsWith('[')) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)
      nodes.push(
        <a key={key} href={mm?.[2]} target="_blank" rel="noreferrer" className="text-brand underline decoration-brand/40 underline-offset-2">
          {mm?.[1]}
        </a>,
      )
    } else {
      nodes.push(
        <em key={key} className="text-faint">
          {tok.slice(1, -1)}
        </em>,
      )
    }
    last = m.index + tok.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function renderBlocks(src: string, prefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const lines = src.split('\n')
  let list: string[] = []
  let ordered = false
  let key = 0

  const flushList = () => {
    if (!list.length) return
    const Tag = ordered ? 'ol' : 'ul'
    out.push(
      <Tag
        key={`${prefix}-l${key++}`}
        className={`my-1.5 space-y-1 pl-1 ${ordered ? 'list-none' : 'list-none'}`}
      >
        {list.map((item, idx) => (
          <li key={idx} className="flex gap-2">
            <span className={`mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${ordered ? 'bg-cred' : 'bg-gold'}`} />
            <span>{inline(item, `${prefix}-li${idx}`)}</span>
          </li>
        ))}
      </Tag>,
    )
    list = []
  }

  lines.forEach((raw) => {
    const line = raw.trimEnd()
    if (/^\s*[-*]\s+/.test(line)) {
      if (ordered) flushList()
      ordered = false
      list.push(line.replace(/^\s*[-*]\s+/, ''))
      return
    }
    if (/^\s*\d+[.、]\s+/.test(line)) {
      if (!ordered) flushList()
      ordered = true
      list.push(line.replace(/^\s*\d+[.、]\s+/, ''))
      return
    }
    flushList()
    if (!line.trim()) return
    const h = /^(#{1,4})\s+(.*)/.exec(line)
    if (h) {
      const level = h[1].length
      out.push(
        <p
          key={`${prefix}-h${key++}`}
          className={`mt-2.5 mb-1 font-serif font-bold text-ink ${level <= 2 ? 'text-[15.5px]' : 'text-[14px]'}`}
        >
          {inline(h[2], `${prefix}-h${key}`)}
        </p>,
      )
      return
    }
    if (/^>\s?/.test(line)) {
      out.push(
        <blockquote
          key={`${prefix}-q${key++}`}
          className="my-1.5 rounded-r-lg border-l-[3px] border-gold bg-gold-soft/45 py-1.5 pl-3 pr-2 text-[12.5px] text-faint"
        >
          {inline(line.replace(/^>\s?/, ''), `${prefix}-q${key}`)}
        </blockquote>,
      )
      return
    }
    if (/^-{3,}$/.test(line)) {
      out.push(<hr key={`${prefix}-hr${key++}`} className="my-2.5 border-line" />)
      return
    }
    out.push(
      <p key={`${prefix}-p${key++}`} className="my-1">
        {inline(line, `${prefix}-p${key}`)}
      </p>,
    )
  })
  flushList()
  return out
}

/** 渲染 Markdown 文本（支持 ``` 代码块） */
export function renderMarkdown(src: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /```(\w*)\n?([\s\S]*?)(?:```|$)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = regex.exec(src)) !== null) {
    if (m.index > last) parts.push(...renderBlocks(src.slice(last, m.index), `s${i}`))
    parts.push(<CodeBlock key={`cb${i++}`} code={m[2].replace(/\n$/, '')} lang={m[1]} />)
    last = m.index + m[0].length
  }
  if (last < src.length) parts.push(...renderBlocks(src.slice(last), `s${i}`))
  return parts
}
