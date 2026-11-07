import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Halo, damp } from '../helpers'
import { Lead } from './kit'
import { PRINT_FONT, printTexture } from './print'
import { METAL, merge, unit, useBuilt } from './shared'

/*
 * A pen-shaped logic probe lying on the bench: a steel needle at the right
 * end, a see-through violet body with its little board inside, three LEDs
 * (HIGH red, LOW green, PULSE amber) on the flat top, and at the left end the
 * cable that splits into a red and a black alligator clip for + and −.
 */

/** the pen's own axis runs along x, the tip at +x; its LEDs face +z */
const R = 0.175
/** along the axis: tail of the cable relief, end cap, body, nose, needle */
const U = { relief: -1.42, cap: -1.16, body: -1.0, nose: 0.78, needleBase: 1.1, point: 1.5 }
/** where the pen lies on the bench and how steeply it runs */
const PEN_AT: [number, number, number] = [0.42, 0.06, 0]
const PEN_ANGLE = 0.58
const BENCH = -R
const PANEL = { from: -0.02, to: 0.7, width: 0.2 }
const LEDS = [
  { u: 0.56, color: '#ff3b30', off: '#5c1512', key: 'high' },
  { u: 0.34, color: '#34e36b', off: '#123d20', key: 'low' },
  { u: 0.12, color: '#ffb020', off: '#4a3208', key: 'pulse' },
] as const

/* ------------------------------------------------------------- geometry */

/** A shape turned round the pen's axis: `profile` is [radius, along] pairs. */
function turned(profile: [number, number][], segments = 36) {
  return new THREE.LatheGeometry(
    profile.map(([r, u]) => new THREE.Vector2(r, u)),
    segments,
  ).rotateZ(-Math.PI / 2)
}

const shellGeometry = () =>
  turned([
    [R - 0.006, U.body],
    [R, U.body + 0.12],
    [R + 0.004, -0.3],
    [R, U.nose - 0.1],
    [R - 0.004, U.nose],
  ])

const capGeometry = () =>
  turned([
    [0, U.cap - 0.02],
    [0.09, U.cap - 0.02],
    [0.14, U.cap + 0.02],
    [R - 0.002, U.cap + 0.1],
    [R + 0.006, U.body + 0.02],
  ])

const noseGeometry = () =>
  turned([
    [R + 0.006, U.nose - 0.02],
    [R + 0.01, U.nose + 0.06],
    [R - 0.01, U.nose + 0.12],
    [0.1, U.nose + 0.24],
    [0.045, U.needleBase - 0.02],
    [0.03, U.needleBase],
    [0, U.needleBase],
  ])

/** the ribbed rubber that keeps the cable from kinking */
function reliefGeometry() {
  const parts: THREE.BufferGeometry[] = [
    new THREE.CylinderGeometry(0.088, 0.05, U.cap - U.relief, 20).rotateZ(Math.PI / 2).translate((U.cap + U.relief) / 2, 0, 0),
  ]
  for (let i = 0; i < 4; i++) {
    const u = U.cap - 0.05 - i * 0.055
    const r = 0.088 - ((U.cap - u) / (U.cap - U.relief)) * 0.038 + 0.012
    parts.push(new THREE.CylinderGeometry(r, r, 0.022, 20).rotateZ(Math.PI / 2).translate(u, 0, 0))
  }
  return merge(parts)
}

/** gold pads and tiny resistors scattered on the board inside */
function boardPartsGeometry() {
  const parts: THREE.BufferGeometry[] = []
  for (const [u, y] of [
    [-0.1, 0.06],
    [-0.1, -0.06],
    [0.0, 0.07],
    [-0.75, 0.05],
    [-0.75, -0.05],
  ] as const)
    parts.push(new THREE.BoxGeometry(0.07, 0.035, 0.025).translate(u, y, 0))
  return merge(parts)
}

function padsGeometry() {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < 10; i++) parts.push(new THREE.BoxGeometry(0.03, 0.03, 0.004).translate(-0.92 + i * 0.1, i % 2 ? 0.09 : -0.09, 0))
  return merge(parts)
}

/* ---------------------------------------------------------------- print */

const panelPrint = () =>
  printTexture('logicProbe:panel', PANEL.to - PANEL.from, PANEL.width, (ctx, w, h) => {
    const ppu = w / (PANEL.to - PANEL.from)
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#e5e7eb'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = `700 ${0.05 * ppu}px ${PRINT_FONT}`
    const labels = { high: 'HI', low: 'LO', pulse: 'PULSE' }
    for (const led of LEDS) ctx.fillText(labels[led.key], (led.u - PANEL.from) * ppu, h * 0.17)
    // a thin line along the far edge, as on the moulded panel
    ctx.fillRect(0.03 * ppu, h * 0.88, w - 0.06 * ppu, 0.008 * ppu)
  })

const namePrint = () =>
  printTexture('logicProbe:name', 0.62, 0.09, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(245, 243, 255, 0.92)'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${h * 0.62}px ${PRINT_FONT}`
    const text = 'LOGIC PROBE'
    const fit = Math.min(1, (w * 0.98) / ctx.measureText(text).width)
    ctx.save()
    ctx.scale(fit, 1)
    ctx.fillText(text, 0, h * 0.52)
    ctx.restore()
  })

