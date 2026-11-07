import { BOARDS, createPartData, type BoardType } from './catalog'
import type {
  CircuitSnapshot,
  LedColor,
  PartData,
  PartNode,
  PartType,
  PinMode,
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
  | 'arduino'
  | 'transistor'
  | 'capacitor'
  | 'solar'
  | 'meters'
  | 'servo'
  | 'motion'
  | 'cityTv'
  | 'goldSign'
  | 'counter'
  // first circuits
  | 'rainbow'
  | 'toyCar'
  | 'batteryTester'
  // electronics
  | 'streetLamp'
  | 'fuseGuard'
  | 'solarGarden'
  | 'noiseLight'
  // boards and code
  | 'trafficLight'
  | 'policeLights'
  | 'partyLights'
  | 'holidayLights'
  | 'railroad'
  // smart gadgets
  | 'nightLight'
  | 'smokeAlarm'
  | 'parkingSensor'
  | 'plantAlarm'
  | 'smartFan'
  | 'autoDoor'
  | 'radar'
  | 'doorAlarm'
  | 'smartHome'
  // screens and signs
  | 'thermometer'
  | 'scoreboard'
  | 'doorbellScreen'
  | 'busStop'
  | 'pocketTv'

/** Words some presets show on their screens, in the app's language. An empty string shows the screen's own sample. */
export type PresetTexts = {
  citySign: string
  party: string
  holiday: string
  score: string
  doorbell: string
  busStop: string
  smartHome: string
}

type PresetPart = {
  key: string
  type: PartType
  x: number
  y: number
  rotation?: Rotation
  /** a function when the part shows words in the app's language */
  data?: Partial<PartData> | ((texts: Partial<PresetTexts>) => Partial<PartData>)
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

/** Every pin of a board switched off, then the ones given: a board never runs a program you did not ask for. */
function program(board: BoardType, pins: Record<string, PinMode>): Partial<PartData> {
  return { pins: { ...Object.fromEntries(BOARDS[board].pins.map((pin) => [pin, 'off' as PinMode])), ...pins } }
}

/*
 * Board examples share one layout, so they read the same way every time:
 *
 *              screen or servo     (just above the board, joined on its left)
 *              board ─ pin wires ─┬──────────┬──────────┐
 *   sensor                     resistor   resistor   resistor   (upright)
 *   (below left, S up into the input) LED  LED      buzzer      (+ on top)
 *   └──── one black ground wire back under everything, to the sensor's − or the board's GND
 *
 * The highest pin goes to the column furthest away, so pin wires never cross.
 */
const COLUMN = 220
const FIRST_COLUMN = 330
const RESISTOR_ROW = 240
const OUTPUT_ROW = 470
/** a sensor module below and left of a board at (0, 0) */
const SENSOR_SPOT = { x: -330, y: 260 }
/** a screen or servo just above a board at (0, 0) */
const ABOVE_BOARD = { x: -40, y: -250 }

type Output = {
  key: string
  pin: string
  type: 'led' | 'buzzer'
  color?: LedColor
  ohms: number
  wire: WireColor
}

/** Pins driving LEDs and buzzers through their resistors, left to right, with a shared ground. */
function outputs(board: string, list: Output[], ground = `${board}:GND`): Preset {
  return {
    parts: list.flatMap((o, i) => [
      { key: `${o.key}R`, type: 'resistor', x: FIRST_COLUMN + i * COLUMN, y: RESISTOR_ROW, rotation: 90, data: { resistance: o.ohms } },
      { key: o.key, type: o.type, x: FIRST_COLUMN + i * COLUMN, y: OUTPUT_ROW, rotation: 90, data: o.color ? { color: o.color } : undefined },
    ] satisfies PresetPart[]),
    wires: [
      ...list.flatMap((o): PresetWire[] => [
        [`${board}:${o.pin}`, `${o.key}R:a`, o.wire],
        [`${o.key}R:b`, `${o.key}:a`, o.wire],
      ]),
      // the − ends join along the bottom, then one wire runs back
      ...list.slice(1).map((o, i): PresetWire => [`${o.key}:b`, `${list[i].key}:b`, 'black']),
      [`${list[0].key}:b`, ground, 'black'],
    ],
  }
}

/** A 3-pin sensor module below and left of a board, reporting to its input. */
function sensorFor(board: string, type: BoardType, sensor: PartType, data?: Partial<PartData>): Preset {
  const spec = BOARDS[type]
  return {
    parts: [{ key: 'sensor', type: sensor, ...SENSOR_SPOT, data }],
    wires: [
      [`${board}:${spec.supply}`, 'sensor:VCC', 'red'],
      ['sensor:GND', `${board}:GND`, 'black'],
      ['sensor:OUT', `${board}:${spec.input}`, 'yellow'],
    ],
  }
}

const join = (...presets: Preset[]): Preset => ({
  parts: presets.flatMap((p) => p.parts),
  wires: presets.flatMap((p) => p.wires),
})

/** colour and resistor of each LED in the rainbow: blue needs more volts, so it gets less resistance */
const RAINBOW: [LedColor, number][] = [
  ['red', 220],
  ['yellow', 220],
  ['green', 220],
  ['blue', 100],
]

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
  // pin 13 blinks a red LED, pin 9 fades a blue one; each LED has its resistor
  arduino: {
    parts: [
      {
        key: 'uno',
        type: 'arduino',
        x: 0,
        y: 150,
        data: { pins: { D13: 'blink', D12: 'off', D11: 'off', D10: 'off', D9: 'fade', D8: 'off' } },
      },
      { key: 'r1', type: 'resistor', x: 330, y: 0, data: { resistance: 220 } },
      { key: 'l1', type: 'led', x: 610, y: 0, data: { color: 'red' } },
      { key: 'r2', type: 'resistor', x: 330, y: 330, data: { resistance: 220 } },
      { key: 'l2', type: 'led', x: 610, y: 330, data: { color: 'blue' } },
    ],
    wires: [
      ['uno:D13', 'r1:a', 'red'],
      ['r1:b', 'l1:a', 'yellow'],
      ['l1:b', 'uno:GND', 'black'],
      ['uno:D9', 'r2:a', 'blue'],
      ['r2:b', 'l2:a', 'yellow'],
      ['l2:b', 'uno:GND', 'black'],
    ],
  },
  // a small current through the button and 1 kΩ switches the big lamp current
  transistor: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 180, rotation: 270, data: { voltage: 4.5 } },
      { key: 'lamp', type: 'lamp', x: 300, y: -20 },
      { key: 'q', type: 'transistor', x: 620, y: 180 },
      { key: 'btn', type: 'button', x: 160, y: 430 },
      { key: 'rb', type: 'resistor', x: 430, y: 430, data: { resistance: 1000 } },
    ],
    wires: [
      ['bat:a', 'lamp:a', 'red'],
      ['lamp:b', 'q:C', 'yellow'],
      ['q:E', 'bat:b', 'black'],
      ['bat:a', 'btn:a', 'red'],
      ['btn:b', 'rb:a', 'blue'],
      ['rb:b', 'q:B', 'blue'],
    ],
  },
  // switch on: the capacitor fills up. Switch off: it keeps the LED glowing for a while
  capacitor: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 180, rotation: 270, data: { voltage: 4.5 } },
      { key: 'sw', type: 'switch', x: 300, y: -20, data: { closed: true } },
      { key: 'cap', type: 'capacitor', x: 600, y: 180, rotation: 90, data: { capacitance: 10000 } },
      { key: 'r', type: 'resistor', x: 880, y: -20, data: { resistance: 220 } },
      { key: 'led', type: 'led', x: 1160, y: 180, rotation: 90, data: { color: 'yellow' } },
    ],
    wires: [
      ['bat:a', 'sw:a', 'red'],
      ['sw:b', 'cap:a', 'red'],
      ['cap:b', 'bat:b', 'black'],
      ['cap:a', 'r:a', 'yellow'],
      ['r:b', 'led:a', 'yellow'],
      ['led:b', 'cap:b', 'black'],
    ],
  },
  solar: {
    parts: [
      { key: 'sun', type: 'solar', x: 0, y: 150, rotation: 270, data: { light: 1 } },
      { key: 'm', type: 'motor', x: 330, y: 150, rotation: 90 },
    ],
    wires: [
      ['sun:a', 'm:a', 'red'],
      ['m:b', 'sun:b', 'black'],
    ],
  },
  // the fading pin 9 makes the servo sweep back and forth
  servo: {
    parts: [
      {
        key: 'uno',
        type: 'arduino',
        x: 0,
        y: 150,
        data: { pins: { D13: 'blink', D12: 'off', D11: 'off', D10: 'off', D9: 'fade', D8: 'off' } },
      },
      { key: 'servo', type: 'servo', x: 380, y: 150 },
    ],
    wires: [
      ['uno:5V', 'servo:VCC', 'red'],
      ['servo:GND', 'uno:GND', 'black'],
      ['uno:D9', 'servo:OUT', 'yellow'],
    ],
  },
  // the motion sensor talks to A0; pin 13 follows it and lights the LED
  motion: {
    parts: [
      { key: 'pir', type: 'pir', x: -340, y: 150 },
      {
        key: 'uno',
        type: 'arduino',
        x: 0,
        y: 150,
        data: { pins: { D13: 'follow', D12: 'off', D11: 'off', D10: 'off', D9: 'off', D8: 'off' } },
      },
      { key: 'r', type: 'resistor', x: 340, y: 0, data: { resistance: 220 } },
      { key: 'led', type: 'led', x: 620, y: 0, data: { color: 'green' } },
    ],
    wires: [
      ['uno:5V', 'pir:VCC', 'red'],
      ['pir:GND', 'uno:GND', 'black'],
      ['pir:OUT', 'uno:A0', 'yellow'],
      ['uno:D13', 'r:a', 'blue'],
      ['r:b', 'led:a', 'blue'],
      ['led:b', 'uno:GND', 'black'],
    ],
  },
  // the ammeter sits in the loop, the voltmeter across the lamp
  meters: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 180, rotation: 270 },
      { key: 'amm', type: 'ammeter', x: 300, y: -20 },
      { key: 'lamp', type: 'lamp', x: 600, y: 180, rotation: 90 },
      { key: 'vm', type: 'voltmeter', x: 880, y: 180, rotation: 90 },
    ],
    wires: [
      ['bat:a', 'amm:a', 'red'],
      ['amm:b', 'lamp:a', 'yellow'],
      ['lamp:b', 'bat:b', 'black'],
      ['lamp:a', 'vm:a', 'red'],
      ['lamp:b', 'vm:b', 'black'],
    ],
  },
  // a 6 × 3 panel video wall plays every built-in show from a big battery;
  // the moving sign under it runs on sunlight
  cityTv: {
    parts: [
      { key: 'bat', type: 'battery', x: -300, y: 72, rotation: 270, data: { voltage: 9 } },
      { key: 'wall', type: 'ledwall', x: 0, y: 0, data: { cols: 6, rows: 3, mode: 'demo', demo: 'reel', brightness: 0.9 } },
      { key: 'sun', type: 'solar', x: -300, y: 336, rotation: 270, data: { light: 1 } },
      {
        key: 'sign',
        type: 'matrix',
        x: 0,
        y: 348,
        data: (texts) => ({ cols: 9, rows: 1, tint: 'rainbow', text: texts.citySign || undefined, speed: 0.55, brightness: 0.7 }),
      },
    ],
    wires: [
      ['bat:a', 'wall:VCC', 'red'],
      ['wall:GND', 'bat:b', 'black'],
      ['sun:a', 'sign:VCC', 'red'],
      ['sign:GND', 'sun:b', 'black'],
    ],
  },
  // two lines of gold words; the sample text greets you and shows the gold price line
  goldSign: {
    parts: [
      { key: 'bat', type: 'battery', x: -300, y: 120, rotation: 270, data: { voltage: 4.5 } },
      { key: 'sign', type: 'matrix', x: 0, y: 110, data: { cols: 6, rows: 2, tint: 'yellow', effect: 'sparkle', speed: 0.45 } },
    ],
    wires: [
      ['bat:a', 'sign:VCC', 'red'],
      ['sign:GND', 'bat:b', 'black'],
    ],
  },
  counter: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270, data: { voltage: 4.5 } },
      { key: 'clock', type: 'segment', x: 300, y: 150, data: { digits: 4, mode: 'clock', tint: 'red' } },
    ],
    wires: [
      ['bat:a', 'clock:VCC', 'red'],
      ['clock:GND', 'bat:b', 'black'],
    ],
  },

  // ── first circuits ──

  // four LEDs side by side, each with its own resistor: + along the top, − along the bottom
  rainbow: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 160, rotation: 270, data: { voltage: 4.5 } },
      ...RAINBOW.flatMap(([color, ohms], i): PresetPart[] => [
        { key: `r${i}`, type: 'resistor', x: 270 + i * COLUMN, y: 0, rotation: 90, data: { resistance: ohms } },
        { key: `l${i}`, type: 'led', x: 270 + i * COLUMN, y: 240, rotation: 90, data: { color } },
      ]),
    ],
    wires: [
      ['bat:a', 'r0:a', 'red'],
      ...RAINBOW.slice(1).map((_, i): PresetWire => [`r${i}:a`, `r${i + 1}:a`, 'red']),
      ...RAINBOW.map((_, i): PresetWire => [`r${i}:b`, `l${i}:a`, 'yellow']),
      ...RAINBOW.slice(1).map((_, i): PresetWire => [`l${i + 1}:b`, `l${i}:b`, 'black']),
      ['l0:b', 'bat:b', 'black'],
    ],
  },
  // one switch, two wheels
  toyCar: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270 },
      { key: 'sw', type: 'switch', x: 290, y: -40, data: { closed: true } },
      { key: 'left', type: 'motor', x: 580, y: 150, rotation: 90 },
      { key: 'right', type: 'motor', x: 820, y: 150, rotation: 90 },
    ],
    wires: [
      ['bat:a', 'sw:a', 'red'],
      ['sw:b', 'left:a', 'yellow'],
      ['left:a', 'right:a', 'yellow'],
      ['right:b', 'left:b', 'black'],
      ['left:b', 'bat:b', 'black'],
    ],
  },
  // the voltmeter reads the battery; the green LED needs about 2 volts, so 1.5 V leaves it dark
  batteryTester: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270, data: { voltage: 4.5 } },
      { key: 'vm', type: 'voltmeter', x: 290, y: 150, rotation: 90 },
      { key: 'r', type: 'resistor', x: 560, y: -40, data: { resistance: 220 } },
      { key: 'led', type: 'led', x: 850, y: 150, rotation: 90, data: { color: 'green' } },
    ],
    wires: [
      ['bat:a', 'vm:a', 'red'],
      ['vm:a', 'r:a', 'red'],
      ['r:b', 'led:a', 'yellow'],
      ['led:b', 'vm:b', 'black'],
      ['vm:b', 'bat:b', 'black'],
    ],
  },

  // ── electronics ──

  // the light sensor and R1 share the battery's volts: in the dark the sensor takes most of
  // them, B gets enough and the transistor lights the lamp. The diode under E makes it wait
  // for real darkness instead of switching on at the first cloud
  streetLamp: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270, data: { voltage: 4.5 } },
      { key: 'r1', type: 'resistor', x: 260, y: -80, rotation: 90, data: { resistance: 1000 } },
      { key: 'ldr', type: 'ldr', x: 260, y: 330, rotation: 90, data: { light: 0.1 } },
      { key: 'q', type: 'transistor', x: 500, y: 150 },
      { key: 'lamp', type: 'lamp', x: 740, y: -80, rotation: 90 },
      { key: 'd', type: 'diode', x: 740, y: 330, rotation: 90 },
    ],
    wires: [
      ['bat:a', 'r1:a', 'red'],
      ['r1:a', 'lamp:a', 'red'],
      ['r1:b', 'ldr:a', 'yellow'],
      ['r1:b', 'q:B', 'yellow'],
      ['lamp:b', 'q:C', 'yellow'],
      ['q:E', 'd:a', 'blue'],
      ['d:b', 'ldr:b', 'black'],
      ['ldr:b', 'bat:b', 'black'],
    ],
  },
  // flip the switch: it joins both ends of the lamp, the current jumps and the fuse breaks first
  fuseGuard: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270 },
      { key: 'fuse', type: 'fuse', x: 290, y: -40, data: { rating: 0.5 } },
      { key: 'lamp', type: 'lamp', x: 580, y: 150, rotation: 90 },
      { key: 'sw', type: 'switch', x: 820, y: 150, rotation: 90, data: { closed: false } },
    ],
    wires: [
      ['bat:a', 'fuse:a', 'red'],
      ['fuse:b', 'lamp:a', 'yellow'],
      ['lamp:a', 'sw:a', 'yellow'],
      ['sw:b', 'lamp:b', 'black'],
      ['lamp:b', 'bat:b', 'black'],
    ],
  },
  // the sun fills the capacitor; the diode stops it emptying back into the dark panel
  solarGarden: {
    parts: [
      { key: 'sun', type: 'solar', x: 0, y: 150, rotation: 270, data: { light: 1 } },
      { key: 'd', type: 'diode', x: 290, y: -40 },
      { key: 'cap', type: 'capacitor', x: 580, y: 150, rotation: 90, data: { capacitance: 10000 } },
      { key: 'r', type: 'resistor', x: 860, y: -40, data: { resistance: 220 } },
      { key: 'led', type: 'led', x: 1150, y: 150, rotation: 90, data: { color: 'yellow' } },
    ],
    wires: [
      ['sun:a', 'd:a', 'red'],
      ['d:b', 'cap:a', 'red'],
      ['cap:a', 'r:a', 'yellow'],
      ['r:b', 'led:a', 'yellow'],
      ['led:b', 'cap:b', 'black'],
      ['cap:b', 'sun:b', 'black'],
    ],
  },
  // the sound sensor's signal feeds the transistor: the louder, the brighter the lamp
  noiseLight: {
    parts: [
      { key: 'bat', type: 'battery', x: -420, y: 120, rotation: 270, data: { voltage: 4.5 } },
      { key: 'mic', type: 'soundSensor', x: 0, y: 0, data: { sense: 0.8 } },
      { key: 'rb', type: 'resistor', x: 260, y: 0, data: { resistance: 220 } },
      { key: 'q', type: 'transistor', x: 520, y: 0 },
      { key: 'lamp', type: 'lamp', x: 760, y: -260, rotation: 90 },
    ],
    wires: [
      ['bat:a', 'mic:VCC', 'red'],
      ['mic:GND', 'bat:b', 'black'],
      ['mic:OUT', 'rb:a', 'yellow'],
      ['rb:b', 'q:B', 'yellow'],
      ['bat:a', 'lamp:a', 'red'],
      ['lamp:b', 'q:C', 'yellow'],
      ['q:E', 'bat:b', 'black'],
    ],
  },

  // ── boards and code ──

  // red, then green, then yellow, one second each
  trafficLight: join(
    { parts: [{ key: 'board', type: 'pico', x: 0, y: 0, data: program('pico', { GP13: 'step1', GP14: 'step3', GP15: 'step2' }) }], wires: [] },
    outputs('board', [
      { key: 'red', pin: 'GP13', type: 'led', color: 'red', ohms: 47, wire: 'white' },
      { key: 'yellow', pin: 'GP14', type: 'led', color: 'yellow', ohms: 47, wire: 'yellow' },
      { key: 'green', pin: 'GP15', type: 'led', color: 'green', ohms: 47, wire: 'green' },
    ]),
  ),
  // red and blue take turns; the fading pin makes the buzzer rise and fall like a siren
  policeLights: join(
    { parts: [{ key: 'board', type: 'nano', x: 0, y: 0, data: program('nano', { D8: 'blink', D10: 'blink2', D11: 'fade' }) }], wires: [] },
    outputs('board', [
      { key: 'red', pin: 'D8', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'blue', pin: 'D10', type: 'led', color: 'blue', ohms: 100, wire: 'blue' },
      { key: 'siren', pin: 'D11', type: 'buzzer', ohms: 100, wire: 'yellow' },
    ]),
  ),
  // three lights chase each other, a fourth breathes, and the sign sparkles
  partyLights: join(
    {
      parts: [
        { key: 'board', type: 'mega', x: 0, y: 0, data: program('mega', { D10: 'step1', D11: 'step2', D12: 'step3', D13: 'fade' }) },
        { key: 'sign', type: 'matrix', ...ABOVE_BOARD, y: -210, data: (texts) => ({ cols: 4, rows: 1, tint: 'rainbow', effect: 'sparkle', speed: 0.6, text: texts.party || undefined }) },
      ],
      wires: [
        ['board:5V', 'sign:VCC', 'red'],
        ['sign:GND', 'board:GND', 'black'],
      ],
    },
    outputs('board', [
      { key: 'red', pin: 'D10', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'green', pin: 'D11', type: 'led', color: 'green', ohms: 220, wire: 'green' },
      { key: 'blue', pin: 'D12', type: 'led', color: 'blue', ohms: 100, wire: 'blue' },
      { key: 'gold', pin: 'D13', type: 'led', color: 'yellow', ohms: 220, wire: 'yellow' },
    ]),
  ),
  // red and green take turns, the gold star breathes; the Python program starts them at different times
  holidayLights: join(
    {
      parts: [
        { key: 'board', type: 'raspberrypi', x: 0, y: 0, data: program('raspberrypi', { GPIO22: 'fade', GPIO23: 'blink', GPIO24: 'blink2' }) },
        { key: 'sign', type: 'matrix', ...ABOVE_BOARD, y: -210, data: (texts) => ({ cols: 4, rows: 1, tint: 'rainbow', effect: 'sparkle', speed: 0.5, text: texts.holiday || undefined }) },
      ],
      wires: [
        ['board:3V3', 'sign:VCC', 'red'],
        ['sign:GND', 'board:GND', 'black'],
      ],
    },
    outputs('board', [
      { key: 'green', pin: 'GPIO24', type: 'led', color: 'green', ohms: 47, wire: 'green' },
      { key: 'red', pin: 'GPIO23', type: 'led', color: 'red', ohms: 47, wire: 'white' },
      { key: 'star', pin: 'GPIO22', type: 'led', color: 'yellow', ohms: 47, wire: 'yellow' },
    ]),
  ),
  // two red lights take turns and the gate (the servo) stays down
  railroad: join(
    {
      parts: [
        { key: 'board', type: 'arduino', x: 0, y: 0, data: program('arduino', { D13: 'on', D12: 'blink2', D8: 'blink' }) },
        { key: 'gate', type: 'servo', ...ABOVE_BOARD },
      ],
      wires: [
        ['board:5V', 'gate:VCC', 'red'],
        ['gate:GND', 'board:GND', 'black'],
        ['board:D13', 'gate:OUT', 'blue'],
      ],
    },
    outputs('board', [
      { key: 'left', pin: 'D8', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'right', pin: 'D12', type: 'led', color: 'red', ohms: 220, wire: 'white' },
    ]),
  ),

  // ── smart gadgets ──

  // the light sensor and 1 kΩ make a voltage that falls in the dark; the lights do the opposite
  nightLight: join(
    {
      parts: [
        { key: 'board', type: 'microbit', x: 0, y: 0, data: program('microbit', { P0: 'invert', P1: 'invert' }) },
        { key: 'ldr', type: 'ldr', x: -330, y: -230, rotation: 90, data: { light: 0.15 } },
        { key: 'div', type: 'resistor', x: -330, y: 30, rotation: 90, data: { resistance: 1000 } },
      ],
      wires: [
        ['board:3V3', 'ldr:a', 'red'],
        ['ldr:b', 'board:P2', 'yellow'],
        ['ldr:b', 'div:a', 'yellow'],
        ['div:b', 'board:GND', 'black'],
      ],
    },
    outputs(
      'board',
      [
        { key: 'lamp1', pin: 'P1', type: 'led', color: 'yellow', ohms: 47, wire: 'white' },
        { key: 'lamp2', pin: 'P0', type: 'led', color: 'yellow', ohms: 47, wire: 'yellow' },
      ],
      'div:b',
    ),
  ),
  // clean air: the green light. Smoke: the red light flashes and the buzzer beeps
  smokeAlarm: join(
    { parts: [{ key: 'board', type: 'arduino', x: 0, y: 0, data: program('arduino', { D8: 'invert', D12: 'alarm', D13: 'alarm' }) }], wires: [] },
    sensorFor('board', 'arduino', 'gasSensor', { sense: 0.1 }),
    outputs('board', [
      { key: 'safe', pin: 'D8', type: 'led', color: 'green', ohms: 220, wire: 'green' },
      { key: 'warn', pin: 'D12', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'siren', pin: 'D13', type: 'buzzer', ohms: 100, wire: 'blue' },
    ], 'sensor:GND'),
  ),
  // far: green. Closer: the red light grows and the beeps get faster
  parkingSensor: join(
    { parts: [{ key: 'board', type: 'nano', x: 0, y: 0, data: program('nano', { D8: 'invert', D9: 'follow', D13: 'alarm' }) }], wires: [] },
    sensorFor('board', 'nano', 'ultrasonic', { sense: 0.6 }),
    outputs('board', [
      { key: 'far', pin: 'D8', type: 'led', color: 'green', ohms: 220, wire: 'green' },
      { key: 'near', pin: 'D9', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'beeper', pin: 'D13', type: 'buzzer', ohms: 100, wire: 'blue' },
    ], 'sensor:GND'),
  ),
  // the screen shows how wet the soil is; red glows when the plant is thirsty
  plantAlarm: join(
    {
      parts: [
        { key: 'board', type: 'arduino', x: 0, y: 0, data: program('arduino', { D8: 'follow', D10: 'invert', D11: 'follow' }) },
        { key: 'screen', type: 'oled', ...ABOVE_BOARD, data: { mode: 'graph' } },
      ],
      wires: [
        ['board:5V', 'screen:VCC', 'red'],
        ['screen:GND', 'board:GND', 'black'],
        ['board:D11', 'screen:S', 'blue'],
      ],
    },
    sensorFor('board', 'arduino', 'soilSensor', { sense: 0.2 }),
    outputs('board', [
      { key: 'wet', pin: 'D8', type: 'led', color: 'green', ohms: 220, wire: 'green' },
      { key: 'dry', pin: 'D10', type: 'led', color: 'red', ohms: 220, wire: 'white' },
    ], 'sensor:GND'),
  ),
  // the hotter it gets, the more pin 2 lets through the transistor, the faster the fan.
  // The diode across the motor catches the kick it gives when it slows down
  smartFan: {
    parts: [
      { key: 'board', type: 'esp32', x: 0, y: 0, data: program('esp32', { G2: 'follow' }) },
      { key: 'temp', type: 'tempSensor', x: -330, y: 250, data: { sense: 0.85 } },
      { key: 'rb', type: 'resistor', x: 330, y: 0, data: { resistance: 470 } },
      { key: 'q', type: 'transistor', x: 590, y: 0 },
      { key: 'fan', type: 'motor', x: 640, y: -330, rotation: 90 },
      { key: 'd', type: 'diode', x: 880, y: -330, rotation: 270 },
    ],
    wires: [
      ['board:3V3', 'temp:VCC', 'red'],
      ['temp:GND', 'board:GND', 'black'],
      ['temp:OUT', 'board:G34', 'yellow'],
      ['board:G2', 'rb:a', 'blue'],
      ['rb:b', 'q:B', 'blue'],
      ['board:3V3', 'fan:a', 'red'],
      ['fan:a', 'd:b', 'red'],
      ['d:a', 'fan:b', 'yellow'],
      ['fan:b', 'q:C', 'yellow'],
      ['q:E', 'temp:GND', 'black'],
    ],
  },
  // someone comes: the door (the servo) swings open and the light turns green
  autoDoor: join(
    {
      parts: [
        { key: 'board', type: 'arduino', x: 0, y: 0, data: program('arduino', { D13: 'follow', D12: 'follow', D8: 'invert' }) },
        { key: 'door', type: 'servo', ...ABOVE_BOARD },
      ],
      wires: [
        ['board:5V', 'door:VCC', 'red'],
        ['door:GND', 'board:GND', 'black'],
        ['board:D13', 'door:OUT', 'blue'],
      ],
    },
    sensorFor('board', 'arduino', 'pir'),
    outputs('board', [
      { key: 'shut', pin: 'D8', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'open', pin: 'D12', type: 'led', color: 'green', ohms: 220, wire: 'green' },
    ], 'sensor:GND'),
  ),
  // the servo sweeps the sensor around; something close lights the red LED and starts the beeps
  radar: join(
    {
      parts: [
        { key: 'board', type: 'mega', x: 0, y: 0, data: program('mega', { D13: 'fade', D11: 'alarm', D10: 'follow' }) },
        { key: 'sweep', type: 'servo', ...ABOVE_BOARD },
      ],
      wires: [
        ['board:5V', 'sweep:VCC', 'red'],
        ['sweep:GND', 'board:GND', 'black'],
        ['board:D13', 'sweep:OUT', 'blue'],
      ],
    },
    sensorFor('board', 'mega', 'ultrasonic', { sense: 0.7 }),
    outputs('board', [
      { key: 'target', pin: 'D10', type: 'led', color: 'red', ohms: 220, wire: 'white' },
      { key: 'beeper', pin: 'D11', type: 'buzzer', ohms: 100, wire: 'yellow' },
    ], 'sensor:GND'),
  ),
  // the magnet on the door keeps the switch closed and A0 low. Open the door: A0 goes high
  doorAlarm: join(
    {
      parts: [
        { key: 'board', type: 'arduino', x: 0, y: 0, data: program('arduino', { D8: 'invert', D12: 'alarm', D13: 'alarm' }) },
        { key: 'pull', type: 'resistor', x: -330, y: -230, rotation: 90, data: { resistance: 1000 } },
        { key: 'reed', type: 'reed', x: -330, y: 30, rotation: 90, data: { sense: 1 } },
      ],
      wires: [
        ['board:5V', 'pull:a', 'red'],
        ['pull:b', 'board:A0', 'yellow'],
        ['pull:b', 'reed:a', 'yellow'],
        ['reed:b', 'board:GND', 'black'],
      ],
    },
    outputs(
      'board',
      [
        { key: 'safe', pin: 'D8', type: 'led', color: 'green', ohms: 220, wire: 'green' },
        { key: 'warn', pin: 'D12', type: 'led', color: 'red', ohms: 220, wire: 'white' },
        { key: 'siren', pin: 'D13', type: 'buzzer', ohms: 100, wire: 'blue' },
      ],
      'reed:b',
    ),
  ),
  // two boards: the Uno watches the door, the ESP32 keeps the room cool
  smartHome: join(
    {
      parts: [
        { key: 'board', type: 'arduino', x: 0, y: 0, data: program('arduino', { D12: 'follow', D13: 'alarm' }) },
        {
          key: 'screen',
          type: 'lcd',
          ...ABOVE_BOARD,
          data: (texts) => ({ cols: 16, rows: 2, tint: 'blue', text: texts.smartHome || undefined }),
        },
      ],
      wires: [
        ['board:5V', 'screen:VCC', 'red'],
        ['screen:GND', 'board:GND', 'black'],
      ],
    },
    sensorFor('board', 'arduino', 'pir'),
    outputs('board', [
      { key: 'porch', pin: 'D12', type: 'led', color: 'white', ohms: 100, wire: 'white' },
      { key: 'chime', pin: 'D13', type: 'buzzer', ohms: 100, wire: 'blue' },
    ], 'sensor:GND'),
    {
      parts: [
        { key: 'esp', type: 'esp32', x: 0, y: 880, data: program('esp32', { G2: 'follow' }) },
        { key: 'temp', type: 'tempSensor', x: -330, y: 1140, data: { sense: 0.8 } },
        { key: 'rb', type: 'resistor', x: 430, y: 880, data: { resistance: 470 } },
        { key: 'q', type: 'transistor', x: 750, y: 880 },
        { key: 'fan', type: 'motor', x: 1000, y: 600, rotation: 90 },
        { key: 'd', type: 'diode', x: 1240, y: 600, rotation: 270 },
      ],
      wires: [
        ['esp:3V3', 'temp:VCC', 'red'],
        ['temp:GND', 'esp:GND', 'black'],
        ['temp:OUT', 'esp:G34', 'yellow'],
        ['esp:G2', 'rb:a', 'blue'],
        ['rb:b', 'q:B', 'blue'],
        ['esp:3V3', 'fan:a', 'red'],
        ['fan:a', 'd:b', 'red'],
        ['d:a', 'fan:b', 'yellow'],
        ['fan:b', 'q:C', 'yellow'],
        ['q:E', 'temp:GND', 'black'],
      ],
    },
  ),

  // ── screens and signs ──

  // more heat, more volts on S: the numbers climb. The battery sits between the two
  // modules, + to the top one and − to the bottom one, with a short lane down each side
  thermometer: {
    parts: [
      { key: 'bat', type: 'battery', x: -520, y: -80, rotation: 270, data: { voltage: 4.5 } },
      { key: 'digits', type: 'segment', x: 0, y: -270, data: { digits: 4, mode: 'volts', tint: 'green' } },
      { key: 'temp', type: 'tempSensor', x: -170, y: 0, data: { sense: 0.55 } },
    ],
    wires: [
      ['bat:a', 'digits:VCC', 'red'],
      ['digits:VCC', 'temp:VCC', 'red'],
      ['digits:GND', 'temp:GND', 'black'],
      ['bat:b', 'temp:GND', 'black'],
      ['temp:OUT', 'digits:S', 'yellow'],
    ],
  },
  // the score on a big sign and a game clock, all from one battery
  scoreboard: {
    parts: [
      { key: 'bat', type: 'battery', x: -520, y: -80, rotation: 270, data: { voltage: 9 } },
      { key: 'clock', type: 'segment', x: 0, y: -270, data: { digits: 4, mode: 'counter', tint: 'yellow' } },
      {
        key: 'sign',
        type: 'matrix',
        x: -170,
        y: 0,
        data: (texts) => ({ cols: 6, rows: 2, tint: 'rainbow', effect: 'sparkle', speed: 0.5, brightness: 0.8, text: texts.score || undefined }),
      },
    ],
    wires: [
      ['bat:a', 'clock:VCC', 'red'],
      ['clock:VCC', 'sign:VCC', 'red'],
      ['clock:GND', 'sign:GND', 'black'],
      ['bat:b', 'sign:GND', 'black'],
    ],
  },
  // the screen always says hello; hold the button to ring
  doorbellScreen: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270, data: { voltage: 4.5 } },
      { key: 'btn', type: 'button', x: 290, y: -40 },
      { key: 'bell', type: 'buzzer', x: 580, y: 150, rotation: 90 },
      { key: 'screen', type: 'lcd', x: 300, y: 430, data: (texts) => ({ cols: 16, rows: 2, tint: 'blue', text: texts.doorbell || undefined }) },
    ],
    wires: [
      ['bat:a', 'btn:a', 'red'],
      ['btn:b', 'bell:a', 'yellow'],
      ['bell:b', 'bat:b', 'black'],
      ['btn:a', 'screen:VCC', 'red'],
      ['bat:b', 'screen:GND', 'black'],
    ],
  },
  // a bus stop board that runs on sunlight: the next buses and the time
  busStop: {
    parts: [
      { key: 'sun', type: 'solar', x: -520, y: -80, rotation: 270, data: { light: 1 } },
      { key: 'board', type: 'lcd', x: 0, y: -270, data: (texts) => ({ cols: 20, rows: 4, tint: 'green', text: texts.busStop || undefined }) },
      { key: 'clock', type: 'segment', x: -170, y: 0, data: { digits: 4, mode: 'clock', tint: 'red' } },
    ],
    wires: [
      ['sun:a', 'board:VCC', 'red'],
      ['board:VCC', 'clock:VCC', 'red'],
      ['board:GND', 'clock:GND', 'black'],
      ['sun:b', 'clock:GND', 'black'],
    ],
  },
  // a pocket TV: flip the switch to turn it on
  pocketTv: {
    parts: [
      { key: 'bat', type: 'battery', x: 0, y: 150, rotation: 270, data: { voltage: 4.5 } },
      { key: 'power', type: 'switch', x: 290, y: -40, data: { closed: true } },
      { key: 'tv', type: 'tft', x: 600, y: 120, data: { mode: 'demo', demo: 'fireworks' } },
    ],
    wires: [
      ['bat:a', 'power:a', 'red'],
      ['power:b', 'tv:VCC', 'red'],
      ['tv:GND', 'bat:b', 'black'],
    ],
  },
}

