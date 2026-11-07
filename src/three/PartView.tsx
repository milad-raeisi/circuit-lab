import { View } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { PartResult } from '@/circuit/solver'
import type { PartData } from '@/circuit/types'
import { PartScene } from './PartScene'
import { VIEW_PRIORITY } from './SceneCanvas'

// TEMP framing probe (lab parts): exposes each view's scene and camera by part type. Remove before finishing.
function FramingProbe({ type }: { type: string }) {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    const w = window as unknown as { __framing?: Record<string, { scene: unknown; camera: unknown }> }
    w.__framing ??= {}
    w.__framing[type] = { scene, camera }
  }, [type, scene, camera])
  return null
}

/**
 * The 3D window of one part card. It lives in its own module so the whole
 * three.js bundle loads after the app has painted, not before.
 */
export default function PartView({ data, result }: { data: PartData; result?: PartResult }) {
  return (
    <View index={VIEW_PRIORITY} className="absolute inset-0">
      <PartScene data={data} result={result} />
      <FramingProbe type={data.type} />
    </View>
  )
}
