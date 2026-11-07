<p align="center">
  <a href="https://circuitlab.app"><img src="public/logo.svg" width="112" alt="Circuit Lab logo: a loop of wire with a battery, closed by a glowing light bulb"></a>
</p>

<h1 align="center">Circuit Lab</h1>

<p align="center">
  <b>Build it. Light it up!</b><br>
  <a href="https://circuitlab.app">circuitlab.app</a> · A product of SBC
</p>

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

## Publishing (circuitlab.app)

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): it installs, type-checks, builds, runs all tests and publishes `dist/` to GitHub Pages. `public/CNAME` holds the domain.

One-time setup:

- **GitHub:** Settings → Pages → Source: **GitHub Actions**, custom domain `circuitlab.app`, then **Enforce HTTPS** once the certificate is ready.
- **DNS** at the domain registrar:
  - `A` records for `circuitlab.app` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `AAAA` records → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - `CNAME` for `www` → `milad-raeisi.github.io`
- **Recommended:** verify the domain under your GitHub profile → Settings → Pages, so no one else can claim it.

`.app` domains only work over HTTPS, so the site opens once GitHub has issued its certificate (usually minutes, at most a day after DNS is set).

**Brand and app files** live in `public/`: `logo.svg` (the full logo), `favicon.svg` / `favicon.ico` (the bolder small-size drawing), `apple-touch-icon.png`, `icons/` (PWA and maskable icons), `og-image.jpg` (link previews) and `manifest.webmanifest`. The app can be installed and works offline: `src/pwa/sw.js` is written to `/sw.js` by the build, with a fresh cache for each release.

## What kids can do

