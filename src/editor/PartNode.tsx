import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react'
import { Minus, Plus, RotateCcw, RotateCw, Wrench } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { lazy, memo, Suspense, useEffect, type ReactNode } from 'react'
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

// three.js is the biggest library in the app: load it after the first paint
const PartView = lazy(() => import('@/three/PartView'))

const POSITION: Record<Side, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
}

export const STATUS_STYLE: Record<PartStatus, string> = {
  idle: 'bg-foreground/[0.06] text-muted-foreground',
  weak: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  on: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  over: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  reverse: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  burnt: 'bg-zinc-500/20 text-zinc-700 dark:text-zinc-300',
  short: 'bg-red-500/15 text-red-700 dark:text-red-400',
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

/** How strongly an output part is working, as a share of its "full" level. */
function outputPercent(type: PartData['type'], level: number) {
  return Math.round(Math.min(1, Math.abs(level) / (type === 'motor' ? 2 : 1.3)) * 100)
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

/** Colour of the little indicator lamp for each state. */
const LED_COLOR: Record<PartStatus, string> = {
  idle: 'oklch(0.78 0.01 265)',
  weak: '#f59e0b',
  on: '#22c55e',
  over: '#f97316',
  reverse: '#0ea5e9',
  burnt: '#52525b',
  short: '#ef4444',
}

const STATUS_TEXT: Record<PartStatus, string> = {
  idle: 'text-muted-foreground',
  weak: 'text-amber-700 dark:text-amber-400',
  on: 'text-emerald-700 dark:text-emerald-400',
  over: 'text-orange-700 dark:text-orange-400',
  reverse: 'text-sky-700 dark:text-sky-400',
  burnt: 'text-zinc-600 dark:text-zinc-300',
  short: 'text-red-700 dark:text-red-400',
}

/** The state word next to an indicator lamp. The word may be cut short, so it never leaves the card. */
function StatusLamp({ status, label }: { status: PartStatus; label: string }) {
  const lit = status !== 'idle' && status !== 'burnt'
  return (
    <span className="flex max-w-[62%] min-w-0 shrink-0 items-center justify-end gap-1.5">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className={cn('block truncate text-[10.5px] leading-none font-medium', STATUS_TEXT[status])}
        >
          {label}
        </motion.span>
      </AnimatePresence>
      <span
        aria-hidden
        className={cn(
          'status-led',
          lit && 'status-led--lit',
          (status === 'short' || status === 'over') && 'status-led--blink',
        )}
        style={{ ['--led' as string]: LED_COLOR[status] }}
      />
    </span>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-6 shrink-0 place-items-center rounded-[7px] text-muted-foreground transition hover:bg-card hover:text-foreground hover:shadow-sm disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  )
}

/** The one control row under the 3D window: the quickest way for kids to play. */
function NodeControl({ id, data, result }: { id: string; data: PartData; result?: PartResult }) {
  const { t } = useI18n()
  const updatePart = useCircuit((s) => s.updatePart)

  if (data.burnt) {
    return (
      <button
        type="button"
        className="nodrag flex h-7 w-full items-center justify-center gap-1.5 rounded-[9px] bg-foreground text-[11px] font-semibold text-background transition hover:opacity-85 active:scale-[0.98]"
        onClick={() => {
          updatePart(id, { burnt: false })
          playClick()
        }}
      >
        <Wrench className="size-3.5" aria-hidden />
        {t.node.replace}
      </button>
    )
  }

  switch (data.type) {
    case 'battery':
      return (
        <div
          role="radiogroup"
          aria-label={t.inspector.batteryVoltage}
          className="nodrag node-track grid grid-cols-4 gap-0.5 p-0.5"
          dir="ltr"
        >
          {BATTERY_VOLTAGES.map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={data.voltage === v}
              onClick={() => updatePart(id, { voltage: v })}
              className={cn(
                'rounded-[7px] text-[11px] font-semibold tabular-nums transition',
                data.voltage === v
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground',
              )}
            >
              {v}V
            </button>
          ))}
        </div>
      )
    case 'switch':
      return (
        <label className="nodrag node-track flex cursor-pointer items-center justify-between ps-2.5 pe-1.5">
          <span
            className={cn(
              'text-[11px] font-semibold transition-colors',
              data.closed ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
            )}
          >
            {data.closed ? t.node.on : t.node.off}
          </span>
          <Switch
            checked={!!data.closed}
            aria-label={t.parts.switch.name}
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
          aria-pressed={!!data.pressed}
          className={cn(
            'nodrag flex h-7 w-full touch-none items-center justify-center rounded-[9px] text-[11px] font-semibold text-white transition select-none',
            data.pressed
              ? 'scale-[0.97] bg-pink-600 shadow-inner'
              : 'bg-pink-500 shadow-sm shadow-pink-500/30 hover:bg-pink-600',
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
    case 'dimmer': {
      const percent = Math.round((data.level ?? 0.7) * 100)
      return (
        <div className="nodrag nopan node-track flex items-center gap-2.5 ps-3 pe-2" dir="ltr">
          <Slider
            className="flex-1"
            min={0}
            max={100}
            step={1}
            aria-label={t.inspector.knob}
            value={[percent]}
            onValueChange={([v]) => updatePart(id, { level: v / 100 }, { history: false })}
            onValueCommit={() => useCircuit.getState().checkpoint()}
          />
          <span className="w-8 shrink-0 text-end text-[11px] font-semibold tabular-nums">{percent}%</span>
        </div>
      )
    }
    case 'resistor': {
      const values = RESISTOR_VALUES as readonly number[]
      const index = Math.max(0, values.indexOf(data.resistance ?? 100))
      const step = (delta: number) => {
        const next = values[Math.min(values.length - 1, Math.max(0, index + delta))]
        if (next !== data.resistance) updatePart(id, { resistance: next })
      }
      return (
        <div className="nodrag node-track flex items-center p-0.5" dir="ltr">
          <StepButton label={`${t.inspector.resistance} −`} onClick={() => step(-1)} disabled={index === 0}>
            <Minus className="size-3.5" />
          </StepButton>
          <span className="flex-1 text-center text-[11px] font-semibold tabular-nums">
            {formatOhms(data.resistance ?? 100)}
          </span>
          <StepButton
            label={`${t.inspector.resistance} +`}
            onClick={() => step(1)}
            disabled={index === values.length - 1}
          >
            <Plus className="size-3.5" />
          </StepButton>
        </div>
      )
    }
    default: {
      const level = result?.level ?? 0
      const percent = outputPercent(data.type, level)
      const Direction = level < 0 ? RotateCcw : RotateCw
      return (
        <div
          className="node-track flex items-center gap-2 px-2.5"
          dir="ltr"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={data.type === 'motor' ? t.inspector.speed : t.inspector.brightness}
        >
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: PARTS[data.type].accent }}
              animate={{ width: `${percent}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
            />
          </div>
          {data.type === 'motor' && percent > 0 && (
            <Direction className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span className="w-8 shrink-0 text-end text-[11px] font-semibold text-muted-foreground tabular-nums">
            {percent}%
          </span>
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
          'part-node',
          selected && 'part-node--selected',
          active && 'part-node--active',
          status === 'short' && 'part-node--danger',
        )}
        style={{ ['--part-accent' as string]: accent }}
      >
        <div className="part-node__head">
          <span className="part-node__name">{t.parts[data.type].name}</span>
          <StatusLamp status={chipStatus} label={statusLabel} />
        </div>
        {/* the 3D model is drawn only inside this framed window */}
        <div className="part-node__stage">
          <Suspense fallback={null}>
            <PartView data={data} result={result} />
          </Suspense>
        </div>
        <div className="part-node__control">
          <NodeControl id={id} data={data} result={result} />
        </div>
      </div>
      <Terminal id="a" data={data} />
      <Terminal id="b" data={data} />
    </div>
  )
}

export const PartNode = memo(PartNodeComponent)
