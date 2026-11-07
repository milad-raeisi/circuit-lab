import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Circuit Lab's logo: one loop of wire with a battery on the left, closed by a
 * lit bulb at the top. This is the bold small-size drawing (the same as
 * public/favicon.svg); public/logo.svg is the detailed one for large sizes.
 */
export function BrandLogo({ className }: { className?: string }) {
  // gradient ids must be unique when the logo appears twice on a page
  const id = useId()
  const tile = `${id}-tile`
  const bulb = `${id}-bulb`
  return (
    <svg viewBox="0 0 512 512" className={cn('shrink-0', className)} aria-hidden>
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b5cff" />
          <stop offset="1" stopColor="#4330da" />
        </linearGradient>
        <radialGradient id={bulb} cx="0.38" cy="0.34" r="0.7">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.45" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${tile})`} />
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M200 196H206a70 70 0 0 0-70 70V268M136 336V350a70 70 0 0 0 70 70H318a70 70 0 0 0 70-70V266a70 70 0 0 0-70-70H328"
          strokeWidth="48"
        />
        <path d="M84 268H188" strokeWidth="22" />
        <path d="M110 336H162" strokeWidth="38" />
      </g>
      <g stroke="#fde047" strokeWidth="22" strokeLinecap="round">
        <path d="M264 104V74" />
        <path d="M330 136L354 118" />
        <path d="M198 136L174 118" />
      </g>
      <circle cx="264" cy="196" r="66" fill={`url(#${bulb})`} />
    </svg>
  )
}
