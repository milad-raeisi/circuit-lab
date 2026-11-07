# Circuit Lab

A circuit simulator for kids. Drag parts from the parts box onto the board, wire their terminals together and watch the circuit come alive: lamps glow, LEDs light up, motors spin and buzzers beep, all animated in 3D with Three.js.

The interface is available in **English** (default), **Arabic** and **Persian**, with full right-to-left layout for Arabic and Persian.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # solver unit tests (Vitest)
npm run build    # type-check + production build
```

Requires Node.js 22.12 or later (the Animate UI CLI needs it).

## What kids can do

- **Power:** battery (1.5 / 3 / 4.5 / 9 V), a solar panel with a sunlight slider, and a bench power supply (0–12 V with a current limit).
- **Boards:** Arduino Uno, Nano and Mega, ESP32, ESP8266 NodeMCU, Raspberry Pi Pico, micro:bit and Raspberry Pi, each at its own voltage. Every output pin can be off, on, blinking, taking turns, fading (on PWM pins), stepping through a 3-second loop, or following the sensor on the board's input (also upside down, or as an alarm). The details panel shows the real code for the chosen programs: Arduino C++, MicroPython, micro:bit Python or gpiozero.
- **Switches and knobs:** switch, push button, dimmer, potentiometer (a real voltage divider) and a relay.
- **Electronic parts:** resistor (with a colour-code lesson), capacitor (charges and discharges over time), diode, NPN transistor (B, C, E), fuse (blows to protect the rest) and a 7805 regulator.
- **Chips and logic:** NOT, AND, OR and XOR gates (with a live truth table) and a 555 blinker.
- **Light, sound and motion:** lamp, LED, RGB LED, motor, vibration motor, buzzer, speaker, electromagnet and a servo motor whose arm follows its signal.
- **Sensors:** light sensor (LDR), thermistor, tilt switch, magnet (reed) switch, and + / − / S modules for temperature, distance (ultrasonic), motion (PIR), sound, smoke/gas, soil moisture and touch. Each has a slider, hold button or toggle on its card.
- **Screens:** seven-segment digits, a text LCD, OLED and colour TFT screens, an LED matrix and LED walls of any size for scrolling shop signs and a city TV that plays your own photos and videos (stored in the browser).
- **Meters:** voltmeter and ammeter with a needle and an LCD readout, and an oscilloscope that draws the voltage over time.
- **Wiring:** drag from a coloured terminal dot to another part. Red is `+`, black is `−`. Wires show moving dots whose speed and direction follow the real current.
- **Things that go wrong, safely:** 9 V burns out a lamp, an LED without a resistor burns out, a direct wire across the battery causes a short circuit (the battery heats up and the board warns), a reversed LED stays dark, a transistor without a base resistor burns, and a fuse blows before the lamp it protects.
- **Examples gallery:** 44 working projects on five shelves (first circuits, electronics, boards and code, smart gadgets, screens and signs), from a flashlight to a traffic light, a parking sensor, a radar, a smart home and a city TV.
- **Lessons:** every part explains what it does in kid-friendly words, plus a "volts, amps and ohms" lesson that uses the live numbers from the board.
- **Toolbox:** 27 real workshop tools (multimeter, soldering iron, wire stripper, safety glasses …), each with a drawing, how to use it, how to stay safe and a fun fact.
- **Missions:** fifteen challenges, from "build a flashlight" to "blink an LED with the Arduino" and "let a sensor switch on a light", with confetti when one is completed.
- **Comfort:** undo/redo, the board saved in the browser, dark mode (a "dark room" where lights really shine), sound effects, keyboard shortcuts, and touch support (tap a part to add it).

## Tech stack

| Concern | Library |
| --- | --- |
| App | React 19, Vite 8, TypeScript 7 |
| Styling | Tailwind CSS v4, shadcn/ui (Radix base, Nova preset) |
| Animation | [Animate UI](https://animate-ui.com/docs) (`@animate-ui/react` + `motion`) |
| Node editor | React Flow (`@xyflow/react`) |
| 3D | three.js, `@react-three/fiber`, `@react-three/drei` |
| State | Zustand (persisted to `localStorage`) |

## Animate UI

The project is set up the way the [Animate UI installation guide](https://animate-ui.com/docs/installation) describes, so any Animate UI component can be added:

- `@animate-ui/react` and `motion` are installed, and the app is wrapped in `AnimateUIProvider` (`src/main.tsx`).
- The shadcn/ui components in `src/components/ui` were animated with `npx @animate-ui/cli@latest animate all`, so they import their primitives from `@animate-ui/react/primitives/radix-ui`.
- Registry components and animated icons live in `src/components/animate-ui`.
- Primitives (texts, effects, buttons) are imported straight from the package, for example `@animate-ui/react/primitives/texts/sliding-number`.

To add more:

```bash
npx shadcn@latest add <component>                  # a shadcn/ui component…
npx @animate-ui/cli@latest animate <component>      # …then animate it
npx shadcn@latest add @animate-ui/buttons-liquid    # an Animate UI registry component
npx shadcn@latest add @animate-ui/icons-lucide-bell # an animated icon
```

`noUnusedLocals` is off in `tsconfig.app.json` because registry files ship with unused `React` imports. oxlint still reports unused variables in app code (`npm run lint`).

## How the simulation works

`src/circuit/solver.ts` is a small DC solver based on nodal analysis:

- Every terminal is a circuit node.
- Wires are tiny resistors, so each wire also gets its own current for the flow animation.
- Batteries are Norton equivalents with an internal resistance.
- LEDs are piecewise-linear diodes; the solver repeats until every LED's on/off state is consistent.

The solver is pure and unit-tested (`solver.test.ts`). The electrical constants in `src/circuit/catalog.ts` are tuned so toy circuits behave the way kids expect: 1.5 V dim, 3 V bright, 9 V burns the lamp.

The solver only re-runs when the electrical makeup of the board changes (`src/hooks/useSimulationEngine.ts`); dragging parts around doesn't trigger it.

## 3D rendering

All parts share **one** WebGL canvas (`src/three/SceneCanvas.tsx`). Each part node registers a drei `<View>` that tracks its DOM box, so a board with dozens of parts still uses a single WebGL context. The canvas covers the window but ignores the pointer, so React Flow keeps handling every click and drag. Models live in `src/three/models/` and read their animation state from the simulation result each frame.

## Project layout

```
src/
  circuit/      solver, parts catalog, examples, missions (no React)
  editor/       board, part nodes, wires, sidebar, inspector, lessons, gallery, top/status bars
  displays/     screen faces (digits, LCD, OLED, TFT, LED walls, oscilloscope)
  toolbox/      the workshop tools section
  three/        shared canvas, lighting helpers and the 3D part models
  store/        Zustand stores: circuit (with undo/redo), settings, simulation, drag
  i18n/         en (default), ar, fa dictionaries and the useI18n hook
  hooks/        simulation engine, keyboard shortcuts
  lib/          Web Audio sound effects, utilities
  components/   generated shadcn/ui and Animate UI components
```

## Adding things

- **A language:** copy `src/i18n/en.ts` (the `Dictionary` type makes TypeScript list every missing string), then register it in `LANGUAGES` and `DICTIONARIES` in `src/i18n/index.ts`.
- **A part:** add it to `PartType` (`src/circuit/types.ts`), `PARTS` and `PART_ORDER` (`catalog.ts`), the solver, a model in `src/three/models/` and its framing in `PartScene.tsx`, a tray drawing in `src/editor/PartArt.tsx`, a lesson in `src/i18n/learn/*` and the three dictionaries.
