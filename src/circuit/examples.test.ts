import { describe, expect, it } from 'vitest'
import { PARTS, alarmBeat, partHeight, partWidth, pinModesFor, pinOutput, terminalIds } from './catalog'
import { PRESET_CATEGORIES, PRESET_INFO, PRESET_ORDER, buildPreset, type PresetId } from './presets'
import { DEFAULT_STEP, solveCircuit, type NetPart, type NetWire, type SimResult } from './solver'
import type { PartData } from './types'

/*
 * Every example in the gallery is run here the way the app runs it: step by
 * step, each step getting the time, the capacitor voltages and the board
 * inputs of the step before (see useSimulationEngine).
 */

/** Part keys as written in the preset ("board", "siren" …) instead of their random ids. */
const keyOf = (id: string) => id.slice(0, -7)

type Run = {
  /** the result after the last step */
  last: SimResult
  /** every step's result, oldest first */
  steps: SimResult[]
  /** the parts as they were solved, for running on from here */
  parts: NetPart[]
  wires: NetWire[]
}

/** Builds an example, changes some parts (by key) and runs it for `seconds`. */
function run(id: PresetId, seconds = 0.5, set: Record<string, Partial<PartData>> = {}, from?: Run): Run {
  let parts: NetPart[]
  let wires: NetWire[]
  if (from) {
    parts = from.parts.map((p) => ({ id: p.id, data: { ...p.data, ...set[p.id] } }))
    wires = from.wires
  } else {
    const { nodes, edges } = buildPreset(id)
    parts = nodes.map((n) => ({ id: keyOf(n.id), data: { ...n.data, ...set[keyOf(n.id)] } }))
    wires = edges.map((e) => ({ ...e, source: keyOf(e.source), target: keyOf(e.target) }))
  }
  const start = from ? from.steps.length * DEFAULT_STEP : 0
  let previous = from?.last
  const steps: SimResult[] = []
  for (let i = 0; i * DEFAULT_STEP <= seconds + 1e-9; i++) {
    previous = solveCircuit(parts, wires, {
      time: start + i * DEFAULT_STEP,
      dt: DEFAULT_STEP,
      capacitors: previous?.capacitors,
      inputs: previous?.inputs,
    })
    steps.push(previous)
  }
  return { last: previous!, steps: [...(from?.steps ?? []), ...steps], parts, wires }
}

/** One step at an exact time, after the board has read its sensor once. */
function at(id: PresetId, time: number, set: Record<string, Partial<PartData>> = {}) {
  const { nodes, edges } = buildPreset(id)
  const parts = nodes.map((n) => ({ id: keyOf(n.id), data: { ...n.data, ...set[keyOf(n.id)] } }))
  const wires = edges.map((e) => ({ ...e, source: keyOf(e.source), target: keyOf(e.target) }))
  const first = solveCircuit(parts, wires, { time })
  return solveCircuit(parts, wires, { time, inputs: first.inputs }).parts
}

const on = (r: SimResult, key: string) => r.parts[key].status === 'on'
/** true when the part was on in some steps and off in others: blinking or beeping */
const pulses = (steps: SimResult[], key: string) =>
  steps.some((r) => on(r, key)) && steps.some((r) => r.parts[key].level === 0)

const NEW_EXAMPLES: PresetId[] = [
  'rainbow',
  'toyCar',
  'batteryTester',
  'streetLamp',
  'fuseGuard',
  'solarGarden',
  'noiseLight',
  'trafficLight',
  'policeLights',
  'partyLights',
  'holidayLights',
  'railroad',
  'nightLight',
  'smokeAlarm',
  'parkingSensor',
  'plantAlarm',
  'smartFan',
  'autoDoor',
  'radar',
  'doorAlarm',
  'smartHome',
  'thermometer',
  'scoreboard',
  'doorbellScreen',
  'busStop',
  'pocketTv',
]

