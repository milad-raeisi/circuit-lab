import { LayoutGrid } from 'lucide-react'
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { BookOpen } from '@/components/animate-ui/icons/book-open'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import {
  PRESET_CATEGORIES,
  PRESET_INFO,
  PRESET_ORDER,
  type PresetCategory,
  type PresetId,
  type PresetLevel,
} from '@/circuit/presets'
import type { LedColor, PartType } from '@/circuit/types'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { PartArt } from './PartArt'

/*
 * The examples gallery: every ready-made project on shelves, each a card
 * with a little picture of its main parts, its name, one line about it and
 * how hard it is. A dialog on wide screens, a bottom sheet on phones.
 */

type Shelf = 'all' | PresetCategory

/** Each shelf's colour and the part drawn on its tab: the accents the parts themselves use. */
const SHELVES: Record<PresetCategory, { accent: string; art: PartType }> = {
  first: { accent: '#f59e0b', art: 'lamp' },
  electronics: { accent: '#65a30d', art: 'transistor' },
  boards: { accent: '#0e9aa7', art: 'arduino' },
  smart: { accent: '#9333ea', art: 'pir' },
  screens: { accent: '#db2777', art: 'segment' },
}

/** The LED drawing is red; these filters turn it into the other colours. */
const LED_TINTS: Partial<Record<LedColor, string>> = {
  yellow: 'hue-rotate(62deg) saturate(1.5) brightness(1.3)',
  green: 'hue-rotate(115deg) saturate(0.9)',
  blue: 'hue-rotate(215deg) saturate(1.1)',
  white: 'saturate(0) brightness(1.5)',
}

const LEVEL_BARS: Record<PresetLevel, string> = { 1: 'bg-emerald-500', 2: 'bg-amber-500', 3: 'bg-rose-500' }

const accentStyle = (category: PresetCategory) => ({ '--shelf': SHELVES[category].accent }) as CSSProperties

function useWideScreen() {
  const query = '(min-width: 768px)'
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => true,
  )
}

/** Three little bars, like a signal meter: one for easy, three for hard. */
function LevelMark({ level }: { level: PresetLevel }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] leading-none font-medium text-muted-foreground">
      <span aria-hidden className="flex h-2.5 items-end gap-[2px]">
        {([1, 2, 3] as const).map((bar) => (
          <span
            key={bar}
            className={cn('w-[3px] rounded-[1px]', bar <= level ? LEVEL_BARS[level] : 'bg-foreground/15')}
            style={{ height: 3 + bar * 2.5 }}
          />
        ))}
      </span>
      {t.gallery.levels[level]}
    </span>
  )
}

/**
 * The example's picture: its main parts side by side on a strip of
 * breadboard, joined by short wires (red leaves the first part, the dark one
 * comes back from the last). Pictures read left to right in every language.
 */
