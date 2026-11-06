import { useId, type ReactNode } from 'react'
import type { PartType } from '@/circuit/types'
import { cn } from '@/lib/utils'

/*
 * Small drawings of each part, made to match the 3D models on the board:
 * the same copper-ended battery, wooden knife switch, colour-banded resistor
 * and so on. Light comes from the top left; every part sits on a soft shadow.
 */

type ArtProps = { id: string }

function Shadow({ y = 42, rx = 14 }: { y?: number; rx?: number }) {
  return <ellipse cx="24" cy={y} rx={rx} ry="2.2" fill="currentColor" opacity="0.12" />
}

function Battery({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#52525b" />
          <stop offset="1" stopColor="#18181b" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="0.55" stopColor="#d97706" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <Shadow y={36} rx={18} />
      <rect x="41" y="20.5" width="3.5" height="7" rx="1.4" fill="#a1a1aa" />
      <rect x="5" y="15.5" width="37" height="17" rx="4.5" fill={`url(#${id}b)`} />
      <path d="M29 15.5h8.5a4.5 4.5 0 0 1 4.5 4.5v8a4.5 4.5 0 0 1-4.5 4.5H29z" fill={`url(#${id}c)`} />
      <path d="M35.5 21.5v5M33 24h5" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="8" y="17.5" width="31" height="2.2" rx="1.1" fill="#fff" opacity="0.22" />
    </>
  )
}

function Switch({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecc28f" />
          <stop offset="1" stopColor="#b9814a" />
        </linearGradient>
      </defs>
      <Shadow y={41} rx={19} />
      <rect x="5" y="30" width="38" height="9" rx="2.5" fill={`url(#${id}w)`} />
      <rect x="6.5" y="30.8" width="35" height="1.6" rx="0.8" fill="#fff" opacity="0.35" />
      <circle cx="8.5" cy="35" r="1.5" fill="#eab308" />
      <circle cx="39.5" cy="35" r="1.5" fill="#eab308" />
      <rect x="11" y="23" width="5" height="8" rx="1" fill="#c2410c" />
      <rect x="32" y="23" width="5" height="8" rx="1" fill="#c2410c" />
      <rect x="11" y="23" width="5" height="1.6" rx="0.8" fill="#fdba74" opacity="0.7" />
      <rect x="32" y="23" width="5" height="1.6" rx="0.8" fill="#fdba74" opacity="0.7" />
      <path d="M13.5 25.5 33 12.5" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
      <path d="M13.8 24.6 32.4 12.2" stroke="#fed7aa" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
      <rect x="31" y="7.5" width="6" height="7.5" rx="3" transform="rotate(-34 34 11.25)" fill="#ef4444" />
      <circle cx="13.5" cy="25.5" r="1.6" fill="#7c2d12" />
    </>
  )
}

function Button({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
      </defs>
      <Shadow y={42} rx={16} />
      <rect x="12" y="36" width="2.2" height="5" fill="#a1a1aa" />
      <rect x="33.8" y="36" width="2.2" height="5" fill="#a1a1aa" />
      <rect x="8" y="21" width="32" height="17" rx="4" fill={`url(#${id}d)`} />
      <ellipse cx="24" cy="22.5" rx="12" ry="4.2" fill="#6b7280" />
      <path d="M15.5 14.5v6a8.5 3.3 0 0 0 17 0v-6z" fill="#db2777" />
      <ellipse cx="24" cy="14.5" rx="8.5" ry="3.3" fill="#f472b6" />
      <ellipse cx="21.5" cy="13.8" rx="3.6" ry="1.1" fill="#fff" opacity="0.45" />
    </>
  )
}