describe('the examples gallery', () => {
  it('puts every example on exactly one shelf, with a small picture of 2 to 4 parts', () => {
    expect(new Set(PRESET_ORDER).size).toBe(PRESET_ORDER.length)
    expect(PRESET_ORDER.length).toBe(Object.keys(PRESET_INFO).length)
    expect(PRESET_ORDER.length).toBeGreaterThanOrEqual(18 + 18)
    for (const id of PRESET_ORDER) {
      const info = PRESET_INFO[id]
      expect(PRESET_CATEGORIES).toContain(info.category)
      expect(info.art.length).toBeGreaterThanOrEqual(2)
      expect(info.art.length).toBeLessThanOrEqual(4)
    }
    for (const category of PRESET_CATEGORIES) {
      expect(PRESET_ORDER.filter((id) => PRESET_INFO[id].category === category).length).toBeGreaterThanOrEqual(5)
    }
  })

  it('joins every wire to a real terminal and keeps every card clear of the others', () => {
    for (const id of PRESET_ORDER) {
      const { nodes, edges } = buildPreset(id, { citySign: 'Hello' })
      const byId = new Map(nodes.map((n) => [n.id, n]))
      for (const e of edges) {
        expect(terminalIds(byId.get(e.source)!.data.type), `${id}: ${e.source}:${e.sourceHandle}`).toContain(e.sourceHandle)
        expect(terminalIds(byId.get(e.target)!.data.type), `${id}: ${e.target}:${e.targetHandle}`).toContain(e.targetHandle)
      }
      // cards keep at least a small gap between them
      const boxes = nodes.map((n) => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        w: partWidth(n.data.type, n.data),
        h: partHeight(n.data.type, n.data),
      }))
      for (const a of boxes) {
        for (const b of boxes) {
          if (a === b) continue
          const apart = a.x + a.w + 20 <= b.x || b.x + b.w + 20 <= a.x || a.y + a.h + 20 <= b.y || b.y + b.h + 20 <= a.y
          expect(apart, `${id}: ${a.id} overlaps ${b.id}`).toBe(true)
        }
      }
    }
  })

  it('runs every example for three seconds without a short circuit or a burnt part', () => {
    for (const id of PRESET_ORDER.filter((p) => p !== 'short')) {
      const { steps } = run(id, 3)
      for (const r of steps) {
        expect(r.shortCircuit, id).toBe(false)
        for (const [key, part] of Object.entries(r.parts)) expect(part.damaged, `${id}: ${key}`).toBe(false)
        // a board pin asked for too much current
        for (const [key, part] of Object.entries(r.parts)) {
          if (key === 'board' || key === 'esp') expect(part.status, `${id}: ${key}`).not.toBe('over')
        }
      }
    }
  })

  it('shows something working in every new example as soon as it opens', () => {
    for (const id of NEW_EXAMPLES) {
      const shows = buildPreset(id)
        .nodes.filter((n) => ['output', 'display', 'meter'].includes(PARTS[n.data.type].category))
        .map((n) => keyOf(n.id))
      const { steps } = run(id, 2)
      expect(steps.some((r) => shows.some((key) => r.parts[key].status === 'on')), id).toBe(true)
    }
  })
})

describe('new board programs', () => {
  it('blinks two pins in turn', () => {
    expect(pinOutput('blink', 0.2, false)).toBe(1)
    expect(pinOutput('blink2', 0.2, false)).toBe(0)
    expect(pinOutput('blink', 0.7, false)).toBe(0)
    expect(pinOutput('blink2', 0.7, false)).toBe(1)
  })

  it('lights the three steps one second each, then starts again', () => {
    const lit = (t: number) => (['step1', 'step2', 'step3'] as const).filter((m) => pinOutput(m, t, false) === 1)
    expect(lit(0.5)).toEqual(['step1'])
    expect(lit(1.5)).toEqual(['step2'])
    expect(lit(2.5)).toEqual(['step3'])
    expect(lit(3.5)).toEqual(['step1'])
  })

  it('does the opposite of the sensor: on when it reads low', () => {
    expect(pinOutput('invert', 0, false, 0.2)).toBe(1)
    expect(pinOutput('invert', 0, false, 0.8)).toBe(0)
    expect(pinOutput('invert', 0, true, 0.2)).toBeCloseTo(0.8)
  })

  it('beeps only when the sensor reads high, faster the higher it reads', () => {
    const beeps = (reading: number) =>
      Array.from({ length: 200 }, (_, i) => pinOutput('alarm', i * 0.01, false, reading)).filter(Boolean).length
    expect(beeps(0.3)).toBe(0)
    expect(beeps(0.7)).toBeGreaterThan(80)
    expect(alarmBeat(1)).toBeLessThan(alarmBeat(0.6))
  })

  it('offers the sensor programs only on boards with a sensor input', () => {
    expect(pinModesFor('arduino', 'D13')).toEqual(
      expect.arrayContaining(['blink2', 'step1', 'step2', 'step3', 'follow', 'invert', 'alarm']),
    )
    expect(pinModesFor('arduino', 'D13')).not.toContain('fade')
    expect(pinModesFor('raspberrypi', 'GPIO17')).not.toContain('invert')
    expect(pinModesFor('raspberrypi', 'GPIO17')).toContain('step2')
  })
})

