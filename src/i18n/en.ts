import type { PartCategory } from '@/circuit/catalog'
import type { PartStatus } from '@/circuit/solver'
import type { LampColor, LedColor, PartType, WireColor } from '@/circuit/types'

type PartText = { name: string; description: string; working: string }

export type Dictionary = {
  app: { title: string; subtitle: string }
  parts: Record<PartType, PartText>
  categories: Record<PartCategory, string>
  colors: Record<LampColor | LedColor | WireColor | 'auto', string>
  status: Record<PartStatus, string>
  tips: {
    lampWeak: string
    lampOver: string
    burnt: string
    ledReverse: string
    ledOver: string
    ledOff: string
    motorWeak: string
    motorOver: string
    motorReverse: string
    short: string
    resistorHot: string
    batteryIdle: string
  }
  sidebar: { title: string; hint: string; search: string; noResults: string; tapToAdd: string }
  toolbar: {
    examples: string
    undo: string
    redo: string
    running: string
    paused: string
    clear: string
    soundOn: string
    soundOff: string
    language: string
    theme: string
    help: string
    more: string
  }
  confirm: {
    clearTitle: string
    clearBody: string
    loadTitle: string
    loadBody: string
    cancel: string
    clear: string
    load: string
  }
  presets: Record<
    'flashlight' | 'fan' | 'doorbell' | 'led' | 'series' | 'parallel' | 'dimmer' | 'short',
    { name: string; description: string }
  >
  inspector: {
    tab: string
    missionsTab: string
    empty: string
    emptyHint: string
    voltage: string
    current: string
    power: string
    speed: string
    brightness: string
    batteryVoltage: string
    color: string
    resistance: string
    switchState: string
    on: string
    off: string
    knob: string
    rotate: string
    duplicate: string
    delete: string
    repair: string
    wire: string
    wireColor: string
    wireCurrent: string
    deleteWire: string
    readings: string
    settings: string
    whatItDoes: string
    plusEnd: string
    minusEnd: string
  }
  node: { on: string; off: string; press: string; replace: string }
  statusBar: {
    complete: string
    open: string
    short: string
    noBattery: string
    empty: string
    paused: string
    count: (parts: number, wires: number) => string
    batteryCurrent: string
  }
  toasts: {
    lampBurnt: string
    ledBurnt: string
    short: string
    mission: string
    copied: string
  }
  missions: {
    title: string
    progress: (done: number, total: number) => string
    reset: string
    allDone: string
    items: Record<
      'light' | 'flashlight' | 'motor' | 'reverse' | 'led' | 'doorbell' | 'parallel' | 'dimmer',
      string
    >
  }
  empty: { title: string; body: string; cta: string }
  help: { title: string; intro: string; steps: string[]; shortcuts: string; keys: [string, string][] }
  drag: { drop: string }
  wirePalette: string
  controls: { zoomIn: string; zoomOut: string; fit: string }
  units: { volt: string; amp: string; milliamp: string; watt: string; ohm: string }
}

