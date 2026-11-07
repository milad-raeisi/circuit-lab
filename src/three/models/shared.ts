import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/* Materials and helpers shared by the workshop models. */

export const METAL = { color: '#d4d4d8', metalness: 0.9, roughness: 0.25 } as const
export const GOLD = { color: '#e5c76b', metalness: 0.85, roughness: 0.3 } as const
export const SILK = { color: '#f1f5f9', roughness: 0.7 } as const

export const unit = (v: number) => THREE.MathUtils.clamp(Number.isFinite(v) ? v : 0, 0, 1)

/** Geometry built once by a module-level `build` and freed when the model goes away. */
export function useBuilt<T extends THREE.BufferGeometry>(build: () => T) {
  const geometry = useMemo(() => build(), [build])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

/** Like `useBuilt`, rebuilt whenever `arg` changes. */
export function useBuiltWith<T extends THREE.BufferGeometry, A extends string | number>(build: (arg: A) => T, arg: A) {
  const geometry = useMemo(() => build(arg), [build, arg])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}
