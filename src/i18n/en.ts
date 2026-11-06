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
  }
  node: { on: string; off: string; press: string; replace: string }
  statusBar: {
    complete: string
    open: string
    short: string
    noBattery: string
    empty: string
    paused: string
    parts: string
    wires: string
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

/** English: the default language. */
export const en: Dictionary = {
  app: { title: 'Circuit Lab', subtitle: 'Build it, power it up!' },
  parts: {
    battery: {
      name: 'Battery',
      description: 'The energy source of your circuit. It has a positive (+) and a negative (−) end.',
      working: 'Powering',
    },
    switch: {
      name: 'Switch',
      description: 'Works like a bridge: when it is on, electricity can cross; when it is off, it cannot.',
      working: 'Closed',
    },
    button: {
      name: 'Push button',
      description: 'Connects the circuit only while you hold it down, like a doorbell.',
      working: 'Pressed',
    },
    dimmer: {
      name: 'Dimmer',
      description: 'A turning resistor. Twist it to let more or less current through.',
      working: 'Adjusting',
    },
    resistor: {
      name: 'Resistor',
      description: 'Holds back too much current and protects delicate parts.',
      working: 'Working',
    },
    lamp: {
      name: 'Lamp',
      description: 'Turns electricity into light and heat. Too much voltage burns it out!',
      working: 'Shining',
    },
    led: {
      name: 'LED',
      description: 'A tiny, efficient light that only works one way round. Connect + to +.',
      working: 'Shining',
    },
    motor: {
      name: 'Motor',
      description: 'Turns electricity into spinning. Swap its wires and it spins the other way!',
      working: 'Spinning',
    },
    buzzer: {
      name: 'Buzzer',
      description: 'Turns electricity into sound. More current means a louder beep.',
      working: 'Beeping',
    },
  },
  categories: { power: 'Power', control: 'Controls', output: 'Outputs' },
  colors: {
    warm: 'Sunny',
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
    reverse: 'Backwards',
    burnt: 'Burnt',
    short: 'Short circuit',
  },
  tips: {
    lampWeak: 'The light is dim. Use a stronger battery or wire the lamps in parallel.',
    lampOver: 'Very bright and getting hot. It might burn out!',
    burnt: 'Burnt out! The voltage was too high. Lower it first, then replace the part.',
    ledReverse: 'The LED is backwards. Connect its + leg to the + of the battery.',
    ledOver: 'Too much current for the LED. Add a resistor in series.',
    ledOff: 'An LED needs at least about 2 volts to light up.',
    motorWeak: 'The motor is too weak to spin. Give it more voltage.',
    motorOver: 'The motor is spinning very fast and getting hot!',
    motorReverse: 'The motor spins backwards because + and − are swapped.',
    short: 'Short circuit! The battery ends are joined with nothing in between. The battery is heating up.',
    resistorHot: 'The resistor is getting hot! Pick a bigger value.',
    batteryIdle: 'Electricity flows only through a closed loop from + back to −.',
  },
  sidebar: {
    title: 'Parts box',
    hint: 'Drag a part onto the board',
    search: 'Search parts…',
    noResults: 'No parts found',
    tapToAdd: 'or just tap it',
  },
  toolbar: {
    examples: 'Examples',
    undo: 'Undo',
    redo: 'Redo',
    running: 'Simulation on',
    paused: 'Simulation paused',
    clear: 'Clear board',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    language: 'Language',
    theme: 'Toggle theme',
    help: 'Help',
  },
  confirm: {
    clearTitle: 'Clear the board?',
    clearBody: 'All parts and wires will be removed. You can bring them back with Undo.',
    loadTitle: 'Replace your circuit with this example?',
    loadBody: 'The circuit on the board will be swapped for this example. Undo brings it back.',
    cancel: 'No, keep it',
    clear: 'Clear',
    load: 'Load it',
  },
  presets: {
    flashlight: { name: 'Flashlight', description: 'Battery + switch + lamp: the simplest circuit in the world' },
    fan: { name: 'Fan', description: 'A motor and a switch: watch the blades spin' },
    doorbell: { name: 'Doorbell', description: 'Hold the button to make the buzzer beep' },
    led: { name: 'LED light', description: 'An LED with a protecting resistor' },
    series: { name: 'Lamps in series', description: 'Two lamps in a row: both get dimmer' },
    parallel: { name: 'Lamps in parallel', description: 'Two lamps side by side: both stay bright' },
    dimmer: { name: 'Night light', description: 'Set the brightness with the dimmer' },
    short: { name: 'Short circuit (oops!)', description: 'See what happens with a direct wire' },
  },
  inspector: {
    tab: 'Inspector',
    missionsTab: 'Missions',
    empty: 'Nothing selected',
    emptyHint: 'Tap a part or a wire to see its details.',
    voltage: 'Voltage',
    current: 'Current',
    power: 'Power',
    speed: 'Speed',
    brightness: 'Brightness',
    batteryVoltage: 'Battery voltage',
    color: 'Colour',
    resistance: 'Resistance',
    switchState: 'Switch',
    on: 'On',
    off: 'Off',
    knob: 'Dimmer knob',
    rotate: 'Rotate',
    duplicate: 'Duplicate',
    delete: 'Delete',
    repair: 'Replace burnt part',
    wire: 'Wire',
    wireColor: 'Wire colour',
    wireCurrent: 'Wire current',
    deleteWire: 'Delete wire',
    readings: 'Readings',
    settings: 'Settings',
    whatItDoes: 'What does it do?',
  },
  node: { on: 'On', off: 'Off', press: 'Press', replace: 'Replace' },
  statusBar: {
    complete: 'Circuit complete, current is flowing',
    open: 'The circuit is open',
    short: 'Short circuit!',
    noBattery: 'No battery yet',
    empty: 'The board is empty',
    paused: 'Simulation paused',
    parts: 'parts',
    wires: 'wires',
    batteryCurrent: 'Battery current',
  },
  toasts: {
    lampBurnt: 'The lamp burnt out! The voltage was too high.',
    ledBurnt: 'The LED burnt out! It needed a resistor.',
    short: 'Short circuit! The battery is getting hot. Remove the direct wire.',
    mission: 'Mission complete!',
    copied: 'Copied',
  },
  missions: {
    title: 'Missions',
    progress: (done, total) => `${done} of ${total} done`,
    reset: 'Start over',
    allDone: 'Amazing! You finished every mission, little engineer!',
    items: {
      light: 'Light up a lamp',
      flashlight: 'Build a flashlight with a switch and turn it on',
      motor: 'Make the motor spin',
      reverse: 'Spin the motor both ways',
      led: 'Light an LED safely without damaging it',
      doorbell: 'Ring the buzzer with a push button',
      parallel: 'Light two lamps brightly at the same time',
      dimmer: 'Control a lamp with the dimmer',
    },
  },
  empty: {
    title: 'Your workbench is ready!',
    body: 'Drag parts from the parts box and drop them here. Then connect the coloured dots with wires.',
    cta: 'Build me a flashlight',
  },
  help: {
    title: 'How do I play?',
    intro: 'Electricity only flows when there is a closed path from the + of the battery back to its −.',
    steps: [
      'Drag a part from the parts box onto the board (or just tap it).',
      'Start at a coloured dot next to a part and drag to a dot on another part to connect a wire.',
      'Tap a switch to turn it on or off. Hold a push button down.',
      'Tap a part to see its voltage and current in the side panel.',
      'Complete the missions one by one and become an electrical engineer!',
    ],
    shortcuts: 'Shortcuts',
    keys: [
      ['Delete', 'Delete selection'],
      ['R', 'Rotate part'],
      ['Ctrl + D', 'Duplicate part'],
      ['Ctrl + Z', 'Undo'],
      ['Ctrl + Shift + Z', 'Redo'],
      ['Space', 'Toggle selected switch'],
    ],
  },
  drag: { drop: 'Drop it here' },
  wirePalette: 'New wire colour',
  controls: { zoomIn: 'Zoom in', zoomOut: 'Zoom out', fit: 'Show everything' },
  units: { volt: 'V', amp: 'A', milliamp: 'mA', watt: 'W', ohm: 'Ω' },
}
