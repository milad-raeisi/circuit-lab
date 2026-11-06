import type { SimResult } from './solver'
import type { PartNode, PartType } from './types'

export type MissionId =
  | 'light'
  | 'flashlight'
  | 'motor'
  | 'reverse'
  | 'led'
  | 'doorbell'
  | 'parallel'
  | 'dimmer'

export const MISSION_IDS: MissionId[] = [
  'light',
  'flashlight',
  'motor',
  'reverse',
  'led',
  'doorbell',
  'parallel',
  'dimmer',
]

/** Things that can only be judged over time (e.g. the motor spun both ways). */
export type MissionMemory = { motorForward: boolean; motorBackward: boolean }

export function evaluateMissions(
  nodes: PartNode[],
  result: SimResult,
  memory: MissionMemory,
): Set<MissionId> {
  const done = new Set<MissionId>()
  const of = (type: PartType) =>
    nodes
      .filter((n) => n.data.type === type && !n.data.burnt)
      .map((n) => ({ node: n, r: result.parts[n.id] }))
      .filter((x) => x.r !== undefined)

  const lamps = of('lamp')
  const litLamps = lamps.filter(({ r }) => r.level > 0.3 && !r.damaged)
  const carries = (type: PartType, min: number) =>
    of(type).some(({ r }) => Math.abs(r.current) > min)

  if (litLamps.length > 0) done.add('light')
  if (litLamps.some(({ r }) => r.level > 0.5) && carries('switch', 0.05)) done.add('flashlight')
  if (of('motor').some(({ r }) => Math.abs(r.level) > 0.3)) done.add('motor')
  if (memory.motorForward && memory.motorBackward) done.add('reverse')
  if (of('led').some(({ r }) => r.status === 'on')) done.add('led')
  if (of('buzzer').some(({ r }) => r.status === 'on') && carries('button', 0.01)) done.add('doorbell')
  if (lamps.filter(({ r }) => r.level >= 0.8 && !r.damaged).length >= 2) done.add('parallel')
  if (litLamps.length > 0 && carries('dimmer', 0.02)) done.add('dimmer')

  return done
}
