/* Placeholder: replaced by the real model. */
import type { Rotation } from '@/circuit/types'

export function ZenerModel(_: { holding: number; forward: number; burnt: boolean; rotation: Rotation }) {
  return (
    <mesh>
      <boxGeometry args={[1.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}
