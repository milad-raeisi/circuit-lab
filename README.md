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

- **Parts:** battery (1.5 / 3 / 4.5 / 9 V), switch, push button, dimmer, resistor, lamp, LED, motor and buzzer.
- **Wiring:** drag from a coloured terminal dot to another part. Red is `+`, black is `−`. Wires show moving dots whose speed and direction follow the real current.
- **Things that go wrong, safely:** 9 V burns out a lamp, an LED without a resistor burns out, a direct wire across the battery causes a short circuit (the battery heats up and the board warns), and a reversed LED stays dark.
- **Examples menu:** flashlight, fan, doorbell, LED, series vs. parallel lamps, night light with a dimmer, and a short circuit.
- **Missions:** eight challenges, such as "build a flashlight" and "spin the motor both ways", with confetti when one is completed.
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
  circuit/      solver, parts catalog, presets, missions (no React)
  editor/       board, part nodes, wires, sidebar, inspector, top/status bars
  three/        shared canvas, lighting helpers and the 3D part models
  store/        Zustand stores: circuit (with undo/redo), settings, simulation, drag
  i18n/         en (default), ar, fa dictionaries and the useI18n hook
  hooks/        simulation engine, keyboard shortcuts
  lib/          Web Audio sound effects, utilities
  components/   generated shadcn/ui and Animate UI components
```

## Adding things

- **A language:** copy `src/i18n/en.ts` (the `Dictionary` type makes TypeScript list every missing string), then register it in `LANGUAGES` and `DICTIONARIES` in `src/i18n/index.ts`.
- **A part:** add it to `PartType` (`src/circuit/types.ts`), `PARTS` (`catalog.ts`), the solver, a model in `src/three/models/`, `PartScene.tsx`, `PartIcon.tsx` and the three dictionaries.
