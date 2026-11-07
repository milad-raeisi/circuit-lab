import type { Edge, Node } from '@xyflow/react'

export type PartType =
  | 'battery'
  | 'solar'
  | 'arduino'
  | 'switch'
  | 'button'
  | 'dimmer'
  | 'resistor'
  | 'capacitor'
  | 'diode'
  | 'transistor'
  | 'fuse'
  | 'lamp'
  | 'led'
  | 'motor'
  | 'buzzer'
  | 'ldr'
  | 'voltmeter'
  | 'ammeter'

/** Clockwise rotation of a part on the board, in degrees. */
export type Rotation = 0 | 90 | 180 | 270

/**
 * A connection point on a part. Simple parts have `a` and `b`; a transistor
 * has `B`, `C` and `E`; the Arduino has one per pin (`5V`, `GND`, `D13` …).
 */
export type TerminalId = string

export type Side = 'left' | 'top' | 'right' | 'bottom'

export type LampColor = 'warm' | 'yellow' | 'red' | 'green' | 'blue'
export type LedColor = 'red' | 'yellow' | 'green' | 'blue' | 'white'
export type WireColor = 'red' | 'black' | 'blue' | 'yellow' | 'green' | 'white'

/** What an Arduino pin does: stay low, stay high, blink, or fade up and down (PWM pins only). */
export type PinMode = 'off' | 'on' | 'blink' | 'fade'

/**
 * Data stored on a React Flow node. It is a `type` (not an `interface`) so it
 * satisfies React Flow's `Record<string, unknown>` constraint.
 */
export type PartData = {
  type: PartType
  rotation: Rotation
  /** battery: nominal voltage */
  voltage?: number
  /** lamp / led: colour key */
  color?: LampColor | LedColor
  /** switch: lever position */
  closed?: boolean
  /** push button: held down right now (never persisted) */
  pressed?: boolean
  /** resistor: ohms */
  resistance?: number
  /** dimmer: knob position 0..1 */
  level?: number
  /** capacitor: microfarads */
  capacitance?: number
  /** fuse: amps it can carry before it blows */
  rating?: number
  /** light sensor / solar panel: how much light falls on it, 0..1 */
  light?: number
  /** arduino: the "program" of each output pin */
  pins?: Record<string, PinMode>
  /** lamp / led / diode / fuse / transistor: destroyed by too much power */
  burnt?: boolean
}

export type WireData = {
  color: WireColor
}

export type PartNode = Node<PartData, 'part'>
export type WireEdge = Edge<WireData, 'wire'>

export type CircuitSnapshot = {
  nodes: PartNode[]
  edges: WireEdge[]
}
