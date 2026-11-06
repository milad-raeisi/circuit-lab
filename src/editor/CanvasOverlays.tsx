import { ShimmeringText } from '@animate-ui/react/primitives/texts/shimmering'
import { Panel, useReactFlow } from '@xyflow/react'
import { AnimatePresence, motion } from 'motion/react'
import { LiquidButton } from '@/components/animate-ui/buttons/liquid'
import { Maximize } from '@/components/animate-ui/icons/maximize'
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb'
import { TriangleAlert } from '@/components/animate-ui/icons/triangle-alert'
import { ZoomIn } from '@/components/animate-ui/icons/zoom-in'
import { ZoomOut } from '@/components/animate-ui/icons/zoom-out'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { WIRE_COLORS } from '@/circuit/catalog'
import { buildPreset } from '@/circuit/presets'
import type { WireColor } from '@/circuit/types'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useCircuit } from '@/store/circuit'
import { useDrag } from '@/store/drag'
import { useSettings } from '@/store/settings'
import { useSimulation } from '@/store/simulation'

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

/** Zoom buttons styled to match the rest of the app. */
export function CanvasControls() {
  const { t } = useI18n()
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  return (
    <Panel position="bottom-left" className="!m-3">
      <div className="flex items-center gap-0.5 rounded-xl border bg-card/90 p-1 shadow-lg backdrop-blur">
        <ControlButton label={t.controls.zoomIn} onClick={() => zoomIn({ duration: 250 })}>
          <ZoomIn size={18} animateOnHover />
        </ControlButton>
        <ControlButton label={t.controls.zoomOut} onClick={() => zoomOut({ duration: 250 })}>
          <ZoomOut size={18} animateOnHover />
        </ControlButton>
        <ControlButton label={t.controls.fit} onClick={() => fitView({ duration: 400, padding: 0.25, maxZoom: 1.1 })}>
          <Maximize size={18} animateOnHover />
        </ControlButton>
      </div>
    </Panel>
  )
}

/** Picks the colour of the next wire. */
export function WirePalette() {
  const { t } = useI18n()
  const wireColor = useSettings((s) => s.wireColor)
  const setWireColor = useSettings((s) => s.setWireColor)
  const options: (WireColor | 'auto')[] = ['auto', ...(Object.keys(WIRE_COLORS) as WireColor[])]
  return (
    <Panel position="top-left" className="!m-3">
      <div className="flex items-center gap-1.5 rounded-xl border bg-card/90 px-2 py-1.5 shadow-lg backdrop-blur">
        <span className="pe-1 text-[11px] font-semibold text-muted-foreground max-sm:hidden">{t.wirePalette}</span>
        {options.map((c) => (
          <Tooltip key={c}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t.colors[c]}
                aria-pressed={wireColor === c}
                onClick={() => setWireColor(c)}
                className={cn(
                  'size-5 rounded-full border-2 border-white shadow-sm ring-offset-1 ring-offset-card transition hover:scale-110 dark:border-zinc-700',
                  wireColor === c && 'ring-2 ring-primary',
                )}
                style={{
                  background:
                    c === 'auto'
                      ? `conic-gradient(${WIRE_COLORS.red} 0 50%, ${WIRE_COLORS.black} 50% 100%)`
                      : WIRE_COLORS[c],
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">{t.colors[c]}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </Panel>
  )
}

/** Friendly first screen when the board is empty. */
export function EmptyState() {
  const { t } = useI18n()
  const isEmpty = useCircuit((s) => s.nodes.length === 0)
  const load = useCircuit((s) => s.load)
  return (
    <AnimatePresence>
      {isEmpty && (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -12 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="pointer-events-none absolute inset-0 z-[5] grid place-items-center p-6"
        >
          <div className="pointer-events-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-dashed bg-card/80 p-8 text-center shadow-xl backdrop-blur">
            <span className="grid size-16 place-items-center rounded-2xl bg-amber-400/15 text-amber-500">
              <Lightbulb size={34} animate loop />
            </span>
            <ShimmeringText
              text={t.empty.title}
              className="text-xl font-extrabold"
              color="var(--foreground)"
              shimmeringColor="var(--color-amber-400)"
              duration={1.2}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">{t.empty.body}</p>
            <LiquidButton
              className="h-11 rounded-xl px-6 text-sm font-bold"
              onClick={() => load(buildPreset('flashlight'))}
            >
              {t.empty.cta}
            </LiquidButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Dashed outline that invites the drop while a part is dragged. */
export function DropZone() {
  const { t } = useI18n()
  const dragging = useDrag((s) => s.type !== null)
  const over = useDrag((s) => s.overBoard)
  return (
    <AnimatePresence>
      {dragging && (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'pointer-events-none absolute inset-2 z-[5] grid place-items-center rounded-2xl border-2 border-dashed transition-colors',
            over ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
          )}
        >
          <span
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition',
              over ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {t.drag.drop}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Red vignette and banner while a battery is short-circuited. */
export function ShortCircuitAlert() {
  const { t } = useI18n()
  const short = useSimulation((s) => s.result.shortCircuit)
  return (
    <AnimatePresence>
      {short && (
        <motion.div
          key="short"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-[5]"
        >
          <div className="short-vignette absolute inset-0" />
          <motion.div
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="absolute top-3 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30"
          >
            <TriangleAlert size={18} animate loop />
            <span>{t.tips.short}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
