import { View } from '@react-three/drei'
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  BATTERY_VOLTAGES,
  LAMP_COLORS,
  LED_COLORS,
  PARTS,
  RESISTOR_VALUES,
  formatOhms,
  rotateSide,
} from '@/circuit/catalog'
import type { PartResult, PartStatus } from '@/circuit/solver'
import type { LampColor, LedColor, PartData, PartNode as PartNodeType, Side, TerminalId } from '@/circuit/types'
import { useI18n } from '@/i18n'
import { playClick } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { NODE_WIDTH, useCircuit } from '@/store/circuit'
import { useSimulation } from '@/store/simulation'
import { PartScene } from '@/three/PartScene'
import { VIEW_PRIORITY } from '@/three/SceneCanvas'

const POSITION: Record<Side, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
}

export const STATUS_STYLE: Record<PartStatus, string> = {
  idle: 'bg-muted text-muted-foreground',
  weak: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  on: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  over: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  reverse: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  burnt: 'bg-zinc-500/20 text-zinc-600 dark:text-zinc-300',
  short: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export function partStatus(data: PartData, result?: PartResult): PartStatus {
  if (data.burnt) return 'burnt'
  return result?.status ?? 'idle'
}

/** Colour of the light a part gives off onto the board around it. */
function glowColor(data: PartData) {
  if (data.type === 'lamp') return LAMP_COLORS[(data.color as LampColor) ?? 'warm']
  if (data.type === 'led') return LED_COLORS[(data.color as LedColor) ?? 'red']
  return null
}

function Terminal({ id, data }: { id: TerminalId; data: PartData }) {
  const def = PARTS[data.type].terminals[id]
  const side = rotateSide(def.side, data.rotation)
  return (
    <Handle
      id={id}
      type="source"
      position={POSITION[side]}
      className={cn(
        'terminal',
        def.polarity === '+' && 'terminal--plus',
        def.polarity === '-' && 'terminal--minus',
      )}
    >
      {def.polarity && <span className="terminal__label">{def.polarity === '+' ? '+' : '−'}</span>}
    </Handle>
  )
}

function StatusChip({ status, label }: { status: PartStatus; label: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className={cn('block rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold whitespace-nowrap', STATUS_STYLE[status])}
      >
        {label}
      </motion.span>
    </AnimatePresence>
  )
}

/** The inline control under the 3D preview: the quickest way for kids to play. */
function NodeControl({ id, data, result }: { id: string; data: PartData; result?: PartResult }) {
  const { t } = useI18n()
  const updatePart = useCircuit((s) => s.updatePart)

  if (data.burnt) {
    return (
      <button
        type="button"
        className="nodrag w-full rounded-lg bg-zinc-900 py-1 text-xs font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        onClick={() => {
          updatePart(id, { burnt: false })
          playClick()
        }}
      >
        {t.node.replace}
      </button>
    )
  }

  switch (data.type) {
    case 'battery':
      return (
        <div className="nodrag grid grid-cols-4 gap-0.5 rounded-lg bg-muted p-0.5" dir="ltr">
          {BATTERY_VOLTAGES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => updatePart(id, { voltage: v })}
              className={cn(
                'rounded-md py-0.5 text-[10px] font-bold tabular-nums transition',
                data.voltage === v ? 'bg-amber-400 text-amber-950 shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v}V
            </button>
          ))}
        </div>
      )
    case 'switch':
      return (
        <label className="nodrag flex cursor-pointer items-center justify-between rounded-lg bg-muted px-2 py-1 text-xs font-semibold">
          <span>{data.closed ? t.node.on : t.node.off}</span>
          <Switch
            checked={!!data.closed}
            onCheckedChange={(closed) => {
              updatePart(id, { closed })
              playClick(closed)
            }}
          />
        </label>
      )
    case 'button': {
      const release = () => {
        if (!useCircuit.getState().nodes.find((n) => n.id === id)?.data.pressed) return
        updatePart(id, { pressed: false }, { history: false })
        playClick(false)
      }
      return (
        <button
          type="button"
          className={cn(
            'nodrag w-full touch-none rounded-lg py-1 text-xs font-bold transition select-none',
            data.pressed ? 'scale-95 bg-pink-600 text-white shadow-inner' : 'bg-pink-500 text-white shadow-sm hover:bg-pink-600',
          )}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            updatePart(id, { pressed: true }, { history: false })
            playClick(true)
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
        >
          {t.node.press}
        </button>
      )
    }
    case 'dimmer':
      return (
        <div className="nodrag nopan px-1 py-1.5" dir="ltr">
          <Slider
            min={0}
            max={100}
            step={1}
            value={[Math.round((data.level ?? 0.7) * 100)]}
            onValueChange={([v]) => updatePart(id, { level: v / 100 }, { history: false })}
            onValueCommit={() => useCircuit.getState().checkpoint()}
          />
        </div>
      )
    case 'resistor': {
      const values = RESISTOR_VALUES as readonly number[]
      const index = Math.max(0, values.indexOf(data.resistance ?? 100))
      const step = (delta: number) => {
        const next = values[Math.min(values.length - 1, Math.max(0, index + delta))]
        if (next !== data.resistance) updatePart(id, { resistance: next })
      }
      return (
        <div className="nodrag flex items-center justify-between rounded-lg bg-muted p-0.5 text-xs font-bold" dir="ltr">
          <button type="button" className="rounded-md px-2 hover:bg-background" onClick={() => step(-1)} disabled={index === 0}>
            −
          </button>
          <span className="tabular-nums">{formatOhms(data.resistance ?? 100)}</span>
          <button type="button" className="rounded-md px-2 hover:bg-background" onClick={() => step(1)} disabled={index === values.length - 1}>
            +
          </button>
        </div>
      )
    }
    default: {
      const level = Math.abs(result?.level ?? 0)
      const reversed = data.type === 'motor' && (result?.level ?? 0) < 0
      return (
        <div className="flex items-center gap-1.5 px-0.5" dir="ltr">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ background: PARTS[data.type].accent }}
              animate={{ width: `${Math.min(100, (level / (data.type === 'motor' ? 2 : 1.3)) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
            />
          </div>
          {data.type === 'motor' && level > 0 && (
            <span className="text-[11px] font-bold text-muted-foreground">{reversed ? '↺' : '↻'}</span>
          )}
        </div>
      )
    }
  }
}

function PartNodeComponent({ id, data, selected }: NodeProps<PartNodeType>) {
  const { t } = useI18n()
  const result = useSimulation((s) => s.result.parts[id])
  const updateNodeInternals = useUpdateNodeInternals()
  const status = partStatus(data, result)
  const accent = PARTS[data.type].accent
  const glow = glowColor(data)
  const glowLevel = data.burnt ? 0 : Math.min(1.3, result?.level ?? 0)
  const active = status === 'on' || status === 'weak' || status === 'over'

  // handles move when the part is rotated
  useEffect(() => updateNodeInternals(id), [id, data.rotation, updateNodeInternals])

  // switches and buttons show their lever position, not whether current flows
  const mechanical =
    data.type === 'switch' ? !!data.closed : data.type === 'button' ? !!data.pressed : null
  const chipStatus: PartStatus = mechanical === null ? status : mechanical ? 'on' : 'idle'
  const statusLabel =
    chipStatus === 'on' ? t.parts[data.type].working : t.status[chipStatus]

  return (
    // The wrapper has no background so the light glow (z-index −1) lands on the
    // board *behind* the card instead of tinting the card itself.
    <div className="relative" style={{ width: NODE_WIDTH }}>
      {glow && (
        <div
          aria-hidden
          className="part-node__light"
          style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
            opacity: glowLevel * 0.55,
            transform: `translate(-50%, -50%) scale(${0.6 + glowLevel * 0.5})`,
          }}
        />
      )}
      <div
        className={cn(
          'part-node rounded-2xl border bg-card text-card-foreground shadow-sm transition-[box-shadow,border-color] duration-300',
          selected && 'part-node--selected',
          active && 'part-node--active',
          status === 'short' && 'part-node--danger',
        )}
        style={{ ['--part-accent' as string]: accent }}
      >
        <div className="flex items-center gap-1.5 px-2.5 pt-2">
          <span className="size-2 shrink-0 rounded-full" style={{ background: accent }} />
          <span className="truncate text-xs font-bold">{t.parts[data.type].name}</span>
          <span className="ms-auto shrink-0">
            <StatusChip status={chipStatus} label={statusLabel} />
          </span>
        </div>
        <View index={VIEW_PRIORITY} className="h-[112px] w-full">
          <PartScene data={data} result={result} />
        </View>
        <div className="px-2 pb-2">
          <NodeControl id={id} data={data} result={result} />
        </div>
      </div>
      <Terminal id="a" data={data} />
      <Terminal id="b" data={data} />
    </div>
  )
}

export const PartNode = memo(PartNodeComponent)
