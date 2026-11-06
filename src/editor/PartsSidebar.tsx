import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PARTS, PART_ORDER, type PartCategory } from '@/circuit/catalog'
import type { PartType } from '@/circuit/types'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useDrag } from '@/store/drag'
import { usePlacePart } from './DragGhost'
import { PartArt } from './PartArt'

const CATEGORIES: PartCategory[] = ['power', 'control', 'output']

const tileClass = cn(
  'group relative flex w-full flex-col items-center gap-1 rounded-xl border border-transparent bg-muted/60 px-1.5 pt-2.5 pb-2 text-center select-none',
  'transition-[background-color,border-color,box-shadow] duration-200',
  'hover:border-border hover:bg-card hover:shadow-[var(--shadow-card)]',
  'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
)

/** A part in the desktop tray: drag it onto the board, or press it to drop it in the middle. */
function DragTile({ type }: { type: PartType }) {
  const { t, dir } = useI18n()
  const startDrag = useDrag((s) => s.start)
  const dragging = useDrag((s) => s.type === type)
  const { placeCenter } = usePlacePart()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(tileClass, 'cursor-grab touch-none active:cursor-grabbing', dragging && 'opacity-40')}
          onPointerDown={(e) => {
            if (e.button !== 0) return
            e.preventDefault()
            startDrag(type, e.clientX, e.clientY)
          }}
          // keyboard activation (Enter / Space) has no pointer, so it lands in the middle of the board
          onClick={(e) => e.detail === 0 && placeCenter(type)}
        >
          <PartArt
            partType={type}
            size={46}
            className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-105"
          />
          <span className="w-full truncate text-[12.5px] leading-tight font-semibold">{t.parts[type].name}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={dir === 'rtl' ? 'left' : 'right'} className="max-w-56 leading-snug">
        {t.parts[type].description}
      </TooltipContent>
    </Tooltip>
  )
}

/** A part in the phone tray: tap it to add it to the board. */
function TapTile({ type, onPicked }: { type: PartType; onPicked: () => void }) {
  const { t } = useI18n()
  const { placeCenter } = usePlacePart()
  return (
    <button
      type="button"
      className={cn(tileClass, 'min-h-24 active:scale-[0.97]')}
      onClick={() => {
        placeCenter(type)
        onPicked()
      }}
    >
      <PartArt partType={type} size={48} />
      <span className="w-full truncate text-[13px] leading-tight font-semibold">{t.parts[type].name}</span>
    </button>
  )
}

function usePartGroups(query: string) {
  const { t } = useI18n()
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = PART_ORDER.filter((type) => {
      if (!q) return true
      const text = `${t.parts[type].name} ${t.parts[type].description} ${type}`.toLowerCase()
      return text.includes(q)
    })
    return CATEGORIES.map((category) => ({
      category,
      items: matches.filter((type) => PARTS[type].category === category),
    })).filter((g) => g.items.length > 0)
  }, [query, t])
}

/** A clear, filled search field. On desktop "/" jumps into it and Escape clears it. */
function PartSearch({ value, onChange, shortcut }: { value: string; onChange: (v: string) => void; shortcut: boolean }) {
  const { t } = useI18n()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut])

  return (
    <div className="group relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
      />
      <input
        ref={input}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('')
            e.currentTarget.blur()
          }
        }}
        placeholder={t.sidebar.search}
        aria-label={t.sidebar.search}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'h-10 w-full rounded-xl border border-border bg-muted ps-9 pe-10 text-sm text-foreground outline-none',
          'shadow-[inset_0_1px_2px_oklch(0_0_0/0.05)] transition-[background-color,border-color,box-shadow]',
          'placeholder:text-muted-foreground hover:border-foreground/20',
          'focus-visible:border-primary focus-visible:bg-card focus-visible:shadow-none focus-visible:ring-4 focus-visible:ring-primary/15',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label={t.confirm.clear}
          onClick={() => {
            onChange('')
            input.current?.focus()
          }}
          className="absolute end-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        shortcut && (
          <kbd
            aria-hidden
            className="pointer-events-none absolute end-2.5 top-1/2 grid h-5 min-w-5 -translate-y-1/2 place-items-center rounded-md border bg-card px-1 font-sans text-[11px] text-muted-foreground shadow-[0_1px_0_var(--border)] group-focus-within:hidden"
          >
            /
          </kbd>
        )
      )}
    </div>
  )
}

/** Every part, grouped like the drawers of a parts tray. */
export function PartTray({ mode, onPicked }: { mode: 'drag' | 'tap'; onPicked?: () => void }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const groups = usePartGroups(query)

  return (
    <div className="space-y-4">
      <PartSearch value={query} onChange={setQuery} shortcut={mode === 'drag'} />
      {groups.map(({ category, items }) => (
        <section key={category} className="space-y-2">
          <h3 className="px-0.5 text-xs font-semibold text-muted-foreground">{t.categories[category]}</h3>
          <div className={cn('grid gap-2', mode === 'drag' ? 'grid-cols-2' : 'grid-cols-3')}>
            {items.map((type) =>
              mode === 'drag' ? (
                <DragTile key={type} type={type} />
              ) : (
                <TapTile key={type} type={type} onPicked={() => onPicked?.()} />
              ),
            )}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t.sidebar.noResults}</p>}
    </div>
  )
}

export function PartsSidebar() {
  const { t } = useI18n()
  return (
    <aside className="relative z-10 flex w-64 shrink-0 flex-col border-e bg-sidebar max-md:hidden">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold">{t.sidebar.title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.sidebar.hint}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-4 pb-5">
          <PartTray mode="drag" />
        </div>
      </ScrollArea>
    </aside>
  )
}
