import type { Edge, Node } from '@xyflow/react'

export type PartType =
  | 'battery'
  | 'switch'
  | 'button'
  | 'lamp'
  | 'led'
  | 'motor'
  | 'buzzer'
  | 'resistor'
  | 'dimmer'

/** Clockwise rotation of a part on the board, in degrees. */
export type Rotation = 0 | 90 | 180 | 270

/** Every part has exactly two terminals. */
export type TerminalId = 'a' | 'b'

export type Side = 'left' | 'top' | 'right' | 'bottom'

export type LampColor = 'warm' | 'yellow' | 'red' | 'green' | 'blue'
export type LedColor = 'red' | 'yellow' | 'green' | 'blue' | 'white'
export type WireColor = 'red' | 'black' | 'blue' | 'yellow' | 'green' | 'white'

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
  /** lamp / led: destroyed by too much power */
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