describe('first circuits', () => {
  it('rainbow: four LEDs of four colours all shine', () => {
    const { last } = run('rainbow')
    for (const key of ['l0', 'l1', 'l2', 'l3']) expect(last.parts[key].status, key).toBe('on')
  })

  it('toy car: one switch spins both wheels the same way', () => {
    const { last } = run('toyCar')
    expect(last.parts.left.status).toBe('on')
    expect(last.parts.right.status).toBe('on')
    expect(last.parts.left.level).toBeCloseTo(last.parts.right.level, 1)
    expect(run('toyCar', 0.2, { sw: { closed: false } }).last.parts.left.level).toBe(0)
  })

  it('battery tester: the meter reads the battery, and 1.5 V is too weak for the green light', () => {
    const full = run('batteryTester').last
    expect(full.parts.vm.level).toBeGreaterThan(4.3)
    expect(full.parts.led.status).toBe('on')
    const weak = run('batteryTester', 0.2, { bat: { voltage: 1.5 } }).last
    expect(weak.parts.vm.level).toBeCloseTo(1.5, 1)
    expect(weak.parts.led.level).toBe(0)
  })
})

describe('electronics', () => {
  it('street lamp: on at night, off in daylight', () => {
    const night = run('streetLamp').last
    expect(night.parts.lamp.status).toBe('on')
    expect(night.parts.q.status).toBe('on')
    const dusk = run('streetLamp', 0.2, { ldr: { light: 0.7 } }).last
    expect(dusk.parts.lamp.level).toBeLessThan(night.parts.lamp.level)
    const day = run('streetLamp', 0.2, { ldr: { light: 1 } }).last
    expect(day.parts.lamp.level).toBe(0)
    expect(day.parts.q.status).toBe('idle')
  })

  it('fuse guard: the lamp shines, and a short breaks the fuse before anything else', () => {
    const fine = run('fuseGuard').last
    expect(fine.parts.lamp.status).toBe('on')
    expect(fine.parts.fuse.damaged).toBe(false)
    const shorted = run('fuseGuard', 0.1, { sw: { closed: true } }).last
    expect(shorted.parts.fuse.damaged).toBe(true)
    expect(shorted.parts.lamp.damaged).toBe(false)
  })

  it('solar garden light: the sun fills the capacitor, which keeps the light on after sunset', () => {
    const day = run('solarGarden', 2)
    expect(day.last.parts.led.status).toBe('on')
    expect(day.last.capacitors.cap).toBeGreaterThan(4)
    const dusk = run('solarGarden', 1, { sun: { light: 0 } }, day)
    expect(dusk.last.parts.led.level).toBeGreaterThan(0)
    expect(dusk.last.parts.d.current).toBe(0)
    const night = run('solarGarden', 12, {}, dusk)
    expect(night.last.parts.led.status).not.toBe('on')
  })

  it('noise light: the louder it is, the brighter the lamp', () => {
    const loud = run('noiseLight').last.parts.lamp
    const soft = run('noiseLight', 0.2, { mic: { sense: 0.4 } }).last.parts.lamp
    const quiet = run('noiseLight', 0.2, { mic: { sense: 0.1 } }).last.parts.lamp
    expect(loud.status).toBe('on')
    expect(soft.level).toBeLessThan(loud.level)
    expect(quiet.level).toBe(0)
  })
})

