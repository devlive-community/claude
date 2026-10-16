/** Claude 风格星芒 Logo */
export function ClaudeMark({ size = 28, className }: { size?: number; className?: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 360) / 12)
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="3.1" strokeLinecap="round">
        {rays.map((deg) => (
          <line
            key={deg}
            x1="16"
            y1={16 - (deg % 30 === 0 ? 13.5 : 11.5)}
            x2="16"
            y2="5.5"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
      </g>
    </svg>
  )
}

/** 国风铜钱金币（外圆内方） */
export function CoinIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id="coin-g" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#F5D98B" />
          <stop offset="55%" stopColor="#D4A24C" />
          <stop offset="100%" stopColor="#B8862F" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#coin-g)" stroke="#8F6520" strokeWidth="1" />
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="#8F6520" strokeWidth="0.9" opacity="0.55" />
      <rect x="9.4" y="9.4" width="5.2" height="5.2" rx="0.8" fill="#FFF4DE" stroke="#8F6520" strokeWidth="0.9" />
    </svg>
  )
}

/** 红色印章方块 */
export function SealMark({ char, className }: { char: string; className?: string }) {
  return <span className={`seal ${className ?? ''}`}>{char}</span>
}