function Dimmer({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}t`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0f766e" />
        </radialGradient>
        <radialGradient id={`${id}k`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#52525b" />
          <stop offset="1" stopColor="#09090b" />
        </radialGradient>
      </defs>
      <Shadow y={43} rx={12} />
      <rect x="16" y="32" width="2.2" height="10" fill="#a1a1aa" />
      <rect x="22.9" y="32" width="2.2" height="10" fill="#a1a1aa" />
      <rect x="29.8" y="32" width="2.2" height="10" fill="#a1a1aa" />
      <circle cx="24" cy="21" r="14" fill={`url(#${id}t)`} />
      {[-120, -60, 0, 60, 120].map((a) => (
        <rect key={a} x="23.4" y="8.2" width="1.2" height="2.6" rx="0.6" fill="#ccfbf1" transform={`rotate(${a} 24 21)`} />
      ))}
      <circle cx="24" cy="21" r="8.5" fill={`url(#${id}k)`} />
      <path d="M24 21l4.6-4.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
}

function Resistor({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e7c6" />
          <stop offset="1" stopColor="#cfae7c" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <rect x="11" y="17" width="26" height="14" rx="7" />
        </clipPath>
      </defs>
      <Shadow y={36} rx={15} />
      <path d="M2.5 24h43" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="11" y="17" width="26" height="14" rx="7" fill={`url(#${id}r)`} />
      <g clipPath={`url(#${id}clip)`}>
        <rect x="16" y="17" width="2.8" height="14" fill="#7c3f12" />
        <rect x="21" y="17" width="2.8" height="14" fill="#1c1917" />
        <rect x="26" y="17" width="2.8" height="14" fill="#7c3f12" />
        <rect x="31.2" y="17" width="2.2" height="14" fill="#d4a017" />
      </g>
      <rect x="13.5" y="19" width="21" height="2" rx="1" fill="#fff" opacity="0.4" />
    </>
  )
}

function Lamp({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}g`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#fffdf3" />
          <stop offset="0.7" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fcd34d" />
        </radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b7280" />
          <stop offset="0.4" stopColor="#d4d4d8" />
          <stop offset="1" stopColor="#71717a" />
        </linearGradient>
      </defs>
      <Shadow y={44} rx={9} />
      <path
        d="M14 17a10 10 0 1 1 16.4 7.7c-1.4 1.2-2.1 2.2-2.2 4.3h-8.4c-.1-2.1-.8-3.1-2.2-4.3A10 10 0 0 1 14 17z"
        fill={`url(#${id}g)`}
        stroke="#e7c873"
        strokeWidth="0.8"
      />
      <path d="M21 25v-6M27 25v-6" stroke="#9ca3af" strokeWidth="1" />
      <path d="M21 19l1.2-2.6 1.2 2.6 1.2-2.6 1.2 2.6 1.2-2.6L27 19" fill="none" stroke="#b45309" strokeWidth="1.1" strokeLinejoin="round" />
      <ellipse cx="19.5" cy="12.5" rx="2.2" ry="3.2" fill="#fff" opacity="0.7" />
      <rect x="18.5" y="29" width="11" height="10" rx="1.5" fill={`url(#${id}s)`} />
      <path d="M18.5 32h11M18.5 35.5h11" stroke="#52525b" strokeWidth="0.9" opacity="0.6" />
      <path d="M21 39h6l-1.2 2.6h-3.6z" fill="#3f3f46" />
    </>
  )
}

function Led({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fca5a5" />
          <stop offset="0.45" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <Shadow y={44} rx={10} />
      <path d="M21 30v14M27 30v10" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="15" y="27" width="18" height="4" rx="1.4" fill="#dc2626" />
      <path d="M17 28V16.5a7 7 0 0 1 14 0V28z" fill={`url(#${id}l)`} />
      <rect x="19.3" y="13" width="2.2" height="11" rx="1.1" fill="#fff" opacity="0.55" />
      <path d="M22.5 24.5h3l-.6-3.5h-1.8z" fill="#7f1d1d" opacity="0.5" />
    </>
  )
}

function Motor({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9ca3af" />
          <stop offset="0.5" stopColor="#4b5563" />
          <stop offset="1" stopColor="#1f2937" />
        </linearGradient>
      </defs>
      <Shadow y={38} rx={17} />
      <rect x="39" y="19" width="4" height="2.6" rx="0.8" fill="#d4d4d8" />
      <rect x="39" y="26.4" width="4" height="2.6" rx="0.8" fill="#d4d4d8" />
      <rect x="16" y="15" width="24" height="18" rx="3.5" fill={`url(#${id}m)`} />
      <rect x="27" y="15" width="4" height="18" fill="#0ea5e9" opacity="0.9" />
      <ellipse cx="16" cy="24" rx="3.2" ry="9" fill="#d1d5db" />
      <rect x="8" y="23" width="8" height="2" rx="1" fill="#e5e7eb" />
      <g transform="translate(8 24)">
        <ellipse cy="-6.2" rx="2.7" ry="5.6" fill="#f97316" />
        <ellipse cy="-6.2" rx="2.7" ry="5.6" fill="#0ea5e9" transform="rotate(120)" />
        <ellipse cy="-6.2" rx="2.7" ry="5.6" fill="#22c55e" transform="rotate(240)" />
        <circle r="1.9" fill="#f4f4f5" stroke="#71717a" strokeWidth="0.6" />
      </g>
    </>
  )
}

function Buzzer({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}z`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f3f46" />
          <stop offset="1" stopColor="#09090b" />
        </linearGradient>
      </defs>
      <Shadow y={38} rx={15} />
      <path d="M10 21v9a13 5 0 0 0 26 0v-9z" fill={`url(#${id}z)`} />
      <rect x="18" y="31.5" width="10" height="2.6" rx="1.1" fill="#8b5cf6" />
      <ellipse cx="23" cy="21" rx="13" ry="5" fill="#52525b" />
      <ellipse cx="23" cy="21" rx="3.4" ry="1.4" fill="#09090b" />
      <path d="M31.5 19.2h2.6M32.8 17.9v2.6" stroke="#e4e4e7" strokeWidth="0.9" strokeLinecap="round" />
      <path
        d="M39 13.5a8 8 0 0 1 0 11M42.5 10.5a12.5 12.5 0 0 1 0 17"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
    </>
  )
}

const ART: Record<PartType, (p: ArtProps) => ReactNode> = {
  battery: Battery,
  switch: Switch,
  button: Button,
  dimmer: Dimmer,
  resistor: Resistor,
  lamp: Lamp,
  led: Led,
  motor: Motor,
  buzzer: Buzzer,
}

/** A drawing of a part. `size` is the width and height in pixels. */
export function PartArt({ partType, size = 40, className }: { partType: PartType; size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  const Art = ART[partType]
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className={cn('shrink-0 text-foreground', className)}>
      <Art id={id} />
    </svg>
  )
}
