import type {
  LampColor,
  LedColor,
  PartData,
  PartType,
  Rotation,
  Side,
  TerminalId,
  WireColor,
} from './types'

export type PartCategory = 'power' | 'control' | 'output'

export type TerminalDef = {
  side: Side
  polarity?: '+' | '-'
}

export type PartDef = {
  category: PartCategory
  /** Brand colour used for chips, glows and the minimap. */
  accent: string
  terminals: Record<TerminalId, TerminalDef>
  defaults: Omit<PartData, 'type' | 'rotation'>
}

/**
 * Electrical constants. Values are picked so that the classic beginner
 * circuits behave the way children expect from real toy kits:
 * 1.5 V makes a lamp glow dimly, 3 V lights it nicely and 9 V burns it out.
 */
export const ELECTRICAL = {
  wireResistance: 0.01,
  contactResistance: 0.01,
  /** internal resistance per 1.5 V cell */
  cellResistance: 0.3,
  /** a battery delivering more than this is treated as short-circuited */
  shortCircuitCurrent: 2,
  lamp: { resistance: 10, ratedPower: 0.9, burnRatio: 2.8, overRatio: 1.6 },
  motor: { resistance: 4, ratedVoltage: 3, stallSpeed: 0.12, overSpeed: 1.8 },
  buzzer: { resistance: 50, onCurrent: 0.015, ratedCurrent: 0.06 },
  led: {
    seriesResistance: 15,
    fullCurrent: 0.02,
    overCurrent: 0.04,
    burnCurrent: 0.15,
  },
  resistor: { ratedPower: 0.5 },
  dimmer: { minResistance: 2, maxResistance: 150 },
} as const

export const BATTERY_VOLTAGES = [1.5, 3, 4.5, 9] as const
export const RESISTOR_VALUES = [10, 47, 100, 220, 470, 1000] as const

export const LED_FORWARD_VOLTAGE: Record<LedColor, number> = {
  red: 1.8,
  yellow: 2.0,
  green: 2.2,
  blue: 2.9,
  white: 2.9,
}

export const LED_COLORS: Record<LedColor, string> = {
  red: '#ff3b3b',
  yellow: '#ffd21f',
  green: '#22e06b',
  blue: '#3b82ff',
  white: '#f4f7ff',
}

export const LAMP_COLORS: Record<LampColor, string> = {
  warm: '#ffd38a',
  yellow: '#fff06a',
  red: '#ff6b6b',
  green: '#7dff9b',
  blue: '#8ab8ff',
}

export const WIRE_COLORS: Record<WireColor, string> = {
  red: '#ef4444',
  black: '#27272a',
  blue: '#3b82f6',
  yellow: '#facc15',
  green: '#22c55e',
  white: '#e4e4e7',
}

export const PART_ORDER: PartType[] = [
  'battery',
  'switch',
  'button',
  'dimmer',
  'resistor',
  'lamp',
  'led',
  'motor',
  'buzzer',
]

const twoWay: Record<TerminalId, TerminalDef> = {
  a: { side: 'left' },
  b: { side: 'right' },
}

export const PARTS: Record<PartType, PartDef> = {
  battery: {
    category: 'power',
    accent: '#f59e0b',
    // + on the right so current leaves to the right on a fresh board
    terminals: { a: { side: 'right', polarity: '+' }, b: { side: 'left', polarity: '-' } },
    defaults: { voltage: 3 },
  },
  switch: { category: 'control', accent: '#6366f1', terminals: twoWay, defaults: { closed: false } },
  button: { category: 'control', accent: '#ec4899', terminals: twoWay, defaults: {} },
  dimmer: { category: 'control', accent: '#14b8a6', terminals: twoWay, defaults: { level: 0.7 } },
  resistor: { category: 'control', accent: '#a16207', terminals: twoWay, defaults: { resistance: 100 } },
  lamp: { category: 'output', accent: '#facc15', terminals: twoWay, defaults: { color: 'warm' } },
  led: {
    category: 'output',
    accent: '#ef4444',
    terminals: { a: { side: 'left', polarity: '+' }, b: { side: 'right', polarity: '-' } },
    defaults: { color: 'red' },
  },
  motor: { category: 'output', accent: '#0ea5e9', terminals: twoWay, defaults: {} },
  buzzer: { category: 'output', accent: '#8b5cf6', terminals: twoWay, defaults: {} },
}

const SIDES_CLOCKWISE: Side[] = ['left', 'top', 'right', 'bottom']

export function rotateSide(side: Side, rotation: Rotation): Side {
  const index = SIDES_CLOCKWISE.indexOf(side)
  return SIDES_CLOCKWISE[(index + rotation / 90) % 4]
}

export function nextRotation(rotation: Rotation): Rotation {
  return ((rotation + 90) % 360) as Rotation
}

export function batteryResistance(voltage: number): number {
  const cells = Math.max(1, Math.round(voltage / 1.5))
  return cells * ELECTRICAL.cellResistance
}

export function dimmerResistance(level: number): number {
  const { minResistance, maxResistance } = ELECTRICAL.dimmer
  const clamped = Math.min(1, Math.max(0, level))
  return minResistance + (maxResistance - minResistance) * (1 - clamped) ** 1.5
}

export function createPartData(type: PartType): PartData {
  return { type, rotation: 0, ...PARTS[type].defaults }
}

/** 4-band resistor colour code: two digits, multiplier, gold tolerance. */
const BAND_COLORS = [
  '#1c1917', // black
  '#7c3f12', // brown
  '#dc2626', // red
  '#f97316', // orange
  '#facc15', // yellow
  '#16a34a', // green
  '#2563eb', // blue
  '#7c3aed', // violet
  '#9ca3af', // grey
  '#fafafa', // white
]

export function resistorBands(ohms: number): string[] {
  const exponent = Math.max(0, Math.floor(Math.log10(ohms)) - 1)
  const significant = Math.round(ohms / 10 ** exponent)
  const first = Math.floor(significant / 10) % 10
  const second = significant % 10
  return [BAND_COLORS[first], BAND_COLORS[second], BAND_COLORS[exponent], '#d4a017']
}

export function formatOhms(ohms: number): string {
  return ohms >= 1000 ? `${ohms / 1000}kΩ` : `${ohms}Ω`
}