function Thumb({ id }: { id: PresetId }) {
  const { art } = PRESET_INFO[id]
  const count = art.length
  const size = count === 2 ? 50 : count === 3 ? 44 : 38
  const center = (i: number) => ((i + 0.5) / count) * 100
  const gaps = count - 1
  const wire = (i: number) =>
    gaps === 1 || i === 0 ? 'stroke-red-500' : i === gaps - 1 ? 'stroke-zinc-700 dark:stroke-zinc-400' : 'stroke-yellow-400'
  return (
    <div className="example-thumb" dir="ltr" aria-hidden>
      <div className="absolute inset-x-2 inset-y-0">
        <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: gaps }, (_, i) => (
            <path
              key={i}
              d={`M${center(i)} 60 C${center(i) + 6} 84 ${center(i + 1) - 6} 84 ${center(i + 1)} 60`}
              className={cn('fill-none', wire(i))}
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* two parts: the black wire runs back under the red one */}
          {gaps === 1 && (
            <path
              d={`M${center(0)} 66 C${center(0) + 8} 96 ${center(1) - 8} 96 ${center(1)} 66`}
              className="fill-none stroke-zinc-700 dark:stroke-zinc-400"
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        <div className="relative grid h-full items-center" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {art.map((item, i) => (
            <span key={i} className="grid place-items-center" style={{ '--art': `${size}px` } as CSSProperties}>
              <PartArt
                partType={item.startsWith('led:') ? 'led' : (item as PartType)}
                size={size}
                style={{ filter: LED_TINTS[item.slice(4) as LedColor] }}
                className="size-(--art) transition-transform duration-300 ease-out group-hover:-translate-y-1 max-sm:size-[calc(var(--art)*0.86)]"
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExampleCard({ id, onPick }: { id: PresetId; onPick: (id: PresetId) => void }) {
  const { t } = useI18n()
  const { category, level } = PRESET_INFO[id]
  return (
    <button type="button" className="example-card group" style={accentStyle(category)} onClick={() => onPick(id)}>
      <Thumb id={id} />
      <span className="flex min-w-0 flex-1 flex-col gap-1 px-3 pt-2.5 pb-3 max-sm:px-2.5 max-sm:pt-2 max-sm:pb-2.5">
        <span className="text-[13.5px] leading-snug font-semibold text-foreground max-sm:text-[13px]">{t.presets[id].name}</span>
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t.presets[id].description}</span>
        <span className="mt-auto pt-1.5">
          <LevelMark level={level} />
        </span>
      </span>
    </button>
  )
}

const shelfIds = (shelf: PresetCategory) => PRESET_ORDER.filter((id) => PRESET_INFO[id].category === shelf)

function ShelfSection({ shelf, onPick }: { shelf: PresetCategory; onPick: (id: PresetId) => void }) {
  const { t } = useI18n()
  const ids = shelfIds(shelf)
  return (
    <section aria-labelledby={`shelf-${shelf}`} className="space-y-3">
      <header className="flex items-start gap-2.5">
        <span aria-hidden className="mt-1 h-3.5 w-1 shrink-0 rounded-[1px]" style={{ background: SHELVES[shelf].accent }} />
        <div className="min-w-0">
          <h3 id={`shelf-${shelf}`} className="text-sm font-semibold">
            {t.gallery.categories[shelf].name}
            <span className="ms-2 text-xs font-normal text-muted-foreground tabular-nums">{ids.length}</span>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.gallery.categories[shelf].blurb}</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {ids.map((id) => (
          <ExampleCard key={id} id={id} onPick={onPick} />
        ))}
      </div>
    </section>
  )
}

/** A shelf's tab: the part drawn on it, its name and how many examples it holds. */
function ShelfIcon({ shelf }: { shelf: Shelf }) {
  return shelf === 'all' ? (
    <LayoutGrid className="size-4 text-muted-foreground" />
  ) : (
    <PartArt partType={SHELVES[shelf].art} size={24} />
  )
}

function ShelfTabs({ shelf, onShelf, compact }: { shelf: Shelf; onShelf: (shelf: Shelf) => void; compact: boolean }) {
  const { t } = useI18n()
  const shelves: Shelf[] = ['all', ...PRESET_CATEGORIES]
  return (
    <nav
      aria-label={t.gallery.shelves}
      className={compact ? 'grid grid-cols-3 gap-1.5' : 'flex flex-col gap-0.5'}
    >
      {shelves.map((s) => {
        const name = s === 'all' ? t.gallery.all : compact ? t.gallery.categories[s].short : t.gallery.categories[s].name
        const count = s === 'all' ? PRESET_ORDER.length : shelfIds(s).length
        return (
          <button
            key={s}
            type="button"
            aria-pressed={shelf === s}
            onClick={() => onShelf(s)}
            style={s === 'all' ? undefined : accentStyle(s)}
            className={cn('shelf-tab', compact ? 'shelf-tab--chip' : 'shelf-tab--rail')}
          >
            <span aria-hidden className="shelf-tab__icon">
              <ShelfIcon shelf={s} />
            </span>
            <span className="min-w-0 flex-1 truncate">{name}</span>
            {!compact && <span className="text-xs text-muted-foreground tabular-nums">{count}</span>}
          </button>
        )
      })}
    </nav>
  )
}

function GalleryBody({
  compact,
  onPick,
  Title,
  Description,
}: {
  compact: boolean
  onPick: (id: PresetId) => void
  Title: ComponentType<{ className?: string; children: ReactNode }>
  Description: ComponentType<{ className?: string; children: ReactNode }>
}) {
  const { t } = useI18n()
  const [shelf, setShelf] = useState<Shelf>('all')
  const list = useRef<HTMLDivElement>(null)
  // a new shelf starts at its top (scrollTo may return a promise, so nothing is returned)
  useEffect(() => {
    list.current?.scrollTo({ top: 0 })
  }, [shelf])
  const shown = shelf === 'all' ? PRESET_CATEGORIES : [shelf]

  const heading = (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <BookOpen size={18} />
      </span>
      <div className="min-w-0">
        <Title className="text-base leading-tight font-semibold">{t.gallery.title}</Title>
        <Description className="mt-0.5 text-xs leading-snug text-pretty">{t.gallery.description(PRESET_ORDER.length)}</Description>
      </div>
    </div>
  )

  const sections = (
    <div ref={list} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className={cn('space-y-7', compact ? 'px-4 pt-3 pb-6' : 'p-5')}>
        {shown.map((s) => (
          <ShelfSection key={s} shelf={s} onPick={onPick} />
        ))}
      </div>
    </div>
  )

  if (compact) {
    return (
      <>
        <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
        <div className="space-y-3 border-b px-4 pt-2 pb-3 pe-12">{heading}</div>
        <div className="border-b px-4 py-2.5">
          <ShelfTabs shelf={shelf} onShelf={setShelf} compact />
        </div>
        <div className="pb-safe flex min-h-0 flex-1 flex-col">{sections}</div>
      </>
    )
  }

  return (
    <>
      <div className="border-b px-5 py-3.5 pe-14">{heading}</div>
      <div className="flex min-h-0 flex-1">
        <div className="w-56 shrink-0 overflow-y-auto border-e bg-sidebar p-2.5">
          <ShelfTabs shelf={shelf} onShelf={setShelf} compact={false} />
        </div>
        {sections}
      </div>
    </>
  )
}

/**
 * Opening the gallery focuses the panel itself, not its first tab: no focus
 * ring flashes up on a mouse click, and Tab still walks in from the top.
 */
function focusPanel(event: Event) {
  event.preventDefault()
  ;(event.currentTarget as HTMLElement | null)?.focus({ preventScroll: true })
}

/**
 * The "Examples" button and the gallery it opens. Picking an example calls
 * `onPick`; the top bar decides whether to ask before replacing the board.
 */
export function ExamplesGallery({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (id: PresetId) => void
}) {
  const { t } = useI18n()
  const wide = useWideScreen()

  return (
    <>
      <Button
        variant="ghost"
        size="lg"
        className="gap-2 px-2.5 font-medium"
        aria-label={t.toolbar.examples}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
      >
        <BookOpen size={18} animateOnHover />
        <span className="max-sm:hidden">{t.toolbar.examples}</span>
      </Button>

      {wide ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            className="flex h-[min(44rem,calc(100dvh-3rem))] w-[min(60rem,calc(100vw-3rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
            onOpenAutoFocus={focusPanel}
          >
            <GalleryBody compact={false} onPick={onPick} Title={DialogTitle} Description={DialogDescription} />
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="gap-0 rounded-t-xl p-0 outline-none data-[side=bottom]:h-[88dvh]" onOpenAutoFocus={focusPanel}>
            <GalleryBody compact onPick={onPick} Title={SheetTitle} Description={SheetDescription} />
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
