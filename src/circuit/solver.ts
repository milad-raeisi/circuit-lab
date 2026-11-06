import {
  ELECTRICAL as E,
  LED_FORWARD_VOLTAGE,
  batteryResistance,
  dimmerResistance,
} from './catalog'
import type { LedColor, PartData } from './types'

/**
 * DC circuit solver based on nodal analysis.
 *
 * Every part terminal is a circuit node. Wires are tiny resistors (so we also
 * get the current through each wire for the flow animation), batteries are
 * Norton equivalents (current source + internal conductance) and LEDs are
 * piecewise-linear diodes whose on/off state is found iteratively. Every node
 * has a tiny leak to ground so floating sub-circuits never make the matrix
 * singular.
 */

export type NetPart = { id: string; data: PartData }
export type NetWire = {
  id: string
  source: string
  sourceHandle?: string | null
  target: string
  targetHandle?: string | null
}

export type PartStatus =
  | 'idle' //    no meaningful current
  | 'weak' //    works, but only a little (dim lamp, motor hums)
  | 'on' //      working normally
  | 'over' //    too much: too bright / too hot / too fast
  | 'reverse' // LED connected the wrong way round
  | 'burnt' //   destroyed, needs repair
  | 'short' //   battery is short-circuited

export type PartResult = {
  /** V(a) − V(b) in volts */
  voltage: number
  /** current through the part from a to b; for batteries, current delivered out of + */
  current: number
  /** watts */
  power: number
  /** normalised activity: lamp/led brightness, motor speed (signed), buzzer volume */
  level: number
  status: PartStatus
  /** the part received enough power to be destroyed */
  damaged: boolean
}

export type SimResult = {
  parts: Record<string, PartResult>
  /** current through each wire, positive = flowing from source handle to target handle */
  wires: Record<string, number>
  shortCircuit: boolean
  hasBattery: boolean
  /** total current delivered by all batteries */
  batteryCurrent: number
}

export const EMPTY_RESULT: SimResult = {
  parts: {},
  wires: {},
  shortCircuit: false,
  hasBattery: false,
  batteryCurrent: 0,
}

const GMIN = 1e-9
const MAX_DIODE_ITERATIONS = 30

type Stamp = { a: number; b: number; g: number; source: number }

function solveLinear(matrix: Float64Array, rhs: Float64Array, n: number): Float64Array {
  const m = matrix.slice()
  const x = rhs.slice()
  for (let col = 0; col < n; col++) {
    let pivot = col
    let best = Math.abs(m[col * n + col])
    for (let row = col + 1; row < n; row++) {
      const value = Math.abs(m[row * n + col])
      if (value > best) {
        best = value
        pivot = row
      }
    }
    if (best < 1e-18) continue
    if (pivot !== col) {
      for (let k = 0; k < n; k++) {
        const tmp = m[col * n + k]
        m[col * n + k] = m[pivot * n + k]
        m[pivot * n + k] = tmp
      }
      const tmp = x[col]
      x[col] = x[pivot]
      x[pivot] = tmp
    }
    const diag = m[col * n + col]
    for (let row = col + 1; row < n; row++) {
      const factor = m[row * n + col] / diag
      if (factor === 0) continue
      for (let k = col; k < n; k++) m[row * n + k] -= factor * m[col * n + k]
      x[row] -= factor * x[col]
    }
  }
  for (let row = n - 1; row >= 0; row--) {
    let sum = x[row]
    for (let k = row + 1; k < n; k++) sum -= m[row * n + k] * x[k]
    const diag = m[row * n + row]
    x[row] = Math.abs(diag) < 1e-18 ? 0 : sum / diag
  }
  return x
}

