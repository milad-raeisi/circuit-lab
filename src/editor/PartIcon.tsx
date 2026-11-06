import type { ComponentProps } from 'react'
import { BatteryCharging } from '@/components/animate-ui/icons/battery-charging'
import { BellRing } from '@/components/animate-ui/icons/bell-ring'
import { Fan } from '@/components/animate-ui/icons/fan'
import { Gauge } from '@/components/animate-ui/icons/gauge'
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb'
import { PlugZap } from '@/components/animate-ui/icons/plug-zap'
import { SlidersHorizontal } from '@/components/animate-ui/icons/sliders-horizontal'
import { Sparkles } from '@/components/animate-ui/icons/sparkles'
import { ToggleRight } from '@/components/animate-ui/icons/toggle-right'
import type { PartType } from '@/circuit/types'

const ICONS = {
  battery: BatteryCharging,
  switch: ToggleRight,
  button: PlugZap,
  dimmer: SlidersHorizontal,
  resistor: Gauge,
  lamp: Lightbulb,
  led: Sparkles,
  motor: Fan,
  buzzer: BellRing,
} satisfies Record<PartType, unknown>

type IconProps = ComponentProps<typeof Lightbulb>

/** Animated Animate UI icon for a part type. */
export function PartIcon({ partType, ...props }: { partType: PartType } & IconProps) {
  const Icon = ICONS[partType] as (p: IconProps) => React.ReactNode
  return <Icon {...props} />
}
