import { View } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'

/** Views render at this priority; the clear pass runs just before them. */
export const VIEW_PRIORITY = 2

/**
 * drei's <View> draws every view into its own scissor rectangle but never
 * clears the rest of the canvas. Without this pass a part that is dragged
 * across the board would leave a trail of old frames behind.
 */
function ClearPass() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false)
    gl.setClearColor(0x000000, 0)
    gl.clear(true, true, true)
  }, VIEW_PRIORITY - 1)
  return null
}

/**
 * One shared WebGL canvas for the whole board. Every part node registers a
 * <View> that tracks its DOM box, so 40 parts still cost a single WebGL
 * context. The canvas sits above the nodes but ignores the pointer, so all
 * clicks and drags still reach React Flow.
 *
 * It covers the whole window (not just the board) because drei's off-screen
 * check compares view positions with the canvas size as if the canvas started
 * at 0,0. The side panels and bars are stacked above it, so 3D never shows
 * outside the board.
 */
export function SceneCanvas() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      aria-hidden
    >
      <ClearPass />
      <View.Port />
    </Canvas>
  )
}