/** Resistance of a passive part in its current state, or null when it is open. */
function passiveResistance(data: PartData): number | null {
  switch (data.type) {
    case 'lamp':
      return data.burnt ? null : E.lamp.resistance
    case 'motor':
      return E.motor.resistance
    case 'buzzer':
      return E.buzzer.resistance
    case 'resistor':
      return data.resistance ?? 100
    case 'dimmer':
      return dimmerResistance(data.level ?? 0.7)
    case 'switch':
      return data.closed ? E.contactResistance : null
    case 'button':
      return data.pressed ? E.contactResistance : null
    default:
      return null
  }
}

function ledForward(data: PartData): number {
  return LED_FORWARD_VOLTAGE[(data.color as LedColor) ?? 'red'] ?? 2
}

export function solveCircuit(parts: NetPart[], wires: NetWire[]): SimResult {
  // 1. index every terminal
  const index = new Map<string, number>()
  for (const part of parts) {
    index.set(`${part.id}:a`, index.size)
    index.set(`${part.id}:b`, index.size)
  }
  const n = index.size
  const terminal = (id: string, handle: 'a' | 'b') => index.get(`${id}:${handle}`)!

  const validWires = wires.filter(
    (w) =>
      index.has(`${w.source}:${w.sourceHandle}`) &&
      index.has(`${w.target}:${w.targetHandle}`),
  )

  // 2. linear stamps that never change between diode iterations
  const fixed: Stamp[] = []
  const wireG = 1 / E.wireResistance
  for (const w of validWires) {
    fixed.push({
      a: index.get(`${w.source}:${w.sourceHandle}`)!,
      b: index.get(`${w.target}:${w.targetHandle}`)!,
      g: wireG,
      source: 0,
    })
  }
  let hasBattery = false
  for (const part of parts) {
    const a = terminal(part.id, 'a')
    const b = terminal(part.id, 'b')
    if (part.data.type === 'battery') {
      hasBattery = true
      const v = part.data.voltage ?? 3
      const g = 1 / batteryResistance(v)
      fixed.push({ a, b, g, source: v * g })
      continue
    }
    if (part.data.type === 'led') continue
    const r = passiveResistance(part.data)
    if (r !== null) fixed.push({ a, b, g: 1 / r, source: 0 })
  }

  const leds = parts.filter((p) => p.data.type === 'led' && !p.data.burnt)
  const ledOn = new Map(leds.map((p) => [p.id, true]))
  const ledG = 1 / E.led.seriesResistance

  // 3. solve, refining LED states until they are consistent
  let voltages: Float64Array = new Float64Array(n)
  for (let iteration = 0; iteration < MAX_DIODE_ITERATIONS; iteration++) {
    const matrix = new Float64Array(n * n)
    const rhs = new Float64Array(n)
    for (let i = 0; i < n; i++) matrix[i * n + i] += GMIN

    const stamp = ({ a, b, g, source }: Stamp) => {
      matrix[a * n + a] += g
      matrix[b * n + b] += g
      matrix[a * n + b] -= g
      matrix[b * n + a] -= g
      // `source` amps are pushed from b to a inside the element
      rhs[a] += source
      rhs[b] -= source
    }
    fixed.forEach(stamp)
    for (const led of leds) {
      if (!ledOn.get(led.id)) continue
      stamp({
        a: terminal(led.id, 'a'),
        b: terminal(led.id, 'b'),
        g: ledG,
        source: ledForward(led.data) * ledG,
      })
    }

    voltages = solveLinear(matrix, rhs, n)

    let changed = false
    for (const led of leds) {
      const drop = voltages[terminal(led.id, 'a')] - voltages[terminal(led.id, 'b')]
      const vf = ledForward(led.data)
      const on = ledOn.get(led.id)!
      if (on && drop < vf - 1e-9) {
        ledOn.set(led.id, false)
        changed = true
      } else if (!on && drop > vf + 1e-6) {
        ledOn.set(led.id, true)
        changed = true
      }
    }
    if (!changed) break
  }

  // 4. interpret the node voltages
  const results: Record<string, PartResult> = {}
  let shortCircuit = false
  let batteryCurrent = 0

  for (const part of parts) {
    const { data } = part
    const voltage = voltages[terminal(part.id, 'a')] - voltages[terminal(part.id, 'b')]
    const result: PartResult = {
      voltage,
      current: 0,
      power: 0,
      level: 0,
      status: data.burnt ? 'burnt' : 'idle',
      damaged: false,
    }

    switch (data.type) {
      case 'battery': {
        const v = data.voltage ?? 3
        const delivered = (v - voltage) / batteryResistance(v)
        result.current = delivered
        result.power = delivered * voltage
        result.level = delivered
        batteryCurrent += Math.max(0, delivered)
        if (delivered > E.shortCircuitCurrent) {
          result.status = 'short'
          shortCircuit = true
        } else if (delivered > 1e-3) {
          result.status = 'on'
        }
        break
      }
      case 'lamp': {
        if (data.burnt) break
        result.current = voltage / E.lamp.resistance
        result.power = voltage * result.current
        const ratio = result.power / E.lamp.ratedPower
        if (ratio >= E.lamp.burnRatio) {
          result.damaged = true
          result.status = 'over'
          result.level = 1.6
        } else if (ratio > 0.02) {
          result.level = Math.min(1.6, ratio ** 0.6)
          result.status = ratio > E.lamp.overRatio ? 'over' : ratio < 0.35 ? 'weak' : 'on'
        }
        break
      }
      case 'led': {
        if (data.burnt) break
        const vf = ledForward(data)
        const current = ledOn.get(part.id) ? Math.max(0, (voltage - vf) * ledG) : 0
        result.current = current
        result.power = voltage * current
        if (current > E.led.burnCurrent) {
          result.damaged = true
          result.status = 'over'
          result.level = 1.3
        } else if (current > 1e-3) {
          result.level = Math.min(1.3, 0.25 + (0.75 * current) / E.led.fullCurrent)
          result.status = current > E.led.overCurrent ? 'over' : current < 5e-3 ? 'weak' : 'on'
        } else if (voltage < -0.5) {
          result.status = 'reverse'
        }
        break
      }
      case 'motor': {
        result.current = voltage / E.motor.resistance
        result.power = voltage * result.current
        const speed = voltage / E.motor.ratedVoltage
        const magnitude = Math.abs(speed)
        if (magnitude >= E.motor.stallSpeed) {
          result.level = speed
          result.status = magnitude > E.motor.overSpeed ? 'over' : magnitude < 0.35 ? 'weak' : 'on'
        } else if (magnitude > 0.02) {
          result.status = 'weak'
        }
        break
      }
      case 'buzzer': {
        result.current = voltage / E.buzzer.resistance
        result.power = voltage * result.current
        const magnitude = Math.abs(result.current)
        if (magnitude >= E.buzzer.onCurrent) {
          result.level = Math.min(1.5, magnitude / E.buzzer.ratedCurrent)
          result.status = magnitude > E.buzzer.ratedCurrent * 2.5 ? 'over' : 'on'
        }
        break
      }
      default: {
        const r = passiveResistance(data)
        if (r === null) break
        result.current = voltage / r
        result.power = voltage * result.current
        const magnitude = Math.abs(result.current)
        result.level = magnitude
        if (magnitude > 1e-3) {
          const hot =
            (data.type === 'resistor' || data.type === 'dimmer') &&
            result.power > E.resistor.ratedPower
          result.status = hot ? 'over' : 'on'
        }
      }
    }
    results[part.id] = result
  }

  const wireCurrents: Record<string, number> = {}
  for (const w of validWires) {
    const vs = voltages[index.get(`${w.source}:${w.sourceHandle}`)!]
    const vt = voltages[index.get(`${w.target}:${w.targetHandle}`)!]
    wireCurrents[w.id] = (vs - vt) * wireG
  }

  return { parts: results, wires: wireCurrents, shortCircuit, hasBattery, batteryCurrent }
}
