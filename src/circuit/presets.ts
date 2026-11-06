import { createPartData } from './catalog'
import type {
  CircuitSnapshot,
  PartData,
  PartNode,
  PartType,
  Rotation,
  WireColor,
  WireEdge,
} from './types'

export type PresetId =
  | 'flashlight'
  | 'fan'
  | 'doorbell'
  | 'led'
  | 'series'
  | 'parallel'
  | 'dimmer'
  | 'short'

type PresetPart = {
  key: string
  type: PartType
  x: number
  y: number
  rotation?: Rotation
  data?: Partial<PartData>
}

/** [from, to, colour] with terminals written as `key:a` / `key:b` */
type PresetWire = [string, string, WireColor]

type Preset = { parts: PresetPart[]; wires: PresetWire[] }

/*
 * Most presets use the same "loop" layout that reads like a textbook diagram:
 *
 *            ┌── top part ──┐
 *   battery  │              │  right part
 *   (+ top)  └──────────────┘  (a top, b bottom)
 */
const loop = (top: PresetPart['type'], right: PresetPart['type'], extra: {
  top?: Partial<PartData>
  right?: Partial<PartData>
  battery?: Partial<PartData>
} = {}): Preset => ({
  parts: [
    { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270, data: extra.battery },
    { key: 'top', type: top, x: 290, y: -40, data: extra.top },
    { key: 'right', type: right, x: 580, y: 150, rotation: 90, data: extra.right },
  ],
  wires: [
    ['bat:a', 'top:a', 'red'],
    ['top:b', 'right:a', 'yellow'],
    ['right:b', 'bat:b', 'black'],
  ],
})

const PRESETS: Record<PresetId, Preset> = {
  flashlight: loop('switch', 'lamp', { top: { closed: true } }),
  fan: loop('switch', 'motor', { top: { closed: true } }),
  doorbell: loop('button', 'buzzer'),
  led: loop('resistor', 'led', { top: { resistance: 47 }, right: { color: 'green' } }),
  series: loop('lamp', 'lamp'),
  dimmer: loop('dimmer', 'lamp', { top: { level: 0.55 }, right: { color: 'yellow' } }),
  parallel: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270 },
      { key: 'l1', type: 'lamp', x: 290, y: 150, rotation: 90 },
      { key: 'l2', type: 'lamp', x: 560, y: 150, rotation: 90, data: { color: 'blue' } },
    ],
    wires: [
      ['bat:a', 'l1:a', 'red'],
      ['bat:a', 'l2:a', 'red'],
      ['l1:b', 'bat:b', 'black'],
      ['l2:b', 'bat:b', 'black'],
    ],
  },
  short: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270 },
      { key: 'sw', type: 'switch', x: 290, y: 150, rotation: 90, data: { closed: true } },
      { key: 'lamp', type: 'lamp', x: 580, y: 150, rotation: 90 },
    ],
    wires: [
      ['bat:a', 'lamp:a', 'red'],
      ['lamp:b', 'bat:b', 'black'],
      ['bat:a', 'sw:a', 'yellow'],
      ['sw:b', 'bat:b', 'yellow'],
    ],
  },
}

export const PRESET_ORDER: PresetId[] = [
  'flashlight',
  'fan',
  'doorbell',
  'led',
  'series',
  'parallel',
  'dimmer',
  'short',
]

/** Builds a fresh board (new ids every time) from a preset. */
export function buildPreset(id: PresetId): CircuitSnapshot {
  const preset = PRESETS[id]
  const suffix = crypto.randomUUID().slice(0, 6)
  const nodeId = (key: string) => `${key}-${suffix}`

  const nodes: PartNode[] = preset.parts.map((p) => ({
    id: nodeId(p.key),
    type: 'part',
    position: { x: p.x, y: p.y },
    data: { ...createPartData(p.type), rotation: p.rotation ?? 0, ...p.data },
  }))

  const edges: WireEdge[] = preset.wires.map(([from, to, color], index) => {
    const [sourceKey, sourceHandle] = from.split(':')
    const [targetKey, targetHandle] = to.split(':')
    return {
      id: `wire-${index}-${suffix}`,
      type: 'wire',
      source: nodeId(sourceKey),
      sourceHandle,
      target: nodeId(targetKey),
      targetHandle,
      data: { color },
    }
  })

  return { nodes, edges }
}