/** English: the default language. Short, everyday words a young child can read. */
export const en: Dictionary = {
  app: { title: 'Circuit Lab', subtitle: 'Build it. Light it up!' },
  parts: {
    battery: {
      name: 'Battery',
      description: 'Gives power to your circuit. It has a + end and a − end.',
      working: 'Giving power',
    },
    switch: {
      name: 'Switch',
      description: 'Turns the power on and off.',
      working: 'On',
    },
    button: {
      name: 'Push button',
      description: 'Lets power through only while you hold it down.',
      working: 'Held down',
    },
    dimmer: {
      name: 'Dimmer',
      description: 'Turn it to make things brighter or dimmer.',
      working: 'Working',
    },
    resistor: {
      name: 'Resistor',
      description: 'Slows the power down to keep small parts safe.',
      working: 'Working',
    },
    lamp: {
      name: 'Lamp',
      description: 'Makes light. Too much power burns it out!',
      working: 'Shining',
    },
    led: {
      name: 'LED',
      description: 'A small light that works one way only: + goes to +.',
      working: 'Shining',
    },
    motor: {
      name: 'Motor',
      description: 'Spins around. Swap its wires to spin it the other way.',
      working: 'Spinning',
    },
    buzzer: {
      name: 'Buzzer',
      description: 'Makes a beep. More power makes a louder beep.',
      working: 'Beeping',
    },
  },
  categories: { power: 'Power', control: 'Controls', output: 'Light, sound and motion' },
  colors: {
    warm: 'Warm',
    yellow: 'Yellow',
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    white: 'White',
    black: 'Black',
    auto: 'Auto',
  },
  status: {
    idle: 'Off',
    weak: 'Weak',
    on: 'On',
    over: 'Too much!',
    reverse: 'Wrong way',
    burnt: 'Burnt out',
    short: 'Short circuit',
  },
  tips: {
    lampWeak: 'The light is weak. Try a bigger battery, or put the lamps side by side.',
    lampOver: 'Very bright and very hot. It may burn out!',
    burnt: 'It burnt out because the power was too strong. Use a smaller battery, then fix it.',
    ledReverse: 'The LED is the wrong way round. Join its + to the battery +.',
    ledOver: 'Too much power for the LED. Add a resistor next to it.',
    ledOff: 'The LED needs a bit more power to light up. Try a bigger battery.',
    motorWeak: 'Not enough power to spin. Try a bigger battery.',
    motorOver: 'The motor is spinning very fast and getting hot!',
    motorReverse: 'It spins the other way because + and − are swapped.',
    short: 'Short circuit! The two battery ends are joined by a bare wire. The battery is getting hot.',
    resistorHot: 'The resistor is getting hot! Pick a bigger number.',
    batteryIdle: 'Power only flows in a full loop: from + all the way back to −.',
  },
  sidebar: {
    title: 'Parts',
    hint: 'Drag a part onto the board',
    search: 'Find a part',
    noResults: 'No parts match',
    tapToAdd: 'Tap a part to add it',
  },
  toolbar: {
    examples: 'Examples',
    undo: 'Undo',
    redo: 'Redo',
    running: 'Running',
    paused: 'Paused',
    clear: 'Clear board',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    language: 'Language',
    theme: 'Dark mode',
    help: 'Help',
    more: 'More',
  },
  confirm: {
    clearTitle: 'Clear the board?',
    clearBody: 'This takes away every part and wire. You can get them back with Undo.',
    loadTitle: 'Open this example?',
    loadBody: 'It will replace what is on your board. You can get your board back with Undo.',
    cancel: 'Keep my board',
    clear: 'Clear',
    load: 'Open it',
  },
  presets: {
    flashlight: { name: 'Flashlight', description: 'A battery, a switch and a lamp' },
    fan: { name: 'Fan', description: 'A motor and a switch. Watch it spin!' },
    doorbell: { name: 'Doorbell', description: 'Hold the button to make a beep' },
    led: { name: 'LED light', description: 'An LED kept safe by a resistor' },
    series: { name: 'Two lamps in a row', description: 'Both lamps get dimmer' },
    parallel: { name: 'Two lamps side by side', description: 'Both lamps stay bright' },
    dimmer: { name: 'Night light', description: 'Turn the dimmer to change the light' },
    short: { name: 'Short circuit (oops!)', description: 'See what a bare wire does' },
  },
  inspector: {
    tab: 'Details',
    missionsTab: 'Missions',
    empty: 'Nothing picked yet',
    emptyHint: 'Tap a part or a wire to see more about it.',
    voltage: 'Voltage',
    current: 'Current',
    power: 'Power',
    speed: 'Speed',
    brightness: 'Brightness',
    batteryVoltage: 'Battery size',
    color: 'Color',
    resistance: 'Resistance',
    switchState: 'Switch',
    on: 'On',
    off: 'Off',
    knob: 'Knob',
    rotate: 'Turn',
    duplicate: 'Copy',
    delete: 'Delete',
    repair: 'Fix it',
    wire: 'Wire',
    wireColor: 'Wire color',
    wireCurrent: 'Current in this wire',
    deleteWire: 'Delete wire',
    readings: 'Meter',
    settings: 'Change it',
    whatItDoes: 'What does it do?',
    plusEnd: 'Red dot: the + end',
    minusEnd: 'Black dot: the − end',
  },
  node: { on: 'On', off: 'Off', press: 'Hold me', replace: 'Fix it' },
  statusBar: {
    complete: 'It works! Power is flowing',
    open: 'The loop is not closed yet',
    short: 'Short circuit!',
    noBattery: 'Add a battery',
    empty: 'The board is empty',
    paused: 'Paused',
    count: (parts, wires) =>
      `${parts} ${parts === 1 ? 'part' : 'parts'} · ${wires} ${wires === 1 ? 'wire' : 'wires'}`,
    batteryCurrent: 'Current',
  },
  toasts: {
    lampBurnt: 'The lamp burnt out! The power was too strong.',
    ledBurnt: 'The LED burnt out! It needs a resistor.',
    short: 'Short circuit! Take away the bare wire.',
    mission: 'Mission done!',
    copied: 'Copied',
  },
  missions: {
    title: 'Missions',
    progress: (done, total) => `${done} of ${total} done`,
    reset: 'Start again',
    allDone: 'You did every mission. Great job, engineer!',
    items: {
      light: 'Light up a lamp',
      flashlight: 'Make a flashlight with a switch and turn it on',
      motor: 'Make the motor spin',
      reverse: 'Spin the motor both ways',
      led: 'Light an LED without burning it',
      doorbell: 'Make the buzzer beep with a push button',
      parallel: 'Light two lamps brightly at the same time',
      dimmer: 'Change a lamp’s light with the dimmer',
    },
  },
  empty: {
    title: 'Your board is ready!',
    body: 'Add some parts, then join their dots with wires to make the power flow.',
    cta: 'Show me a flashlight',
  },
  help: {
    title: 'How to play',
    intro: 'Power flows only in a full loop: out of the battery +, through your parts, and back to −.',
    steps: [
      'Drag a part onto the board, or just tap it.',
      'Drag from a dot on one part to a dot on another part. That makes a wire.',
      'Tap a switch to turn it on. Hold a push button down.',
      'Tap a part to see its numbers.',
      'Finish the missions and become an engineer!',
    ],
    shortcuts: 'Keyboard shortcuts',
    keys: [
      ['Delete', 'Delete'],
      ['R', 'Turn the part'],
      ['Ctrl + D', 'Copy the part'],
      ['Ctrl + Z', 'Undo'],
      ['Ctrl + Shift + Z', 'Redo'],
      ['Space', 'Flip the switch'],
    ],
  },
  drag: { drop: 'Drop it here' },
  wirePalette: 'Wire color',
  controls: { zoomIn: 'Zoom in', zoomOut: 'Zoom out', fit: 'See everything' },
  units: { volt: 'V', amp: 'A', milliamp: 'mA', watt: 'W', ohm: 'Ω' },
}