/* ---------------------------------------------------------------- pieces */

/** One 3 mm LED standing in the top panel: it glows with `level` and throws a soft halo. */
function Led({ u, color, off, level }: { u: number; color: string; off: string; level: number }) {
  const lens = useRef<THREE.MeshStandardMaterial>(null)
  const dome = useRef<THREE.MeshStandardMaterial>(null)
  const lit = useRef(unit(level))
  const glow = useRef(0)
  useFrame((_, dt) => {
    // LEDs switch in a flash, so a short PULSE still shows
    lit.current = damp(lit.current, unit(level), 30, dt)
    const shine = 0.12 + lit.current * 3.2
    if (lens.current) lens.current.emissiveIntensity = shine
    if (dome.current) dome.current.emissiveIntensity = shine
    glow.current = lit.current * 0.85
  })
  return (
    <group position={[u, 0, 0]}>
      {/* the black bezel ring the LED sits in */}
      <mesh position={[0, 0, R + 0.002]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.016, 24]} />
        <meshStandardMaterial color="#0b0b0e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, R - 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.06, 20]} />
        <meshStandardMaterial ref={lens} color={off} emissive={color} emissiveIntensity={0.12} roughness={0.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, R + 0.01]}>
        <sphereGeometry args={[0.045, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={off} emissive={color} emissiveIntensity={0.12} roughness={0.15} toneMapped={false} ref={dome} />
      </mesh>
      <Halo color={color} intensity={glow} position={[0, 0, R + 0.09]} scale={0.62} />
    </group>
  )
}