/** How hard an example is to understand: 1 easy, 2 medium, 3 hard. */
export type PresetLevel = 1 | 2 | 3

/** The shelves of the examples gallery. */
export type PresetCategory = 'first' | 'electronics' | 'boards' | 'smart' | 'screens'

export const PRESET_CATEGORIES: readonly PresetCategory[] = ['first', 'electronics', 'boards', 'smart', 'screens']

/** A part in an example's picture; LEDs can say their colour (`led:green`). */
export type PresetArt = PartType | `led:${LedColor}`

export type PresetInfo = {
  category: PresetCategory
  level: PresetLevel
  /** the main parts, drawn together as the example's little picture (2 to 4) */
  art: readonly PresetArt[]
}

/** Where each example sits in the gallery, how hard it is and what its picture shows. */
export const PRESET_INFO: Record<PresetId, PresetInfo> = {
  flashlight: { category: 'first', level: 1, art: ['battery', 'switch', 'lamp'] },
  fan: { category: 'first', level: 1, art: ['battery', 'switch', 'motor'] },
  doorbell: { category: 'first', level: 1, art: ['battery', 'button', 'buzzer'] },
  led: { category: 'first', level: 1, art: ['battery', 'resistor', 'led:green'] },
  rainbow: { category: 'first', level: 1, art: ['battery', 'led:red', 'led:green', 'led:blue'] },
  toyCar: { category: 'first', level: 1, art: ['battery', 'switch', 'motor', 'motor'] },
  batteryTester: { category: 'first', level: 1, art: ['battery', 'voltmeter', 'led:green'] },
  series: { category: 'first', level: 1, art: ['battery', 'lamp', 'lamp'] },
  parallel: { category: 'first', level: 1, art: ['battery', 'lamp', 'lamp'] },
  dimmer: { category: 'first', level: 1, art: ['battery', 'dimmer', 'lamp'] },
  short: { category: 'first', level: 1, art: ['battery', 'switch'] },

  solar: { category: 'electronics', level: 1, art: ['solar', 'motor'] },
  meters: { category: 'electronics', level: 2, art: ['ammeter', 'lamp', 'voltmeter'] },
  transistor: { category: 'electronics', level: 2, art: ['button', 'transistor', 'lamp'] },
  capacitor: { category: 'electronics', level: 2, art: ['battery', 'capacitor', 'led:yellow'] },
  fuseGuard: { category: 'electronics', level: 2, art: ['battery', 'fuse', 'lamp'] },
  solarGarden: { category: 'electronics', level: 2, art: ['solar', 'diode', 'capacitor', 'led:yellow'] },
  noiseLight: { category: 'electronics', level: 2, art: ['soundSensor', 'transistor', 'lamp'] },
  streetLamp: { category: 'electronics', level: 3, art: ['ldr', 'transistor', 'lamp'] },

  arduino: { category: 'boards', level: 1, art: ['arduino', 'resistor', 'led'] },
  servo: { category: 'boards', level: 2, art: ['arduino', 'servo'] },
  trafficLight: { category: 'boards', level: 2, art: ['pico', 'led:red', 'led:yellow', 'led:green'] },
  policeLights: { category: 'boards', level: 2, art: ['nano', 'led:red', 'led:blue', 'buzzer'] },
  railroad: { category: 'boards', level: 2, art: ['arduino', 'led', 'servo'] },
  holidayLights: { category: 'boards', level: 2, art: ['raspberrypi', 'led:green', 'matrix'] },
  partyLights: { category: 'boards', level: 3, art: ['mega', 'led:green', 'led:blue', 'matrix'] },

  motion: { category: 'smart', level: 2, art: ['pir', 'arduino', 'led:green'] },
  nightLight: { category: 'smart', level: 2, art: ['ldr', 'microbit', 'led:yellow'] },
  autoDoor: { category: 'smart', level: 2, art: ['pir', 'arduino', 'servo'] },
  plantAlarm: { category: 'smart', level: 2, art: ['soilSensor', 'arduino', 'oled'] },
  smokeAlarm: { category: 'smart', level: 2, art: ['gasSensor', 'arduino', 'buzzer'] },
  parkingSensor: { category: 'smart', level: 2, art: ['ultrasonic', 'nano', 'buzzer'] },
  doorAlarm: { category: 'smart', level: 2, art: ['reed', 'arduino', 'buzzer'] },
  smartFan: { category: 'smart', level: 3, art: ['tempSensor', 'esp32', 'transistor', 'motor'] },
  radar: { category: 'smart', level: 3, art: ['ultrasonic', 'mega', 'servo'] },
  smartHome: { category: 'smart', level: 3, art: ['pir', 'arduino', 'esp32', 'lcd'] },

  counter: { category: 'screens', level: 1, art: ['battery', 'segment'] },
  goldSign: { category: 'screens', level: 1, art: ['battery', 'matrix'] },
  pocketTv: { category: 'screens', level: 1, art: ['battery', 'switch', 'tft'] },
  doorbellScreen: { category: 'screens', level: 1, art: ['button', 'lcd', 'buzzer'] },
  thermometer: { category: 'screens', level: 2, art: ['battery', 'tempSensor', 'segment'] },
  busStop: { category: 'screens', level: 2, art: ['solar', 'lcd', 'segment'] },
  scoreboard: { category: 'screens', level: 2, art: ['battery', 'segment', 'matrix'] },
  cityTv: { category: 'screens', level: 2, art: ['solar', 'ledwall', 'matrix'] },
}

/** Every example, shelf by shelf, easiest first. */
export const PRESET_ORDER: PresetId[] = PRESET_CATEGORIES.flatMap((category) =>
  (Object.keys(PRESET_INFO) as PresetId[]).filter((id) => PRESET_INFO[id].category === category),
)

/** Builds a fresh board (new ids every time) from a preset. */
export function buildPreset(id: PresetId, texts: Partial<PresetTexts> = {}): CircuitSnapshot {
  const preset = PRESETS[id]
  const suffix = crypto.randomUUID().slice(0, 6)
  const nodeId = (key: string) => `${key}-${suffix}`

  const nodes: PartNode[] = preset.parts.map((p) => ({
    id: nodeId(p.key),
    type: 'part',
    position: { x: p.x, y: p.y },
    data: { ...createPartData(p.type), rotation: p.rotation ?? 0, ...(typeof p.data === 'function' ? p.data(texts) : p.data) },
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
