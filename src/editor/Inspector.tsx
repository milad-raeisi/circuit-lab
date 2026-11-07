import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { Copy } from '@/components/animate-ui/icons/copy'
import { Flame } from '@/components/animate-ui/icons/flame'
import { RotateCcw } from '@/components/animate-ui/icons/rotate-ccw'
import { Trash2 } from '@/components/animate-ui/icons/trash-2'
import { TriangleAlert } from '@/components/animate-ui/icons/triangle-alert'
import { Unplug } from '@/components/animate-ui/icons/unplug'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  BATTERY_VOLTAGES,
  LAMP_COLORS,
  LED_COLORS,
  LED_FORWARD_VOLTAGE,
  PARTS,
  RESISTOR_VALUES,
  WIRE_COLORS,
  formatOhms,
} from '@/circuit/catalog'
import { MISSION_IDS } from '@/circuit/missions'
import type { PartResult, PartStatus } from '@/circuit/solver'
import type { LampColor, LedColor, PartData, WireColor, WireEdge } from '@/circuit/types'
import { useI18n, type Dictionary } from '@/i18n'
import { playClick } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { selectSelectedWire, useCircuit, useSelectedPart, type SelectedPart } from '@/store/circuit'
import { useSettings } from '@/store/settings'
import { useSimulation } from '@/store/simulation'
import { Missions } from './Missions'
import { PartArt } from './PartArt'
import { STATUS_STYLE, partStatus } from './PartNode'

type Tip = { text: string; tone: 'warn' | 'info' | 'danger' }

function tipFor(data: PartData, result: PartResult | undefined, status: PartStatus, t: Dictionary, running: boolean): Tip | null {
  if (status === 'burnt') return { text: t.tips.burnt, tone: 'danger' }
  if (!running || !result) return null
  switch (data.type) {
    case 'battery':
      if (status === 'short') return { text: t.tips.short, tone: 'danger' }
      if (status === 'idle') return { text: t.tips.batteryIdle, tone: 'info' }
      return null
    case 'lamp':
      if (status === 'weak') return { text: t.tips.lampWeak, tone: 'info' }
      if (status === 'over') return { text: t.tips.lampOver, tone: 'warn' }
      return null
    case 'led': {
      if (status === 'reverse') return { text: t.tips.ledReverse, tone: 'warn' }
      if (status === 'over') return { text: t.tips.ledOver, tone: 'warn' }
      const vf = LED_FORWARD_VOLTAGE[(data.color as LedColor) ?? 'red']
      if (status === 'idle' && result.voltage > 0.3 && result.voltage < vf) return { text: t.tips.ledOff, tone: 'info' }
      return null
    }
    case 'motor':
      if (status === 'weak') return { text: t.tips.motorWeak, tone: 'info' }
      if (status === 'over') return { text: t.tips.motorOver, tone: 'warn' }
      if (result.level < 0) return { text: t.tips.motorReverse, tone: 'info' }
      return null
    case 'resistor':
    case 'dimmer':
      return status === 'over' ? { text: t.tips.resistorHot, tone: 'warn' } : null
    default:
      return null
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground">{title}</h4>
      {children}
    </section>
  )
}

function Reading({ label, value, unit, decimals }: { label: string; value: number; unit: string; decimals: number }) {
  return (
    <div className="rounded-xl border bg-card px-2.5 py-2 shadow-[var(--shadow-card)]">
      <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      <div dir="ltr" className="flex items-baseline justify-end gap-1 font-mono text-[15px] font-semibold tabular-nums">
        <SlidingNumber number={Number(value.toFixed(decimals))} decimalPlaces={decimals} />
        <span className="text-xs font-semibold text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function CurrentReading({ label, amps }: { label: string; amps: number }) {
  const { t } = useI18n()
  const a = Math.abs(amps)
  return a < 1 ? (
    <Reading label={label} value={Math.round(a * 1000)} unit={t.units.milliamp} decimals={0} />
  ) : (
    <Reading label={label} value={a} unit={t.units.amp} decimals={2} />
  )
}

function Swatches<T extends string>({
  value,
  colors,
  labels,
  onChange,
}: {
  value: T
  colors: Record<T, string>
  labels: Record<string, string>
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(colors) as T[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={c === value}
          className={cn(
            'flex items-center gap-1.5 rounded-full border py-1 ps-1 pe-2.5 text-xs font-medium transition hover:bg-muted',
            c === value && 'border-primary bg-primary/10',
          )}
        >
          <span className="size-4 rounded-full border border-black/10 shadow-inner" style={{ background: colors[c] }} />
          {labels[c]}
        </button>
      ))}
    </div>
  )
}

