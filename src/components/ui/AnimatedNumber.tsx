import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

/** 数字滚动动画 */
export default function AnimatedNumber({
  value,
  decimals = 0,
  className,
}: {
  value: number
  decimals?: number
  className?: string
}) {
  const mv = useMotionValue(0)
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, mv])
  const text = useTransform(mv, (v) => v.toFixed(decimals))
  return <motion.span className={className}>{text}</motion.span>
}