describe('boards and code', () => {
  it('traffic light: red, then green, then yellow', () => {
    const lit = (t: number) =>
      ['red', 'yellow', 'green'].filter((key) => at('trafficLight', t)[key].status === 'on')
    expect(lit(0.5)).toEqual(['red'])
    expect(lit(1.5)).toEqual(['green'])
    expect(lit(2.5)).toEqual(['yellow'])
  })

  it('police lights: red and blue take turns, and the siren rises and falls', () => {
    expect(at('policeLights', 0.25).red.status).toBe('on')
    expect(at('policeLights', 0.25).blue.level).toBe(0)
    expect(at('policeLights', 0.75).red.level).toBe(0)
    expect(at('policeLights', 0.75).blue.status).toBe('on')
    const { steps } = run('policeLights', 2)
    expect(pulses(steps, 'siren')).toBe(true)
  })

  it('party lights: three lights chase each other, a fourth breathes and the sign shines', () => {
    expect(at('partyLights', 0.5).red.status).toBe('on')
    expect(at('partyLights', 0.5).green.level).toBe(0)
    expect(at('partyLights', 1.5).green.status).toBe('on')
    expect(at('partyLights', 2.5).blue.status).toBe('on')
    expect(at('partyLights', 1).gold.status).toBe('on')
    expect(at('partyLights', 0.5).sign.status).toBe('on')
  })

  it('holiday lights: red and green take turns on the Raspberry Pi, the star breathes', () => {
    expect(at('holidayLights', 0.25).red.status).toBe('on')
    expect(at('holidayLights', 0.25).green.level).toBe(0)
    expect(at('holidayLights', 0.75).green.status).toBe('on')
    expect(at('holidayLights', 1).star.status).toBe('on')
    expect(at('holidayLights', 0.25).sign.status).toBe('on')
  })

  it('train crossing: the gate goes down and the two lights take turns', () => {
    expect(at('railroad', 0.25).gate.level).toBeGreaterThan(0.9)
    expect(at('railroad', 0.25).left.status).toBe('on')
    expect(at('railroad', 0.25).right.level).toBe(0)
    expect(at('railroad', 0.75).right.status).toBe('on')
  })
})