function PartSettings({ node }: { node: SelectedPart }) {
  const { t } = useI18n()
  const updatePart = useCircuit((s) => s.updatePart)
  const { id, data } = node

  switch (data.type) {
    case 'battery':
      return (
        <ToggleGroup
          type="single"
          variant="outline"
          className="w-full"
          dir="ltr"
          value={String(data.voltage ?? 3)}
          onValueChange={(v) => v && updatePart(id, { voltage: Number(v) })}
        >
          {BATTERY_VOLTAGES.map((v) => (
            <ToggleGroupItem key={v} value={String(v)} className="flex-1 font-bold">
              {v}V
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )
    case 'lamp':
      return (
        <Swatches
          value={(data.color as LampColor) ?? 'warm'}
          colors={LAMP_COLORS}
          labels={t.colors}
          onChange={(color) => updatePart(id, { color })}
        />
      )
    case 'led':
      return (
        <Swatches
          value={(data.color as LedColor) ?? 'red'}
          colors={LED_COLORS}
          labels={t.colors}
          onChange={(color) => updatePart(id, { color })}
        />
      )
    case 'resistor':
      return (
        <Select value={String(data.resistance ?? 100)} onValueChange={(v) => updatePart(id, { resistance: Number(v) })}>
          <SelectTrigger className="w-full" dir="ltr">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESISTOR_VALUES.map((v) => (
              <SelectItem key={v} value={String(v)}>
                {formatOhms(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'dimmer':
      return (
        <div className="space-y-2 rounded-xl border p-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{t.inspector.knob}</span>
            <span className="font-bold tabular-nums" dir="ltr">
              {Math.round((data.level ?? 0.7) * 100)}%
            </span>
          </div>
          <div dir="ltr">
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round((data.level ?? 0.7) * 100)]}
              onValueChange={([v]) => updatePart(id, { level: v / 100 }, { history: false })}
              onValueCommit={() => useCircuit.getState().checkpoint()}
            />
          </div>
        </div>
      )
    case 'switch':
      return (
        <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm font-semibold">
          {t.inspector.switchState}: {data.closed ? t.inspector.on : t.inspector.off}
          <Switch
            checked={!!data.closed}
            onCheckedChange={(closed) => {
              updatePart(id, { closed })
              playClick(closed)
            }}
          />
        </label>
      )
    default:
      return null
  }
}

function PartInspector({ node }: { node: SelectedPart }) {
  const { t } = useI18n()
  const running = useSimulation((s) => s.running)
  const result = useSimulation((s) => s.result.parts[node.id])
  const { rotatePart, duplicatePart, removePart, updatePart } = useCircuit.getState()
  const { data } = node
  const status = partStatus(data, result)
  const tip = tipFor(data, result, status, t, running)
  const accent = PARTS[data.type].accent
  const showLevel = ['lamp', 'led', 'motor', 'buzzer'].includes(data.type)
  const hasSettings = !['button', 'motor', 'buzzer'].includes(data.type)

  return (
    <div className="space-y-5 p-4">
      <header className="flex items-center gap-3">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-2xl border"
          style={{ background: `color-mix(in oklch, ${accent} 9%, var(--card))` }}
        >
          <PartArt partType={data.type} size={44} />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-base font-semibold">{t.parts[data.type].name}</h3>
          <Badge className={cn('border-0', STATUS_STYLE[status])}>
            {status === 'on' ? t.parts[data.type].working : t.status[status]}
          </Badge>
        </div>
      </header>

      <AnimatePresence mode="popLayout">
        {tip && (
          <motion.div
            key={tip.text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={cn(
              'flex gap-2.5 rounded-xl border p-3 text-sm leading-relaxed',
              tip.tone === 'danger' && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
              tip.tone === 'warn' && 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200',
              tip.tone === 'info' && 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200',
            )}
          >
            {tip.tone === 'danger' ? (
              <Flame size={18} className="mt-0.5 shrink-0" animate loop />
            ) : (
              <TriangleAlert size={18} className="mt-0.5 shrink-0" animateOnHover />
            )}
            <span>{tip.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {data.burnt && (
        <Button
          className="w-full"
          onClick={() => {
            updatePart(node.id, { burnt: false })
            playClick()
          }}
        >
          {t.inspector.repair}
        </Button>
      )}

      <Section title={t.inspector.readings}>
        <div className="grid grid-cols-3 gap-2">
          <Reading label={t.inspector.voltage} value={Math.abs(result?.voltage ?? 0)} unit={t.units.volt} decimals={2} />
          <CurrentReading label={t.inspector.current} amps={result?.current ?? 0} />
          <Reading label={t.inspector.power} value={Math.abs(result?.power ?? 0)} unit={t.units.watt} decimals={2} />
        </div>
        {showLevel && (
          <div className="flex items-center gap-2 rounded-xl border p-2.5">
            <span className="text-xs text-muted-foreground">
              {data.type === 'motor' ? t.inspector.speed : t.inspector.brightness}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" dir="ltr">
              <motion.div
                className="h-full rounded-full"
                style={{ background: accent }}
                animate={{ width: `${Math.min(100, Math.abs(result?.level ?? 0) * (data.type === 'motor' ? 50 : 77))}%` }}
                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              />
            </div>
          </div>
        )}
      </Section>

      {hasSettings && !data.burnt && (
        <Section title={t.inspector.settings}>
          <PartSettings node={node} />
        </Section>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" className="h-auto flex-col gap-1 py-2 text-xs" onClick={() => rotatePart(node.id)}>
          <RotateCcw size={16} animateOnHover className="-scale-x-100" />
          {t.inspector.rotate}
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-1 py-2 text-xs" onClick={() => duplicatePart(node.id)}>
          <Copy size={16} animateOnHover />
          {t.inspector.duplicate}
        </Button>
        <Button variant="destructive" className="h-auto flex-col gap-1 py-2 text-xs" onClick={() => removePart(node.id)}>
          <Trash2 size={16} animateOnHover />
          {t.inspector.delete}
        </Button>
      </div>

      <Section title={t.inspector.whatItDoes}>
        <p className="rounded-xl bg-muted/60 p-3 text-sm leading-relaxed">{t.parts[data.type].description}</p>
      </Section>
    </div>
  )
}

function WireInspector({ edge }: { edge: WireEdge }) {
  const { t } = useI18n()
  const current = useSimulation((s) => s.result.wires[edge.id] ?? 0)
  const { setWireColor, removeWire } = useCircuit.getState()
  return (
    <div className="space-y-5 p-4">
      <header className="flex items-center gap-3">
        <span
          className="grid size-12 place-items-center rounded-2xl text-white shadow-inner"
          style={{ background: WIRE_COLORS[edge.data?.color ?? 'blue'] }}
        >
          <Unplug size={24} animateOnHover />
        </span>
        <h3 className="text-base font-semibold">{t.inspector.wire}</h3>
      </header>
      <Section title={t.inspector.readings}>
        <CurrentReading label={t.inspector.wireCurrent} amps={current} />
      </Section>
      <Section title={t.inspector.wireColor}>
        <Swatches
          value={edge.data?.color ?? 'blue'}
          colors={WIRE_COLORS}
          labels={t.colors}
          onChange={(color: WireColor) => setWireColor(edge.id, color)}
        />
      </Section>
      <Button variant="destructive" className="w-full gap-2" onClick={() => removeWire(edge.id)}>
        <Trash2 size={16} animateOnHover />
        {t.inspector.deleteWire}
      </Button>
    </div>
  )
}

function EmptyInspector() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Unplug size={28} animate loop />
      </span>
      <h3 className="font-semibold">{t.inspector.empty}</h3>
      <p className="max-w-60 text-sm text-balance text-muted-foreground">{t.inspector.emptyHint}</p>
      <div className="mt-2 w-full space-y-2.5 rounded-xl border bg-card p-3 text-start text-sm">
        <div className="flex items-center gap-2.5">
          <span className="terminal-legend terminal-legend--plus">+</span>
          <span>{t.inspector.plusEnd}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="terminal-legend terminal-legend--minus">−</span>
          <span>{t.inspector.minusEnd}</span>
        </div>
      </div>
    </div>
  )
}

/** Details of whatever is picked on the board: used by the side panel and the phone sheet. */
export function InspectorBody() {
  const part = useSelectedPart()
  const wire = useCircuit(selectSelectedWire)
  const selectedId = part?.id ?? wire?.id ?? null
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={selectedId ?? 'empty'}
        initial={{ opacity: 0, x: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
        transition={{ duration: 0.18 }}
      >
        {part ? <PartInspector node={part} /> : wire ? <WireInspector edge={wire} /> : <EmptyInspector />}
      </motion.div>
    </AnimatePresence>
  )
}

export function InspectorPanel() {
  const { t } = useI18n()
  const part = useSelectedPart()
  const wire = useCircuit(selectSelectedWire)
  const completed = useSettings((s) => s.completed.length)
  const [tab, setTab] = useState('inspector')
  const selectedId = part?.id ?? wire?.id ?? null

  // selecting something on the board brings the inspector to the front
  const [lastSelected, setLastSelected] = useState(selectedId)
  if (selectedId !== lastSelected) {
    setLastSelected(selectedId)
    if (selectedId) setTab('inspector')
  }

  return (
    <aside className="relative z-10 flex w-80 shrink-0 flex-col border-s bg-sidebar max-lg:hidden xl:w-[22rem]">
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="px-3 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="inspector">{t.inspector.tab}</TabsTrigger>
            <TabsTrigger value="missions" className="gap-1.5">
              {t.inspector.missionsTab}
              <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary tabular-nums">
                {completed}/{MISSION_IDS.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inspector" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <InspectorBody />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="missions" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <Missions />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
