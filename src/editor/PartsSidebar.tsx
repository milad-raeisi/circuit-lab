import { Highlight, HighlightItem } from '@animate-ui/react/primitives/effects/highlight'
import { useMemo, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CircuitBoard } from '@/components/animate-ui/icons/circuit-board'
import { PARTS, PART_ORDER, type PartCategory } from '@/circuit/catalog'
import type { PartType } from '@/circuit/types'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { useDrag } from '@/store/drag'
import { usePlacePart } from './DragGhost'
import { PartIcon } from './PartIcon'

const CATEGORIES: PartCategory[] = ['power', 'control', 'output']

function PaletteItem({ type }: { type: PartType }) {
  const { t } = useI18n()
  const startDrag = useDrag((s) => s.start)
  const dragging = useDrag((s) => s.type === type)
  const { placeCenter } = usePlacePart()
  const [hover, setHover] = useState(false)
  const accent = PARTS[type].accent

  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-grab touch-none items-center gap-3 rounded-xl p-2 text-start select-none active:cursor-grabbing',
        'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        dragging && 'opacity-50',
      )}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault()
        startDrag(type, e.clientX, e.clientY)
      }}
      // keyboard activation (Enter / Space) has no pointer, so it lands in the middle of the board
      onClick={(e) => e.detail === 0 && placeCenter(type)}
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-105"
        style={{ background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent }}
      >
        <PartIcon partType={type} size={22} animate={hover} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{t.parts[type].name}</span>
        <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {t.parts[type].description}
        </span>
      </span>
    </button>
  )
}

export function PartsSidebar() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
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

  return (
    <aside className="relative z-10 flex w-72 shrink-0 flex-col border-e bg-sidebar max-md:hidden">
      <div className="space-y-3 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <CircuitBoard size={20} animateOnHover />
          </span>
          <div>
            <h2 className="text-sm font-bold">{t.sidebar.title}</h2>
            <p className="text-xs text-muted-foreground">
              {t.sidebar.hint} · {t.sidebar.tapToAdd}
            </p>
          </div>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.sidebar.search}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <Highlight controlledItems hover exitDelay={120} className="rounded-xl bg-accent dark:bg-accent/70">
          <div className="space-y-4 px-2 pb-4">
            {groups.map(({ category, items }) => (
              <section key={category} className="space-y-1">
                <h3 className="px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {t.categories[category]}
                </h3>
                {items.map((type) => (
                  <HighlightItem key={type} value={type}>
                    <div>
                      <PaletteItem type={type} />
                    </div>
                  </HighlightItem>
                ))}
              </section>
            ))}
            {groups.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">{t.sidebar.noResults}</p>
            )}
          </div>
        </Highlight>
      </ScrollArea>
    </aside>
  )
}
