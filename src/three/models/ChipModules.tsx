/* Placeholder: replaced by the real model. */
export function LatchModel(_: { set: number; reset: number; q: number; powered: boolean }) {
  return (
    <mesh>
      <boxGeometry args={[1.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}

export function CounterModel(_: { count: number; clock: number; powered: boolean }) {
  return (
    <mesh>
      <boxGeometry args={[1.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}

export function ComparatorModel(_: { out: number; powered: boolean }) {
  return (
    <mesh>
      <boxGeometry args={[1.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}

export function HBridgeModel(_: { direction: number; in1: number; in2: number; powered: boolean; hot: boolean }) {
  return (
    <mesh>
      <boxGeometry args={[1.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}