describe('smart gadgets', () => {
  it('night light: on in the dark, off in daylight', () => {
    const dark = run('nightLight').last
    expect(dark.parts.lamp1.status).toBe('on')
    expect(dark.parts.lamp2.status).toBe('on')
    const day = run('nightLight', 0.3, { ldr: { light: 1 } }).last
    expect(day.parts.lamp1.level).toBe(0)
  })

  it('smoke alarm: green in clean air, flashing red and beeps in smoke', () => {
    const clean = run('smokeAlarm', 1)
    expect(on(clean.last, 'safe')).toBe(true)
    expect(clean.steps.every((r) => r.parts.siren.level === 0)).toBe(true)
    const smoke = run('smokeAlarm', 1.5, { sensor: { sense: 0.9 } })
    expect(pulses(smoke.steps.slice(2), 'siren')).toBe(true)
    expect(pulses(smoke.steps.slice(2), 'warn')).toBe(true)
    expect(smoke.last.parts.safe.level).toBe(0)
  })

  it('parking sensor: quiet and green far away, beeping and red up close', () => {
    const far = run('parkingSensor', 1)
    expect(on(far.last, 'far')).toBe(true)
    expect(far.steps.every((r) => r.parts.beeper.level === 0)).toBe(true)
    const close = run('parkingSensor', 1.5, { sensor: { sense: 0.1 } })
    expect(pulses(close.steps.slice(2), 'beeper')).toBe(true)
    expect(on(close.last, 'near')).toBe(true)
    expect(close.last.parts.far.level).toBe(0)
  })

  it('thirsty plant: red and a low bar when dry, green and a high bar when wet', () => {
    const dry = run('plantAlarm').last
    expect(on(dry, 'dry')).toBe(true)
    expect(dry.parts.wet.level).toBe(0)
    expect(dry.parts.screen.status).toBe('on')
    expect(dry.parts.screen.level).toBeLessThan(1.5)
    const wet = run('plantAlarm', 0.5, { sensor: { sense: 0.85 } }).last
    expect(on(wet, 'wet')).toBe(true)
    expect(wet.parts.dry.level).toBe(0)
    expect(wet.parts.screen.level).toBeGreaterThan(3.5)
  })

  it('smart fan: spins on a hot day, faster when hotter, and rests when cool', () => {
    const hot = run('smartFan').last
    expect(hot.parts.fan.status).toBe('on')
    expect(hot.parts.q.damaged).toBe(false)
    const warm = run('smartFan', 0.3, { temp: { sense: 0.6 } }).last
    expect(warm.parts.fan.level).toBeLessThan(hot.parts.fan.level)
    const cool = run('smartFan', 0.3, { temp: { sense: 0.2 } }).last
    expect(cool.parts.fan.level).toBe(0)
  })

  it('automatic door: shut with a red light, wide open with a green light when someone moves', () => {
    const still = run('autoDoor').last
    expect(still.parts.door.level).toBeLessThan(0.05)
    expect(on(still, 'shut')).toBe(true)
    const someone = run('autoDoor', 0.3, { sensor: { sense: 1 } }).last
    expect(someone.parts.door.level).toBeGreaterThan(0.9)
    expect(on(someone, 'open')).toBe(true)
    expect(someone.parts.shut.level).toBe(0)
  })

  it('radar: the servo sweeps, and something close lights the red LED and starts the beeps', () => {
    const quiet = run('radar', 2.5)
    const angles = quiet.steps.map((r) => r.parts.sweep.level)
    expect(Math.min(...angles)).toBeLessThan(0.2)
    expect(Math.max(...angles)).toBeGreaterThan(0.8)
    expect(quiet.steps.every((r) => r.parts.beeper.level === 0)).toBe(true)
    const close = run('radar', 1.5, { sensor: { sense: 0.1 } })
    expect(pulses(close.steps.slice(2), 'beeper')).toBe(true)
    expect(on(close.last, 'target')).toBe(true)
  })

  it('door alarm: green while the door is shut, beeps when it opens', () => {
    const shut = run('doorAlarm', 1)
    expect(on(shut.last, 'safe')).toBe(true)
    expect(shut.steps.every((r) => r.parts.siren.level === 0)).toBe(true)
    const open = run('doorAlarm', 1.5, { reed: { sense: 0 } })
    expect(pulses(open.steps.slice(2), 'siren')).toBe(true)
    expect(open.last.parts.safe.level).toBe(0)
  })

  it('smart home: the screen greets you, the fan cools the room, the porch light waits for someone', () => {
    const home = run('smartHome').last
    expect(home.parts.screen.status).toBe('on')
    expect(home.parts.fan.status).toBe('on')
    expect(home.parts.porch.level).toBe(0)
    const visitor = run('smartHome', 0.5, { sensor: { sense: 1 } })
    expect(on(visitor.last, 'porch')).toBe(true)
    expect(pulses(visitor.steps.slice(2), 'chime')).toBe(true)
  })
})

describe('screens and signs', () => {
  it('thermometer: the screen shows more volts when it gets hotter', () => {
    const warm = run('thermometer').last.parts.digits
    const hot = run('thermometer', 0.2, { temp: { sense: 0.9 } }).last.parts.digits
    expect(warm.status).toBe('on')
    expect(warm.level).toBeGreaterThan(2)
    expect(hot.level).toBeGreaterThan(warm.level + 1)
  })

  it('scoreboard: the sign and the game clock both light from one battery', () => {
    const { last } = run('scoreboard')
    expect(last.parts.sign.status).toBe('on')
    expect(last.parts.clock.status).toBe('on')
  })

  it('smart doorbell: the screen is always on and the bell rings while the button is held', () => {
    const idle = run('doorbellScreen').last
    expect(idle.parts.screen.status).toBe('on')
    expect(idle.parts.bell.level).toBe(0)
    expect(run('doorbellScreen', 0.1, { btn: { pressed: true } }).last.parts.bell.status).toBe('on')
  })

  it('bus stop board: sunlight is enough for both screens', () => {
    const { last } = run('busStop')
    expect(last.parts.board.status).toBe('on')
    expect(last.parts.clock.status).toBe('on')
  })

  it('pocket TV: on with the switch, off without it', () => {
    expect(run('pocketTv').last.parts.tv.status).toBe('on')
    expect(run('pocketTv', 0.1, { power: { closed: false } }).last.parts.tv.status).toBe('idle')
  })
})
