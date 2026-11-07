import type { GateType, PartCategory, SensedPart } from '@/circuit/catalog'
import type { MissionId } from '@/circuit/missions'
import type { PresetCategory, PresetId, PresetLevel, PresetTexts } from '@/circuit/presets'
import type { PartStatus } from '@/circuit/solver'
import type {
  DemoId,
  DisplayMode,
  DisplayTint,
  LampColor,
  LedColor,
  PartType,
  PinMode,
  SignEffect,
  WireColor,
} from '@/circuit/types'

type PartText = { name: string; description: string; working: string }

export type Dictionary = {
  app: { title: string; subtitle: string }
  parts: Record<PartType, PartText>
  /** the label of each sensor's control: what you change in the world around it */
  sense: Record<SensedPart, string>
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
    fuseBlown: string
    fuseNear: string
    capacitorReverse: string
    diodeReverse: string
    transistorBase: string
    arduinoPin: string
    solarDark: string
    meterReverse: string
    servoPower: string
    sensorPower: string
    followHint: string
    displayPower: string
    displayWeak: string
    displayReverse: string
    displaySignal: string
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
    toolbox: string
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
  presets: Record<PresetId, { name: string; description: string }>
  /** the examples gallery */
  gallery: {
    title: string
    description: (count: number) => string
    all: string
    /** what the list of shelves is called, for screen readers */
    shelves: string
    categories: Record<PresetCategory, { name: string; short: string; blurb: string }>
    levels: Record<PresetLevel, string>
    /** words some examples show on their screens */
    screens: Omit<PresetTexts, 'citySign'>
  }
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
    capacitance: string
    rating: string
    light: string
    charge: string
    program: string
    programHint: string
    code: string
    pinModes: Record<PinMode, string>
    a0: string
    angle: string
    signal: string
  }
  node: { on: string; off: string; press: string; replace: string }
  /** screens: the 7-segment display, LCD, OLED, colour screen, LED sign and city TV */
  display: {
    modes: Record<DisplayMode, string>
    effects: Record<SignEffect, string>
    demos: Record<DemoId, string>
    tints: Record<DisplayTint, string>
    show: string
    digits: string
    size: string
    across: string
    down: string
    backlight: string
    text: string
    number: string
    line: (n: number) => string
    effect: string
    picture: string
    upload: string
    replace: string
    remove: string
    mediaHint: string
    tooBig: string
    badFile: string
    play: string
    pause: string
    next: string
    leds: (w: number, h: number) => string
    signal: string
    noPower: string
    /** what a fresh screen shows until you type your own words */
    samples: {
      lcd: string
      oled: string
      tft: string
      matrix: string
      citySign: string
      newsTitle: string
      news: string
      ad: string
    }
  }
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
    fuseBlown: string
    partBurnt: string
  }
  missions: {
    title: string
    progress: (done: number, total: number) => string
    reset: string
    allDone: string
    items: Record<MissionId, string>
  }
  empty: { title: string; body: string; cta: string }
  help: { title: string; intro: string; steps: string[]; shortcuts: string; keys: [string, string][] }
  drag: { drop: string }
  wirePalette: string
  controls: { zoomIn: string; zoomOut: string; fit: string }
  /** the power supply, potentiometer, relay, RGB LED, speaker, chips and oscilloscope */
  workshop: {
    tips: {
      supplyLimit: string
      potHint: string
      potHot: string
      relayWeak: string
      relayHint: string
      rgbHint: string
      speakerOver: string
      magnetHot: string
      regulatorLow: string
      regulatorHot: string
      regulatorHint: string
      chipPower: string
      chipWeak: string
      chipReverse: string
      timerWeak: string
      scopeHint: string
    }
    voltage: string
    limit: string
    limitHint: string
    knobSize: string
    wiper: string
    note: string
    /** low, middle and high */
    notes: [string, string, string]
    speed: string
    /** slow, medium and fast */
    speeds: [string, string, string]
    perSecond: (n: number) => string
    span: string
    seconds: (n: number) => string
    strength: string
    shake: string
    loudness: string
    open: string
    closed: string
    coil: string
    contactCurrent: string
    regulatorIn: string
    regulatorOut: string
    truthTable: string
    truthHint: string
    gateRules: Record<GateType, string>
    scopeReading: string
  }
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
    solar: {
      name: 'Solar panel',
      description: 'Turns sunlight into power. More sun gives more power.',
      working: 'Making power',
    },
    arduino: {
      name: 'Arduino Uno',
      description: 'A tiny computer. Tell each pin to turn on, blink or fade.',
      working: 'Running code',
    },
    nano: {
      name: 'Arduino Nano',
      description: 'A tiny Arduino with the same pins as the Uno. Great for small projects.',
      working: 'Running code',
    },
    mega: {
      name: 'Arduino Mega',
      description: 'A big Arduino with lots of pins for large projects.',
      working: 'Running code',
    },
    esp32: {
      name: 'ESP32',
      description: 'A fast board with Wi-Fi and Bluetooth. Its pins use 3.3 volts.',
      working: 'Running code',
    },
    esp8266: {
      name: 'ESP8266 NodeMCU',
      description: 'A small Wi-Fi board. Its pins use 3.3 volts.',
      working: 'Running code',
    },
    pico: {
      name: 'Raspberry Pi Pico',
      description: 'A small board you program in MicroPython. Its pins use 3.3 volts.',
      working: 'Running code',
    },
    microbit: {
      name: 'micro:bit',
      description: 'A pocket-size school board with lights and buttons. Its pins use 3.3 volts.',
      working: 'Running code',
    },
    raspberrypi: {
      name: 'Raspberry Pi',
      description: 'A real little computer you program in Python. Its pins use 3.3 volts.',
      working: 'Running code',
    },
    capacitor: {
      name: 'Capacitor',
      description: 'Stores power for a short time, then gives it back.',
      working: 'Working',
    },
    diode: {
      name: 'Diode',
      description: 'Lets power go one way only, like a one-way door.',
      working: 'Letting power through',
    },
    transistor: {
      name: 'Transistor',
      description: 'A tiny switch: a small current into B turns on a big current from C to E.',
      working: 'Switched on',
    },
    fuse: {
      name: 'Fuse',
      description: 'Breaks on purpose when too much power flows, to keep the rest safe.',
      working: 'Working',
    },
    ldr: {
      name: 'Light sensor',
      description: 'Lets more power through when more light shines on it.',
      working: 'Sensing light',
    },
    voltmeter: {
      name: 'Voltmeter',
      description: 'Shows the voltage between its two ends. Put it next to a part.',
      working: 'Measuring',
    },
    ammeter: {
      name: 'Ammeter',
      description: 'Shows how much current flows through it. Put it inside the loop.',
      working: 'Measuring',
    },
    servo: {
      name: 'Servo motor',
      description: 'Turns to the angle you ask for and stays there. Give it power, then a signal on S.',
      working: 'Turning',
    },
    thermistor: {
      name: 'Thermistor',
      description: 'A heat sensor. It lets more power through when it gets hot.',
      working: 'Sensing heat',
    },
    tilt: {
      name: 'Tilt switch',
      description: 'Turns on when you tip it over.',
      working: 'Tilted',
    },
    reed: {
      name: 'Magnet switch',
      description: 'Turns on when a magnet comes near.',
      working: 'Magnet near',
    },
    tempSensor: {
      name: 'Temperature sensor',
      description: 'Tells how hot it is. The hotter it gets, the bigger its signal on S.',
      working: 'Sensing',
    },
    ultrasonic: {
      name: 'Distance sensor',
      description: 'Uses sound too high to hear to find how far things are. Closer gives a bigger signal.',
      working: 'Sensing',
    },
    pir: {
      name: 'Motion sensor',
      description: 'Sees people move nearby and sends a signal on S.',
      working: 'Watching',
    },
    soundSensor: {
      name: 'Sound sensor',
      description: 'Hears noise. Louder noise gives a bigger signal.',
      working: 'Listening',
    },
    gasSensor: {
      name: 'Smoke sensor',
      description: 'Smells smoke and gas in the air. More smoke gives a bigger signal.',
      working: 'Sniffing',
    },
    soilSensor: {
      name: 'Soil sensor',
      description: 'Tells if a plant’s soil is wet or dry. Wetter soil gives a bigger signal.',
      working: 'Sensing',
    },
    touchSensor: {
      name: 'Touch sensor',
      description: 'Sends a signal while you touch it.',
      working: 'Ready',
    },
    segment: {
      name: '7-segment display',
      description: 'Shows numbers with little light bars. It can count, show the time or show the volts on S.',
      working: 'Showing',
    },
    lcd: {
      name: 'LCD screen',
      description: 'Shows two or four lines of words. Type what it should say.',
      working: 'Showing',
    },
    oled: {
      name: 'OLED screen',
      description: 'A tiny, sharp screen. It shows words, the time, a picture or the volts on S.',
      working: 'Showing',
    },
    tft: {
      name: 'Color screen',
      description: 'A small screen in full color. It plays your photos, your videos and fun shows.',
      working: 'Playing',
    },
    matrix: {
      name: 'LED sign',
      description: 'A sign made of many little lights, like in shop windows. Words can slide across it.',
      working: 'Showing',
    },
    ledwall: {
      name: 'City TV',
      description: 'A giant screen made of LED panels, like on big buildings. Make it any size and play any photo or video.',
      working: 'Playing',
    },
    powerSupply: {
      name: 'Power supply',
      description: 'A power box you plug in. Turn it to any voltage from 0 to 12 V. Its current limit keeps your parts safe.',
      working: 'Giving power',
    },
    potentiometer: {
      name: 'Potentiometer',
      description: 'A knob with three legs. Join A to + and B to −. Then W gives any voltage in between.',
      // short, so the long name still fits on the card next to it
      working: 'On',
    },
    relay: {
      name: 'Relay',
      description: 'A switch worked by a magnet. A small current in the coil closes a big switch from COM to NO. Click!',
      working: 'Switch closed',
    },
    rgbLed: {
      name: 'RGB LED',
      description: 'Three little lights in one: red, green and blue. Mix them to make any color!',
      working: 'Shining',
    },
    speaker: {
      name: 'Speaker',
      description: 'Plays a music note. More power makes it louder. Pick the note on its card.',
      working: 'Playing',
    },
    vibration: {
      name: 'Vibration motor',
      description: 'A tiny coin motor that shakes, like the buzz in a phone.',
      working: 'Shaking',
    },
    electromagnet: {
      name: 'Electromagnet',
      description: 'A coil of wire around iron. When current flows, it becomes a magnet!',
      working: 'Magnet on',
    },
    regulator: {
      name: 'Voltage regulator',
      description: 'A chip that turns 7 to 12 V into a steady 5 V. Its pins are IN, GND and OUT.',
      working: 'Giving 5 V',
    },
    notGate: {
      name: 'NOT gate',
      description: 'Flips its input: when A is off, Y is on. When A is on, Y is off.',
      working: 'Y is on',
    },
    andGate: {
      name: 'AND gate',
      description: 'Y turns on only when A and B are both on.',
      working: 'Y is on',
    },
    orGate: {
      name: 'OR gate',
      description: 'Y turns on when A or B is on, or both.',
      working: 'Y is on',
    },
    xorGate: {
      name: 'XOR gate',
      description: 'Y turns on when just one of A and B is on, not both.',
      working: 'Y is on',
    },
    timer555: {
      name: '555 blinker',
      description: 'A famous chip that blinks its OUT pin all by itself. Pick how fast.',
      working: 'Blinking',
    },
    oscilloscope: {
      name: 'Oscilloscope',
      description: 'Draws the voltage as it changes over time. Watch blinks, fades and charging!',
      working: 'Watching',
    },
  },
  sense: {
    thermistor: 'Heat',
    tilt: 'Tip it over',
    reed: 'Bring the magnet',
    tempSensor: 'Heat',
    ultrasonic: 'Distance',
    pir: 'Wave',
    soundSensor: 'Noise',
    gasSensor: 'Smoke',
    soilSensor: 'Water',
    touchSensor: 'Touch',
  },
  categories: {
    power: 'Power',
    board: 'Boards',
    control: 'Switches and knobs',
    component: 'Electronic parts',
    logic: 'Chips and logic',
    output: 'Light, sound and motion',
    sensor: 'Sensors',
    meter: 'Meters',
    display: 'Displays',
  },
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
    fuseBlown: 'The fuse broke to keep the other parts safe. Find what took too much power, then fix the fuse.',
    fuseNear: 'Almost too much current for this fuse!',
    capacitorReverse: 'The capacitor is the wrong way round. Join its + to the + side.',
    diodeReverse: 'The diode is blocking the power. Turn it around to let power through.',
    transistorBase: 'Nothing goes into B, so the transistor stays off. Send a small current into B through a resistor.',
    arduinoPin: 'Too much current for an Arduino pin! Add a resistor.',
    solarDark: 'Not enough sunlight. Slide the sun up.',
    meterReverse: 'The meter is connected the wrong way. Swap its two wires.',
    servoPower: 'The servo needs about 5 volts. Join its + to 5V and its − to GND.',
    sensorPower: 'This sensor needs power. Join its + to 5V and its − to GND.',
    followHint: 'Set a pin to “Follow sensor”, then join the sensor’s S to the board’s input pin (like A0).',
    displayPower: 'This screen needs power. Join its + to + and its − to −.',
    displayWeak: 'Not enough power for this screen. Try a bigger battery.',
    displayReverse: 'The screen is joined the wrong way. Swap its + and − wires.',
    displaySignal: 'Join S to the wire you want to measure.',
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
    toolbox: 'Toolbox',
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
    arduino: { name: 'Arduino blink', description: 'Pin 13 blinks a red LED, pin 9 fades a blue one' },
    transistor: { name: 'Transistor switch', description: 'A small button current turns on a big lamp' },
    capacitor: { name: 'Capacitor light', description: 'Turn the switch off and watch the LED fade slowly' },
    solar: { name: 'Solar fan', description: 'Sunlight spins the motor' },
    meters: { name: 'Measure it', description: 'Read the current and the voltage of a lamp' },
    servo: { name: 'Servo sweep', description: 'Pin 9 swings the servo arm back and forth' },
    motion: { name: 'Motion light', description: 'Wave at the motion sensor to light the LED' },
    cityTv: { name: 'City TV', description: 'A giant LED screen and a moving sign' },
    goldSign: { name: 'Shop sign', description: 'A gold shop sign with sparkling words' },
    counter: { name: 'Digital clock', description: 'A 4-digit clock with blinking dots' },
    rainbow: { name: 'Rainbow lights', description: 'Four colored LEDs light up together' },
    toyCar: { name: 'Toy car', description: 'One switch spins both wheels' },
    batteryTester: { name: 'Battery tester', description: 'See how strong a battery is' },
    streetLamp: { name: 'Street lamp', description: 'It turns on by itself when it gets dark' },
    fuseGuard: { name: 'Fuse guard', description: 'Flip the switch and the fuse keeps you safe' },
    solarGarden: { name: 'Solar garden light', description: 'The sun fills it up, it glows after sunset' },
    noiseLight: { name: 'Noise light', description: 'The louder it is, the brighter the lamp' },
    trafficLight: { name: 'Traffic light', description: 'Red, green, yellow, again and again' },
    policeLights: { name: 'Police lights', description: 'Red and blue flash with a siren' },
    partyLights: { name: 'Party lights', description: 'Colored lights chase and a sign sparkles' },
    holidayLights: { name: 'Holiday lights', description: 'Twinkling lights run by a Python program' },
    railroad: { name: 'Train crossing', description: 'Red lights flash and the gate comes down' },
    nightLight: { name: 'Auto night light', description: 'It lights up by itself in the dark' },
    smokeAlarm: { name: 'Smoke alarm', description: 'Beeps and flashes when it smells smoke' },
    parkingSensor: { name: 'Parking sensor', description: 'Beeps faster as you get closer' },
    plantAlarm: { name: 'Thirsty plant', description: 'Tells you when the plant needs water' },
    smartFan: { name: 'Smart fan', description: 'Spins faster when it gets hotter' },
    autoDoor: { name: 'Automatic door', description: 'Opens when someone walks by' },
    radar: { name: 'Radar', description: 'Sweeps around and beeps at close things' },
    doorAlarm: { name: 'Door alarm', description: 'Beeps when the door opens' },
    smartHome: { name: 'Smart home', description: 'A porch light, a fan and a welcome screen' },
    thermometer: { name: 'Digital thermometer', description: 'More heat makes a bigger number' },
    scoreboard: { name: 'Scoreboard', description: 'A big sign and a game clock' },
    doorbellScreen: { name: 'Smart doorbell', description: 'The screen says hello, the button rings' },
    busStop: { name: 'Bus stop board', description: 'Bus times and a clock, run by the sun' },
    pocketTv: { name: 'Pocket TV', description: 'A tiny color screen shows fireworks' },
  },
  gallery: {
    title: 'Examples',
    description: (count) => `${count} ready-made projects. Pick one to open it on your board.`,
    all: 'All',
    shelves: 'Kinds of examples',
    categories: {
      first: { name: 'First circuits', short: 'Basics', blurb: 'A battery, a few wires, and your first lights and motors.' },
      electronics: { name: 'Electronics', short: 'Electronics', blurb: 'Transistors, capacitors, diodes and fuses at work.' },
      boards: { name: 'Boards and code', short: 'Code', blurb: 'Tiny computers that blink, chase and fade lights.' },
      smart: { name: 'Smart gadgets', short: 'Smart', blurb: 'Sensors tell a board what is going on, and it does something.' },
      screens: { name: 'Screens and signs', short: 'Screens', blurb: 'Numbers, words, clocks and shows that light up.' },
    },
    levels: { 1: 'Easy', 2: 'Medium', 3: 'Hard' },
    screens: {
      party: 'Party time!',
      holiday: 'Happy holidays!',
      score: 'GOAL!\nHOME 2 : 1 AWAY',
      doorbell: 'Welcome home!\nPress the bell',
      busStop: 'Park Road stop\nBus 12      3 min\nBus 7       8 min\nBus 21     15 min',
      smartHome: 'Welcome home!\nAll is well',
    },
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
    capacitance: 'Size',
    rating: 'Breaks above',
    light: 'Light',
    charge: 'Charge',
    program: 'What each pin does',
    programHint: 'Tap a pin to change what it does.',
    code: 'The code it runs',
    pinModes: {
      off: 'Off',
      on: 'On',
      blink: 'Blink',
      blink2: 'Blink, take turns',
      step1: 'Step 1 of 3',
      step2: 'Step 2 of 3',
      step3: 'Step 3 of 3',
      fade: 'Fade',
      follow: 'Follow sensor',
      invert: 'Opposite of sensor',
      alarm: 'Sensor alarm',
    },
    a0: 'Sensor input reads',
    angle: 'Angle',
    signal: 'Signal',
  },
  node: { on: 'On', off: 'Off', press: 'Hold me', replace: 'Fix it' },
  display: {
    modes: {
      number: 'Number',
      counter: 'Count',
      clock: 'Clock',
      volts: 'Volts',
      text: 'Words',
      scroll: 'Slide',
      graph: 'Graph',
      picture: 'Picture',
      demo: 'Show',
    },
    effects: {
      scrollLeft: 'Slide left',
      scrollRight: 'Slide right',
      static: 'Stay still',
      blink: 'Blink',
      sparkle: 'Sparkle',
    },
    demos: {
      reel: 'All shows',
      cityAd: 'Big sign',
      fireworks: 'Fireworks',
      rainbow: 'Rainbow',
      news: 'News',
      clock: 'Clock',
      bars: 'Color bars',
    },
    tints: {
      red: 'Red',
      green: 'Green',
      blue: 'Blue',
      yellow: 'Yellow',
      white: 'White',
      rainbow: 'Rainbow',
      yellowBlue: 'Yellow and blue',
    },
    show: 'What it shows',
    digits: 'Digits',
    size: 'Size',
    across: 'Across',
    down: 'Down',
    backlight: 'Light color',
    text: 'Words',
    number: 'Number',
    line: (n) => `Line ${n}`,
    effect: 'How the words move',
    picture: 'Your photo or video',
    upload: 'Add a photo or video',
    replace: 'Pick another',
    remove: 'Take it away',
    mediaHint: 'It stays on this device. Videos play with no sound.',
    tooBig: 'This file is too big. Pick one under 200 MB.',
    badFile: 'This file can’t be shown. Pick a photo or a video.',
    play: 'Play',
    pause: 'Pause',
    next: 'Next show',
    leds: (w, h) => `${w} × ${h} lights`,
    signal: 'S reads',
    noPower: 'No power',
    samples: {
      lcd: 'Hello, world!\nI built this!\nCircuit Lab\nHave a nice day',
      oled: 'Hello!',
      tft: 'Hello, world!',
      matrix: 'Welcome!\nGold 18K • Best price today',
      citySign: 'Welcome to our city! • Have a nice day',
      newsTitle: 'City news',
      news: 'Big kite show in the park on Friday • Sunny and warm all week • The new library opens today',
      ad: 'Have a nice day!',
    },
  },
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
    fuseBlown: 'The fuse broke! It stopped too much power.',
    partBurnt: 'A part burnt out! Too much power.',
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
      meter: 'Measure the voltage of a part with the voltmeter',
      blink: 'Blink an LED with the Arduino',
      transistor: 'Turn something on with a transistor',
      capacitor: 'Keep a light on with only a capacitor',
      servo: 'Turn a servo with the Arduino',
      sensor: 'Let a sensor switch on a light through the Arduino',
      screen: 'Show a photo or video on a screen',
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
  workshop: {
    tips: {
      supplyLimit: 'The current limit is on (the CC light). The supply holds the current there so nothing burns. Turn the limit up, or add a resistor.',
      potHint: 'Join A to + and B to −. Then W gives a voltage in between. Turn the knob to change it.',
      potHot: 'Too much current in the knob! Don’t join W straight to + or −.',
      relayWeak: 'The coil needs about 4 V to pull the switch. A board pin is too weak for it: let a transistor switch the coil.',
      relayHint: 'Give the coil power (+ and −). Then the switch between COM and NO closes.',
      rgbHint: 'Join R, G or B to + through a resistor, and the − leg to −.',
      speakerOver: 'Very loud and getting hot! Use a smaller battery, or add a resistor.',
      magnetHot: 'The coil is getting hot! Use a smaller battery, or add a resistor.',
      regulatorLow: 'It needs at least 7 V on IN to give a steady 5 V. Try a 9 V battery.',
      regulatorHot: 'The regulator is hot: it turns the extra volts into heat. Give IN fewer volts, or take less current.',
      regulatorHint: 'Join IN to + (7 to 12 V) and GND to −. Then OUT gives 5 V.',
      chipPower: 'This chip needs power. Join its + to + and its − to −.',
      chipWeak: 'Not enough power for this chip. Try a bigger battery.',
      chipReverse: 'The chip is joined the wrong way. Swap its + and − wires.',
      timerWeak: 'The 555 needs at least 4.5 V. Try a 9 V battery or the 5V pin.',
      scopeHint: 'Join + to the spot you want to watch, and − to the battery −.',
    },
    voltage: 'Voltage',
    limit: 'Current limit',
    limitHint: 'The most current it will give. A small limit keeps LEDs safe.',
    knobSize: 'Size',
    wiper: 'W gives',
    note: 'Note',
    notes: ['Low', 'Middle', 'High'],
    speed: 'Blink speed',
    speeds: ['Slow', 'Medium', 'Fast'],
    perSecond: (n) => (n < 1 ? `1 blink every ${1 / n} seconds` : n === 1 ? '1 blink a second' : `${n} blinks a second`),
    span: 'Time across the screen',
    seconds: (n) => `${n} seconds`,
    strength: 'Magnet strength',
    shake: 'Shake',
    loudness: 'Loudness',
    open: 'Open',
    closed: 'Closed',
    coil: 'Coil',
    contactCurrent: 'Current in the switch',
    regulatorIn: 'In',
    regulatorOut: 'Out',
    truthTable: 'Truth table',
    truthHint: 'Each row is one way to set the inputs. 1 means on and 0 means off. The lit row is what is happening now.',
    gateRules: {
      notGate: 'Y is the opposite of A.',
      andGate: 'Y is on only when A and B are both on.',
      orGate: 'Y is on when A or B is on.',
      xorGate: 'Y is on when A and B are different.',
    },
    scopeReading: 'Voltage now',
  },
  units: { volt: 'V', amp: 'A', milliamp: 'mA', watt: 'W', ohm: 'Ω' },
}