- **Power:** battery (1.5 / 3 / 4.5 / 6 / 9 / 12 V), a solar panel with a sunlight slider, a bench power supply (0–12 V with a current limit), a lemon battery (1–4 lemons in a row: three just light a red LED), a CR2032 coin cell (lights an LED, stalls a motor), a hand dynamo whose volts follow the crank, and a 5 V USB power bank that holds back anything above 2 A.
- **Boards:** Arduino Uno, Nano and Mega, ESP32, ESP8266 NodeMCU, Raspberry Pi Pico, micro:bit and Raspberry Pi, each at its own voltage. Every output pin can be off, on, blinking, taking turns, fading (on PWM pins), stepping through a 3-second loop, or following the sensor on the board's input (also upside down, or as an alarm). The details panel shows the real code for the chosen programs: Arduino C++, MicroPython, micro:bit Python or gpiozero.
- **AI board:** a board you talk to. Wire lights, motors and buzzers to its pins, then type what they should do ("make the red light blink", "turn the lamp on when it gets dark"). A language model running on your own computer with [Ollama](https://ollama.com) picks a program for each pin. See [AI board with Ollama](#ai-board-with-ollama).
- **Switches and knobs:** switch, push button, a two-way stair switch (COM, A, B: two of them switch one stair light from both ends), a micro switch with a lever (COM, NO, NC), dimmer, potentiometer (a real voltage divider), a joystick with X and Y outputs, and a relay.
- **Electronic parts:** resistor (with a colour-code lesson), capacitor (charges and discharges over time), diode, a 5.1 V Zener diode that holds its volts, NPN and PNP transistors, a MOSFET whose gate volts switch a motor, an optocoupler (an LED and a light switch with no wire between them), fuse (blows to protect the rest) and a 7805 regulator.
- **Chips and logic:** NOT, AND, OR, XOR, NAND and NOR gates (with a live truth table), a memory latch that remembers (SET, RESET, Q), a 4017 counter whose five outputs chase each other, a comparator (IN+, IN−, OUT), a 555 blinker and an H-bridge motor driver that spins a motor forward or back.
- **Light, sound and motion:** lamp, LED, RGB LED, motor, vibration motor, buzzer (a beep, or a real siren: the slow police wail, the fast yelp or the two-tone nee-naw), speaker, electric bell, electromagnet, a push solenoid, a servo motor whose arm follows its signal, a red laser that puts a dot on a target, an IR LED you can only see through the "phone camera", a traffic-light module, a 10-bar LED bar graph, a cooling fan and a water pump with real moving water.
- **Sensors:** light sensor (LDR), thermistor, tilt switch, magnet (reed) switch, and + / − / S modules for temperature, distance (ultrasonic), motion (PIR), sound, smoke/gas, soil moisture, touch, flame, rain, water level, humidity, magnets (Hall), obstacles (IR), black lines, pressing (FSR), heartbeat (it beats by itself) and knocks. Each has a slider, hold button or toggle on its card.
- **Screens:** seven-segment digits, a text LCD, OLED and colour TFT screens, an LED matrix and LED walls of any size for scrolling shop signs and a city TV that plays your own photos and videos (stored in the browser).
- **Meters:** a multimeter with a dial for volts, amps, ohms (it measures a resistor with no battery at all) and a continuity beep, a logic probe with HIGH, LOW and PULSE lights, a voltmeter and an ammeter with a needle and an LCD readout, and an oscilloscope that draws the voltage over time.
- **Wiring:** drag from a coloured terminal dot to another part. Red is `+`, black is `−`. Wires show moving dots whose speed and direction follow the real current.
- **Things that go wrong, safely:** 9 V burns out a lamp, an LED without a resistor burns out, a direct wire across the battery causes a short circuit (the battery heats up and the board warns), a reversed LED stays dark, a transistor without a base resistor burns, and a fuse blows before the lamp it protects.
- **Examples gallery:** 44 working projects on five shelves (first circuits, electronics, boards and code, smart gadgets, screens and signs), from a flashlight to a traffic light, a parking sensor, a radar, a smart home and a city TV.
- **Lessons:** every part explains what it does in kid-friendly words, plus a "volts, amps and ohms" lesson that uses the live numbers from the board.
- **Toolbox:** 69 real workshop tools in eight drawers (measure, build, cut and hold, power, fix, stay safe, program and connect, keep it tidy), each with a drawing, how to use it, how to stay safe and a fun fact. A search box finds a tool by name, a "Which tool?" quiz asks 26 real workshop questions (ten per round, with the reason after every answer), a starter-kit checklist remembers the first 12 tools a child already has, and tools such as the multimeter, oscilloscope, bench supply and battery holder put their matching part on the board.
- **Missions:** fifteen challenges, from "build a flashlight" to "blink an LED with the Arduino" and "let a sensor switch on a light", with confetti when one is completed.
- **Comfort:** undo/redo, the board saved in the browser, dark mode (a "dark room" where lights really shine), sound effects, keyboard shortcuts, and touch support (tap a part to add it).

## AI board with Ollama

The AI board (in the Boards section of the parts box, and on the **Talk to AI** shelf of the examples) sends the child's words to a language model that runs on the same computer through [Ollama](https://ollama.com). No account, no cloud: the words stay on the computer.

1. Install Ollama from [ollama.com](https://ollama.com) and open it (or run `ollama serve`).
2. Download a chat model once: `ollama pull gemma3:4b` (about 3 GB, good at English, Persian and Arabic). On a stronger computer `qwen3.5:9b` answers more carefully; `llama3.2:3b` is smaller but weaker in Persian and Arabic. Models that only make embeddings are left out of the picker.
3. Open Circuit Lab, add an AI board (or open an AI example) and press **Ask** on its card. The details panel shows whether Ollama was found, a model picker, the chat, and simple setup steps when something is missing.

How it works: `src/ai/plan.ts` follows the wires from each pin (through resistors, switches and transistors) to the part it drives, reads the sensor on `IN`, and sends that, the rules and the chat so far to `POST /api/chat` with a JSON schema (`src/ai/ollama.ts`). The model may only answer with a list of pin programs the simulator already has (on, blink, fade, follow the sensor …); the app checks every one before it sets the pins, so the simulation stays the same as when a child picks the programs by hand. The details panel then shows which pins changed and the Arduino code for the new program. The Ollama address and the model are saved in the browser (`circuit-lab:ai`), with each board's chat.

The dev server (`localhost:5173`) can call Ollama directly, because Ollama allows `localhost` pages by default. A copy of Circuit Lab on a **website** has to be allowed first: quit Ollama and start it with that site's address, for example

```bash
OLLAMA_ORIGINS="https://your-site.example" ollama serve
```

(on macOS with the menu-bar app: `launchctl setenv OLLAMA_ORIGINS "https://your-site.example"`, then restart Ollama). The panel shows this command with the right address when Ollama refuses the page.

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
- The newer parts (Zener, PNP, MOSFET, optocoupler, laser, IR LED, solenoid, pump, bell, bar graph, traffic light, fan, latch, counter, comparator, motor driver, multimeter and logic probe) are small "devices" in `src/circuit/devices.ts`: each adds its own stamps, refines its own state in the same loop, and reports its result. The latch, the counter and the logic probe remember their state from one step to the next.

The solver is pure and unit-tested (`solver.test.ts`, and `outputs.test.ts` for the newer parts). The electrical constants in `src/circuit/catalog.ts` are tuned so toy circuits behave the way kids expect: 1.5 V dim, 3 V bright, 9 V burns the lamp.

The solver only re-runs when the electrical makeup of the board changes (`src/hooks/useSimulationEngine.ts`); dragging parts around doesn't trigger it.

## 3D rendering

All parts share **one** WebGL canvas (`src/three/SceneCanvas.tsx`). Each part node registers a drei `<View>` that tracks its DOM box, so a board with dozens of parts still uses a single WebGL context. The canvas covers the window but ignores the pointer, so React Flow keeps handling every click and drag. Models live in `src/three/models/` and read their animation state from the simulation result each frame.

## Project layout

```
src/
  circuit/      solver, parts catalog, examples, missions (no React)
  ai/           the AI board: Ollama client, board description and prompt (unit-tested), chat store
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
