import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number'
import { AnimatePresence, motion } from 'motion/react'
import { Kbd } from '@/components/ui/kbd'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useCircuit } from '@/store/circuit'
import { useSimulation } from '@/store/simulation'

type BoardState = 'paused' | 'empty' | 'noBattery' | 'short' | 'complete' | 'open'

const TONE: Record<BoardState, string> = {
  paused: 'bg-muted text-muted-foreground',
  empty: 'bg-muted text-muted-foreground',
  noBattery: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  short: 'bg-red-500/15 text-red-600 dark:text-red-400',
  complete: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  open: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
}

export function StatusBar() {
  const { t } = useI18n()
  const running = useSimulation((s) => s.running)
  const result = useSimulation((s) => s.result)
  const parts = useCircuit((s) => s.nodes.length)
  const wires = useCircuit((s) => s.edges.length)

  const state: BoardState = !running
    ? 'paused'
    : parts === 0
      ? 'empty'
      : !result.hasBattery
        ? 'noBattery'
        : result.shortCircuit
          ? 'short'
          : result.batteryCurrent > 1e-3
            ? 'complete'
            : 'open'

  const label = {
    paused: t.statusBar.paused,
    empty: t.statusBar.empty,
    noBattery: t.statusBar.noBattery,
    short: t.statusBar.short,
    complete: t.statusBar.complete,
    open: t.statusBar.open,
  }[state]

  return (
    <footer className="relative z-20 flex h-9 shrink-0 items-center gap-3 border-t bg-background px-3 text-xs">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold', TONE[state])}
        >
          <span className={cn('size-1.5 rounded-full bg-current', (state === 'complete' || state === 'short') && 'animate-pulse')} />
          {label}
        </motion.span>
      </AnimatePresence>

      <span className="flex items-center gap-1.5 text-muted-foreground max-sm:hidden">
        {t.statusBar.batteryCurrent}
        <span dir="ltr" className="flex items-baseline gap-0.5 font-mono font-bold text-foreground tabular-nums">
          <SlidingNumber number={Math.round(result.batteryCurrent * 1000)} />
          <span className="text-muted-foreground">{t.units.milliamp}</span>
        </span>
      </span>

      <span className="ms-auto text-muted-foreground">
        {parts} {t.statusBar.parts} · {wires} {t.statusBar.wires}
      </span>
      <span className="flex items-center gap-1 text-muted-foreground max-lg:hidden" dir="ltr">
        <Kbd>R</Kbd>
        <Kbd>Del</Kbd>
        <Kbd>⌘Z</Kbd>
      </span>
    </footer>
  )
}
