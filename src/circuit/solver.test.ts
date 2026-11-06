import { describe, expect, it } from 'vitest'
import { createPartData } from './catalog'
import { solveCircuit, type NetPart, type NetWire } from './solver'
import type { PartData, PartType } from './types'

const part = (id: string, type: PartType, extra: Partial<PartData> = {}): NetPart => ({
  id,
  data: { ...createPartData(type), ...extra },
})

let wireId = 0
const wire = (from: string, to: string): NetWire => {
  const [source, sourceHandle] = from.split(':')
  const [target, targetHandle] = to.split(':')
  return { id: `w${wireId++}`, source, sourceHandle, target, targetHandle }
}

/** battery(+) → x → … → battery(−), each part entered at `a` and left at `b` */
const seriesLoop = (battery: string, chain: string[]): NetWire[] => {
  const wires: NetWire[] = []
  let from = `${battery}:a`
  for (const id of chain) {
    wires.push(wire(from, `${id}:a`))
    from = `${id}:b`
  }
  wires.push(wire(from, `${battery}:b`))
  return wires
}

describe('solveCircuit', () => {
  it('lights a lamp only when the flashlight switch is closed', () => {
    const open = solveCircuit(
      [part('bat', 'battery'), part('sw', 'switch'), part('lamp', 'lamp')],
      seriesLoop('bat', ['sw', 'lamp']),
    )
    expect(open.parts.lamp.level).toBe(0)
    expect(open.batteryCurrent).toBeLessThan(1e-3)

    const closed = solveCircuit(
      [part('bat', 'battery'), part('sw', 'switch', { closed: true }), part('lamp', 'lamp')],
      seriesLoop('bat', ['sw', 'lamp']),
    )
    expect(closed.parts.lamp.status).toBe('on')
    expect(closed.parts.lamp.level).toBeGreaterThan(0.8)
    // 3 V across 10 Ω lamp + 0.6 Ω internal resistance ≈ 0.28 A
    expect(closed.batteryCurrent).toBeCloseTo(3 / 10.62, 2)
  })

  it('makes a lamp dimmer on 1.5 V and burns it on 9 V', () => {
    const dim = solveCircuit(
      [part('bat', 'battery', { voltage: 1.5 }), part('lamp', 'lamp')],
      seriesLoop('bat', ['lamp']),
    )
    expect(dim.parts.lamp.status).toBe('weak')

    const burn = solveCircuit(
      [part('bat', 'battery', { voltage: 9 }), part('lamp', 'lamp')],
      seriesLoop('bat', ['lamp']),
    )
    expect(burn.parts.lamp.damaged).toBe(true)
  })

  it('shares current between two lamps in series and keeps them bright in parallel', () => {
    const series = solveCircuit(
      [part('bat', 'battery'), part('l1', 'lamp'), part('l2', 'lamp')],
      seriesLoop('bat', ['l1', 'l2']),
    )
    expect(series.parts.l1.status).toBe('weak')
    expect(series.parts.l2.level).toBeCloseTo(series.parts.l1.level, 5)

    const parallel = solveCircuit(
      [part('bat', 'battery'), part('l1', 'lamp'), part('l2', 'lamp')],
      [
        wire('bat:a', 'l1:a'),
        wire('bat:a', 'l2:a'),
        wire('l1:b', 'bat:b'),
        wire('l2:b', 'bat:b'),
      ],
    )
    expect(parallel.parts.l1.status).toBe('on')
    expect(parallel.parts.l2.status).toBe('on')
  })

  it('spins a motor in the direction set by the battery polarity', () => {
    const forward = solveCircuit(
      [part('bat', 'battery'), part('m', 'motor')],
      seriesLoop('bat', ['m']),
    )
    expect(forward.parts.m.level).toBeGreaterThan(0.5)

    const backward = solveCircuit(
      [part('bat', 'battery'), part('m', 'motor')],
      [wire('bat:a', 'm:b'), wire('m:a', 'bat:b')],
    )
    expect(backward.parts.m.level).toBeLessThan(-0.5)
  })

  it('treats an LED as a one-way valve', () => {
    const forward = solveCircuit(
      [part('bat', 'battery'), part('r', 'resistor', { resistance: 47 }), part('led', 'led')],
      seriesLoop('bat', ['r', 'led']),
    )
    expect(forward.parts.led.status).toBe('on')
    expect(forward.parts.led.current).toBeGreaterThan(0.015)
    expect(forward.parts.led.current).toBeLessThan(0.03)

    const reversed = solveCircuit(
      [part('bat', 'battery'), part('led', 'led')],
      [wire('bat:a', 'led:b'), wire('led:a', 'bat:b')],
    )
    expect(reversed.parts.led.current).toBe(0)
    expect(reversed.parts.led.status).toBe('reverse')
    expect(reversed.batteryCurrent).toBeLessThan(1e-3)
  })

  it('burns an LED without a resistor on 9 V but not with 220 Ω', () => {
    const naked = solveCircuit(
      [part('bat', 'battery', { voltage: 9 }), part('led', 'led')],
      seriesLoop('bat', ['led']),
    )
    expect(naked.parts.led.damaged).toBe(true)

    const safe = solveCircuit(
      [
        part('bat', 'battery', { voltage: 9 }),
        part('r', 'resistor', { resistance: 220 }),
        part('led', 'led'),
      ],
      seriesLoop('bat', ['r', 'led']),
    )
    expect(safe.parts.led.damaged).toBe(false)
    expect(safe.parts.led.status).toBe('on')
  })

  it('detects a short circuit and reports wire currents', () => {
    const result = solveCircuit([part('bat', 'battery')], [wire('bat:a', 'bat:b')])
    expect(result.shortCircuit).toBe(true)
    expect(result.parts.bat.status).toBe('short')
    const [current] = Object.values(result.wires)
    expect(current).toBeGreaterThan(2)
  })

  it('rings a buzzer only while the push button is held', () => {
    const parts = [part('bat', 'battery'), part('btn', 'button'), part('bz', 'buzzer')]
    const wires = seriesLoop('bat', ['btn', 'bz'])
    expect(solveCircuit(parts, wires).parts.bz.status).toBe('idle')
    parts[1] = part('btn', 'button', { pressed: true })
    expect(solveCircuit(parts, wires).parts.bz.status).toBe('on')
  })

  it('treats a burnt lamp as an open circuit', () => {
    const result = solveCircuit(
      [part('bat', 'battery'), part('lamp', 'lamp', { burnt: true })],
      seriesLoop('bat', ['lamp']),
    )
    expect(result.parts.lamp.status).toBe('burnt')
    expect(result.batteryCurrent).toBeLessThan(1e-3)
  })

  it('dims a lamp with the dimmer knob', () => {
    const at = (level: number) =>
      solveCircuit(
        [part('bat', 'battery'), part('d', 'dimmer', { level }), part('lamp', 'lamp')],
        seriesLoop('bat', ['d', 'lamp']),
      ).parts.lamp.level
    expect(at(1)).toBeGreaterThan(at(0.5))
    expect(at(0.5)).toBeGreaterThan(at(0.1))
  })

  it('ignores wires that point at parts that no longer exist', () => {
    const result = solveCircuit([part('bat', 'battery')], [wire('bat:a', 'ghost:a')])
    expect(result.wires).toEqual({})
    expect(result.shortCircuit).toBe(false)
  })
})