/** A crocodile clip lying on its side: the coloured boot, the plated jaws with their teeth, the rivet. */
function Clip({ at, angle, color }: { at: [number, number, number]; angle: number; color: string }) {
  const teeth = useBuilt(teethGeometry)
  return (
    <group position={at} rotation={[0, 0, angle]}>
      {/* the soft PVC boot, wider where it covers the jaws' levers */}
      <mesh position={[0.21, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.105, 0.06, 0.42, 20]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0.43, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.1, 0.11, 0.04, 20]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {/* the two jaws, closed at the tip */}
      {[1, -1].map((side) => (
        <group key={side} position={[0.45, side * 0.045, 0]} rotation={[0, 0, -side * 0.12]}>
          <mesh position={[0.18, 0, 0]}>
            <boxGeometry args={[0.36, 0.022, 0.07]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
          <mesh geometry={teeth} position={[0.05, -side * 0.016, 0]} scale={[1, side, 1]}>
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 14]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** little triangular teeth along a jaw's inner edge */
function teethGeometry() {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < 6; i++) parts.push(new THREE.BoxGeometry(0.024, 0.024, 0.07).rotateZ(Math.PI / 4).translate(i * 0.05, 0, 0))
  return merge(parts)
}

/* --------------------------------------------------------- the cable run */

const cos = Math.cos(PEN_ANGLE)
const sin = Math.sin(PEN_ANGLE)
/** a point along the pen's axis, in bench coordinates */
const onPen = (u: number, lift = 0): [number, number, number] => [PEN_AT[0] + u * cos, PEN_AT[1] + u * sin, PEN_AT[2] + lift]

const TAIL = onPen(U.relief)
const SPLIT: [number, number, number] = [TAIL[0] - 0.36, TAIL[1] - 0.12, BENCH + 0.035]
const RED_CLIP = { at: [-1.42, 0.18, BENCH + 0.06] as [number, number, number], angle: Math.PI - 0.24 }
const BLACK_CLIP = { at: [-1.38, -0.42, BENCH + 0.06] as [number, number, number], angle: Math.PI + 0.12 }

const MAIN_CABLE: [number, number, number][] = [
  TAIL,
  onPen(U.relief - 0.14, -0.02),
  [TAIL[0] - 0.24, TAIL[1] - 0.14, BENCH + 0.04],
  SPLIT,
]
const leadTo = (clip: { at: [number, number, number]; angle: number }, bend: [number, number]): [number, number, number][] => [
  SPLIT,
  [SPLIT[0] - 0.08 + bend[0], SPLIT[1] + bend[1], BENCH + 0.03],
  [clip.at[0] + 0.12 + Math.cos(clip.angle) * -0.04, clip.at[1] - Math.sin(clip.angle) * 0.1 + bend[1] * 0.4, BENCH + 0.035],
  [clip.at[0] - Math.cos(clip.angle) * 0.02, clip.at[1] - Math.sin(clip.angle) * 0.02, clip.at[2]],
]
const RED_LEAD = leadTo(RED_CLIP, [0.02, 0.22])
const BLACK_LEAD = leadTo(BLACK_CLIP, [-0.06, -0.08])

/* ------------------------------------------------------------------ model */

/**
 * A logic probe: clip it to + and −, touch the needle to a point, and the
 * red HIGH or green LOW light says which it is; the amber PULSE light
 * flashes each time it changes.
 */
export function LogicProbeModel({ high, low, pulse, powered }: { high: number; low: number; pulse: number; powered: boolean }) {
  const shell = useBuilt(shellGeometry)
  const cap = useBuilt(capGeometry)
  const nose = useBuilt(noseGeometry)
  const relief = useBuilt(reliefGeometry)
  const boardParts = useBuilt(boardPartsGeometry)
  const pads = useBuilt(padsGeometry)
  const levels = { high: powered ? high : 0, low: powered ? low : 0, pulse: powered ? pulse : 0 }

  return (
    <group position={[0.05, 0.02, 0]} rotation={[-0.62, 0, 0]}>
      <group position={PEN_AT} rotation={[0, 0, PEN_ANGLE]}>
        {/* the little board inside, seen through the body */}
        <mesh position={[-0.2, 0, -0.03]}>
          <boxGeometry args={[1.6, 0.24, 0.02]} />
          <meshStandardMaterial color="#14532d" roughness={0.6} />
        </mesh>
        <mesh geometry={pads} position={[0, 0, -0.018]}>
          <meshStandardMaterial color="#e5c76b" metalness={0.8} roughness={0.35} />
        </mesh>
        <RoundedBox args={[0.3, 0.15, 0.06]} radius={0.01} smoothness={2} position={[-0.45, 0, 0.01]}>
          <meshStandardMaterial color="#18181b" roughness={0.45} />
        </RoundedBox>
        <mesh geometry={boardParts} position={[0, 0, -0.008]}>
          <meshStandardMaterial color="#27272a" roughness={0.5} />
        </mesh>
        {/* the needle's spring contact running back to the board */}
        <mesh position={[(U.nose + 0.6) / 2, 0, -0.01]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, U.nose - 0.6 + 0.2, 8]} />
          <meshStandardMaterial {...METAL} />
        </mesh>

        {/* the flat black panel on top with the three LED windows */}
        <RoundedBox
          args={[PANEL.to - PANEL.from, PANEL.width, 0.04]}
          radius={0.012}
          smoothness={2}
          position={[(PANEL.from + PANEL.to) / 2, 0, R - 0.022]}
        >
          <meshStandardMaterial color="#17171b" roughness={0.5} />
        </RoundedBox>
        <mesh position={[(PANEL.from + PANEL.to) / 2, 0, R - 0.0005]}>
          <planeGeometry args={[PANEL.to - PANEL.from, PANEL.width]} />
          <meshStandardMaterial map={panelPrint()} transparent roughness={0.5} depthWrite={false} />
        </mesh>
        {LEDS.map((led) => (
          <Led key={led.key} u={led.u} color={led.color} off={led.off} level={levels[led.key]} />
        ))}

        {/* the slide switch for TTL or CMOS chips */}
        <group position={[-0.62, 0, R - 0.012]}>
          <RoundedBox args={[0.26, 0.09, 0.03]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#111114" roughness={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.08, 0.07, 0.045]} radius={0.012} smoothness={2} position={[-0.06, 0, 0.012]}>
            <meshStandardMaterial color="#d4d4d8" roughness={0.45} />
          </RoundedBox>
        </group>
        <mesh position={[-0.12, -0.03, R + 0.004]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.62, 0.09]} />
          <meshStandardMaterial map={namePrint()} transparent roughness={0.5} depthWrite={false} />
        </mesh>

        {/* the see-through violet body, drawn after what is inside it */}
        <mesh geometry={shell} renderOrder={4}>
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.42} roughness={0.18} metalness={0.05} depthWrite={false} />
        </mesh>
        <mesh geometry={cap}>
          <meshStandardMaterial color="#1c1b22" roughness={0.45} />
        </mesh>
        <mesh geometry={relief}>
          <meshStandardMaterial color="#141418" roughness={0.6} />
        </mesh>
        <mesh geometry={nose}>
          <meshStandardMaterial color="#1c1b22" roughness={0.4} />
        </mesh>
        {/* the steel needle */}
        <mesh position={[(U.needleBase + U.point - 0.06) / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.02, U.point - 0.06 - U.needleBase, 12]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        <mesh position={[U.point - 0.03, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.018, 0.06, 12]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      </group>

      {/* the cable, its splitter, and the red (+) and black (−) clips */}
      <Lead points={MAIN_CABLE} radius={0.038} color="#18181b" />
      <mesh position={SPLIT} rotation={[0, 0, Math.atan2(SPLIT[1] - TAIL[1], SPLIT[0] - TAIL[0])]}>
        <capsuleGeometry args={[0.05, 0.08, 6, 16]} />
        <meshStandardMaterial color="#141418" roughness={0.55} />
      </mesh>
      <Lead points={RED_LEAD} radius={0.026} color="#dc2626" />
      <Lead points={BLACK_LEAD} radius={0.026} color="#1f1f23" />
      <Clip at={RED_CLIP.at} angle={RED_CLIP.angle} color="#dc2626" />
      <Clip at={BLACK_CLIP.at} angle={BLACK_CLIP.angle} color="#202024" />
    </group>
  )
}
