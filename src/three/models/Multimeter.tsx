/* Placeholder: replaced by the real model. */
import type { MeterDial } from '@/circuit/types'

export function MultimeterModel(_: { dial: MeterDial; text: string; unit: string; beep: boolean }) {
  return (
    <mesh>
      <boxGeometry args={[1.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}
