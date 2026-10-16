import { useLocation, useNavigate } from 'react-router-dom'

/** 跳转到首页某个区块（跨页面时先回首页） */
export function useSectionNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (id: string) => {
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(scroll, 160)
    } else {
      scroll()
    }
  }
}
