import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Flame,
  Gauge,
  Glasses,
  PlugZap,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unplug,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useI18n, type Lang } from '@/i18n'
import { arToolbox } from '@/i18n/toolbox/ar'
import { enToolbox } from '@/i18n/toolbox/en'
import { faToolbox } from '@/i18n/toolbox/fa'
import type { ToolboxBook } from '@/i18n/toolbox/types'
import { cn } from '@/lib/utils'
import { CATEGORY_COLOR, TOOL_CATEGORIES, TOOL_IDS, TOOLS, toolsIn, type ToolCategory, type ToolId } from './catalog'
import { useToolbox } from './store'
import { ToolArt, ToolboxMark } from './ToolArt'

/*
 * The Toolbox: an illustrated guide to the real tools of an electronics
 * workshop. The drawers list every tool; picking one opens its page with what
 * it is for, how to use it, the one safety rule to remember and a fun fact.
 * A dialog on wide screens, a bottom sheet on phones.
 */

const BOOKS: Record<Lang, ToolboxBook> = { en: enToolbox, fa: faToolbox, ar: arToolbox }

const CATEGORY_ICON: Record<ToolCategory, LucideIcon> = {
  measure: Gauge,
  build: CircuitBoard,
  cut: Scissors,
  power: PlugZap,
  fix: Wrench,
  safe: ShieldCheck,
}

const RULE_ICONS: LucideIcon[] = [Users, Unplug, Glasses]

const WIDE = '(min-width: 768px)'

function useWide() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(WIDE)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  )
}

function useBook() {
  const { lang, dir } = useI18n()
  // Persian counts in its own digits; Arabic in this app uses 0–9
  const num = (n: number) => (lang === 'fa' ? n.toLocaleString('fa-IR') : String(n))
  return { book: BOOKS[lang], dir, num }
}

/** The pegboard behind every tool: the board's hole pattern, lit in the drawer's colour. */
const stage = (color: string): CSSProperties => ({
  background: `radial-gradient(110% 85% at 50% 0%, color-mix(in oklch, ${color} 15%, transparent), transparent 72%) no-repeat, radial-gradient(circle, var(--stage-hole) 0 1px, transparent 1.5px) 5px 5px / 10px 10px, var(--stage-bg)`,
  boxShadow: 'inset 0 0 0 1px var(--stage-line), inset 0 2px 4px oklch(0 0 0 / 0.05)',
})

/** Ink for text in a drawer's colour that stays readable in light and dark. */
// mixed in oklab: oklch would swing orange through pink on its way to the navy text colour
const ink = (color: string) => `color-mix(in oklab, ${color} 62%, var(--foreground))`

// where the drawers were scrolled to, so "All tools" brings the child back to the same spot
let drawerScroll = 0

/* ───────────────────────── header ───────────────────────── */

function Explored() {
  const { book } = useBook()
  const seen = useToolbox((s) => s.seen.length)
  const total = TOOL_IDS.length
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-foreground/10 sm:w-14" aria-hidden>
        <span
          className="block h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${(seen / total) * 100}%` }}
        />
      </span>
      <span className="tabular-nums max-sm:hidden">{book.explored(seen, total)}</span>
      <span className="tabular-nums sm:hidden" aria-hidden>
        {book.labels.position(seen, total)}
      </span>
      <span className="sr-only sm:hidden">{book.explored(seen, total)}</span>
    </div>
  )
}

function CloseButton() {
  const { book } = useBook()
  return (
    <DialogClose asChild>
      <Button variant="ghost" size="icon-lg" aria-label={book.labels.close} className="shrink-0">
        <X className="size-5" />
      </Button>
    </DialogClose>
  )
}

function Header() {
  const { book } = useBook()
  const tool = useToolbox((s) => s.tool)
  const pick = useToolbox((s) => s.pick)
  const index = tool ? TOOL_IDS.indexOf(tool) : -1
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-3">
      {tool ? (
        <>
          <Button variant="ghost" size="lg" className="min-w-0 gap-1 px-2 font-semibold" onClick={() => pick(null)}>
            <ChevronLeft className="size-5 rtl:-scale-x-100" />
            <span className="truncate">{book.labels.back}</span>
          </Button>
          <DialogTitle className="sr-only">{book.title}</DialogTitle>
          <DialogDescription className="sr-only">{book.intro}</DialogDescription>
          <span className="ms-auto shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
            {book.labels.position(index + 1, TOOL_IDS.length)}
          </span>
        </>
      ) : (
        <>
          <ToolboxMark size={34} className="ms-1" />
          <DialogTitle className="min-w-0 truncate text-base font-semibold">{book.title}</DialogTitle>
          <div className="ms-auto" />
          <Explored />
        </>
      )}
      <CloseButton />
    </header>
  )
}

/* ───────────────────────── the drawers ───────────────────────── */

function Badge({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  return (
    <span title={label} className={cn('grid size-5 place-items-center rounded-full shadow-sm [&_svg]:size-3', className)}>
      {children}
      <span className="sr-only">{label}</span>
    </span>
  )
}

function ToolCard({ id }: { id: ToolId }) {
  const { book } = useBook()
  const pick = useToolbox((s) => s.pick)
  const seen = useToolbox((s) => s.seen.includes(id))
  const info = TOOLS[id]
  const color = CATEGORY_COLOR[info.category]
  const page = book.tools[id]
  return (
    <button
      type="button"
      data-tool={id}
      onClick={() => pick(id)}
      style={{ '--tool-accent': color } as CSSProperties}
      className={cn(
        'group relative flex min-w-0 flex-col gap-2 rounded-[10px] border bg-card p-1.5 pb-2.5 text-start shadow-[var(--shadow-card)]',
        'transition-[translate,box-shadow,border-color] duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--tool-accent)_45%,var(--border))] hover:shadow-[var(--shadow-float)]',
        'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-0',
      )}
    >
      <span className="relative grid h-20 place-items-center overflow-hidden rounded-md sm:h-24" style={stage(color)}>
        <ToolArt
          tool={id}
          size={62}
          className="transition-transform duration-200 ease-out group-hover:scale-[1.07] sm:size-[80px]"
        />
        {seen && (
          <span className="absolute start-1.5 top-1.5">
            <Badge className="bg-emerald-500 text-white" label={book.labels.seen}>
              <Check strokeWidth={3} />
            </Badge>
          </span>
        )}
        {(info.hot || info.grownUp) && (
          <span className="absolute end-1.5 top-1.5 flex gap-1">
            {info.hot && (
              <Badge className="bg-orange-500 text-white" label={book.labels.hot}>
                <Flame strokeWidth={2.5} />
              </Badge>
            )}
            {info.grownUp && (
              <Badge className="bg-card text-foreground ring-1 ring-border" label={book.labels.grownUp}>
                <Users strokeWidth={2.5} />
              </Badge>
            )}
          </span>
        )}
      </span>
      <span className="min-w-0 space-y-0.5 px-1">
        <span className="line-clamp-2 block text-[13px] leading-tight font-semibold">{page.name}</span>
        <span className="line-clamp-2 block text-[11.5px] leading-snug text-muted-foreground max-sm:hidden">{page.short}</span>
      </span>
    </button>
  )
}

function Rules() {
  const { book } = useBook()
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)]">
      {/* hazard tape, like the edge of a real workbench */}
      <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(135deg,#facc15_0_7px,#27272a_7px_14px)]" />
      <div className="space-y-2.5 p-3">
        <h3 className="text-xs font-semibold text-muted-foreground">{book.rules.title}</h3>
        <ul className="grid gap-2 sm:grid-cols-3">
          {book.rules.items.map((rule, i) => {
            const Icon = RULE_ICONS[i]
            return (
              <li key={rule} className="flex items-start gap-2.5 text-[13px] leading-snug">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 pt-0.5 text-pretty">{rule}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function DrawerHeading({ category }: { category: ToolCategory }) {
  const { book, num } = useBook()
  const Icon = CATEGORY_ICON[category]
  const color = CATEGORY_COLOR[category]
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4"
        style={{ background: `color-mix(in oklch, ${color} 16%, transparent)`, color: ink(color) }}
      >
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-baseline gap-2 text-sm font-semibold">
          <span className="min-w-0">{book.categories[category].name}</span>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{num(toolsIn(category).length)}</span>
        </h3>
        <p className="text-xs leading-relaxed text-pretty text-muted-foreground">{book.categories[category].blurb}</p>
      </div>
    </div>
  )
}

/** Every tool, drawer by drawer. On wide screens a rail on the side jumps between drawers. */
function Drawers() {
  const { book, num } = useBook()
  const returnTo = useToolbox((s) => s.returnTo)
  const wide = useWide()
  const reduce = useReducedMotion()
  const pane = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<ToolCategory>('measure')

  // back from a tool page: the same scroll spot, with the tool's card focused
  useLayoutEffect(() => {
    const el = pane.current
    if (!el) return
    el.scrollTop = drawerScroll
    if (returnTo) el.querySelector<HTMLElement>(`[data-tool="${returnTo}"]`)?.focus({ preventScroll: true })
  }, [returnTo])

  const onScroll = () => {
    const el = pane.current
    if (!el) return
    drawerScroll = el.scrollTop
    if (!wide) return
    const sections = [...el.querySelectorAll<HTMLElement>('[data-drawer]')]
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    const current = atEnd
      ? sections.at(-1)
      : sections.filter((s) => s.offsetTop - el.scrollTop <= 48).at(-1) ?? sections[0]
    const next = current?.dataset.drawer as ToolCategory | undefined
    if (next && next !== active) setActive(next)
  }

  const jump = (category: ToolCategory) => {
    const el = pane.current
    const section = el?.querySelector<HTMLElement>(`[data-drawer="${category}"]`)
    if (!el || !section) return
    el.scrollTo({ top: section.offsetTop - 16, behavior: reduce ? 'auto' : 'smooth' })
    setActive(category)
  }

  return (
    <div className="flex min-h-0 flex-1">
      {wide && (
        <nav className="flex w-52 shrink-0 flex-col gap-0.5 overflow-y-auto border-e bg-muted/30 p-2.5 lg:w-56">
          {TOOL_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICON[category]
            const color = CATEGORY_COLOR[category]
            const on = category === active
            return (
              <button
                key={category}
                type="button"
                onClick={() => jump(category)}
                aria-current={on ? 'true' : undefined}
                className={cn(
                  'flex min-w-0 items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-start text-sm font-medium transition-colors',
                  'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                  on && 'border-border bg-card shadow-[var(--shadow-card)] hover:bg-card',
                )}
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md [&_svg]:size-4"
                  style={{ background: `color-mix(in oklch, ${color} 16%, transparent)`, color: ink(color) }}
                >
                  <Icon />
                </span>
                <span className="min-w-0 flex-1 truncate">{book.categories[category].name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{num(toolsIn(category).length)}</span>
              </button>
            )
          })}
        </nav>
      )}
      <div ref={pane} onScroll={onScroll} className="relative min-w-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="space-y-6 p-3 pb-6 sm:p-5 sm:pb-8">
          <DialogDescription className="text-sm leading-relaxed text-pretty">{book.intro}</DialogDescription>
          <Rules />
          {TOOL_CATEGORIES.map((category) => (
            <section key={category} data-drawer={category} className="space-y-3">
              <DrawerHeading category={category} />
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
                {toolsIn(category).map((id) => (
                  <ToolCard key={id} id={id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── a tool's page ───────────────────────── */

function Heading({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-semibold text-muted-foreground">{children}</h3>
}

function Flag({ className, icon, children }: { className: string; icon: ReactNode; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold [&_svg]:size-3.5', className)}>
      {icon}
      {children}
    </span>
  )
}

function Callout({
  tone,
  icon,
  title,
  children,
}: {
  tone: 'safe' | 'fact'
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-3.5',
        tone === 'safe' && 'border-red-500/35 bg-red-500/[0.07] dark:bg-red-500/10',
        tone === 'fact' && 'border-violet-500/25 bg-violet-500/[0.07] dark:bg-violet-500/10',
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-lg text-white shadow-sm [&_svg]:size-[18px]',
          tone === 'safe' ? 'bg-red-500' : 'bg-violet-500',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 space-y-0.5">
        <p
          className={cn(
            'text-xs font-bold',
            tone === 'safe' ? 'text-red-700 dark:text-red-300' : 'text-violet-700 dark:text-violet-300',
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-[14.5px] leading-relaxed text-pretty',
            tone === 'safe' && 'font-medium text-red-950 dark:text-red-50',
          )}
        >
          {children}
        </p>
      </div>
    </div>
  )
}

function Neighbour({ tool, side }: { tool: ToolId; side: 'previous' | 'next' }) {
  const { book } = useBook()
  const pick = useToolbox((s) => s.pick)
  const next = side === 'next'
  return (
    <button
      type="button"
      onClick={() => pick(tool)}
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-lg border bg-card px-2 py-1.5 shadow-[var(--shadow-card)] transition-colors',
        'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px',
        next ? 'flex-row-reverse text-end' : 'text-start',
      )}
    >
      {next ? (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
      ) : (
        <ChevronLeft className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
      )}
      <ToolArt tool={tool} size={32} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[11px] text-muted-foreground">{next ? book.labels.next : book.labels.previous}</span>
        <span className="block truncate text-[13px] font-semibold">{book.tools[tool].name}</span>
      </span>
    </button>
  )
}

function ToolPage({ tool }: { tool: ToolId }) {
  const { book, dir, num } = useBook()
  const step = useToolbox((s) => s.step)
  const wide = useWide()
  const reduce = useReducedMotion()
  const scroller = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const info = TOOLS[tool]
  const page = book.tools[tool]
  const color = CATEGORY_COLOR[info.category]
  const CategoryIcon = CATEGORY_ICON[info.category]
  const index = TOOL_IDS.indexOf(tool)
  const total = TOOL_IDS.length
  const previous = TOOL_IDS[(index - 1 + total) % total]
  const next = TOOL_IDS[(index + 1) % total]

  // a new page starts at the top, and screen readers hear its name
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [tool])

  const shift = reduce ? 0 : step * (dir === 'rtl' ? -14 : 14)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <motion.article
          key={tool}
          initial={reduce ? false : { opacity: 0, x: shift }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-7 md:p-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
        >
          <div className="min-w-0 space-y-4 md:sticky md:top-6 md:self-start">
            <div className="relative grid h-44 place-items-center overflow-hidden rounded-lg md:h-60" style={stage(color)}>
              <ToolArt tool={tool} size={wide ? 184 : 144} />
            </div>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: ink(color) }}>
                <CategoryIcon className="size-3.5" />
                {book.categories[info.category].name}
              </p>
              <h2 ref={heading} tabIndex={-1} className="text-xl leading-tight font-semibold tracking-tight outline-none">
                {page.name}
              </h2>
              <p className="text-sm text-pretty text-muted-foreground">{page.short}</p>
            </div>
            {(info.grownUp || info.hot) && (
              <div className="flex flex-wrap gap-1.5">
                {info.grownUp && (
                  <Flag className="bg-sky-500/12 text-sky-800 dark:text-sky-200" icon={<Users />}>
                    {book.labels.grownUp}
                  </Flag>
                )}
                {info.hot && (
                  <Flag className="bg-orange-500/12 text-orange-800 dark:text-orange-200" icon={<Flame />}>
                    {book.labels.hot}
                  </Flag>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-6">
            <section className="space-y-2">
              <Heading>{book.labels.use}</Heading>
              <p className="text-[15px] leading-relaxed text-pretty">{page.use}</p>
            </section>

            <section className="space-y-3">
              <Heading>{book.labels.steps}</Heading>
              <ol>
                {page.steps.map((text, i) => (
                  <li key={i} className="relative flex gap-3 pb-3.5 last:pb-0">
                    {i < page.steps.length - 1 && (
                      <span aria-hidden className="absolute start-[13px] top-7 bottom-0.5 w-px bg-border" />
                    )}
                    <span
                      className="grid size-[27px] shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums"
                      style={{
                        background: `color-mix(in oklab, ${color} 16%, var(--card))`,
                        color: ink(color),
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${color} 35%, transparent)`,
                      }}
                    >
                      {num(i + 1)}
                    </span>
                    <span className="min-w-0 pt-[3px] text-[14.5px] leading-snug text-pretty">{text}</span>
                  </li>
                ))}
              </ol>
            </section>

            <Callout tone="safe" icon={<ShieldAlert />} title={book.labels.safe}>
              {page.safe}
            </Callout>
            <Callout tone="fact" icon={<Sparkles />} title={book.labels.fact}>
              {page.fact}
            </Callout>
          </div>
        </motion.article>
      </div>

      <nav className="pb-safe grid shrink-0 grid-cols-2 gap-2 border-t bg-background px-2.5 pt-2">
        <Neighbour tool={previous} side="previous" />
        <Neighbour tool={next} side="next" />
      </nav>
    </div>
  )
}

/* ───────────────────────── the box itself ───────────────────────── */

function Body() {
  const tool = useToolbox((s) => s.tool)
  return tool ? <ToolPage tool={tool} /> : <Drawers />
}

/** Arrow keys turn pages; keys never reach the board's shortcuts behind the box. */
function useKeys() {
  const { dir } = useI18n()
  return (e: KeyboardEvent) => {
    // Tab and Escape belong to the dialog itself (focus trap, closing)
    if (e.key === 'Tab' || e.key === 'Escape') return
    e.stopPropagation()
    const { tool, pick } = useToolbox.getState()
    if (!tool || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.altKey || e.metaKey || e.ctrlKey) return
    const forward = (e.key === 'ArrowRight') === (dir === 'ltr')
    const total = TOOL_IDS.length
    const index = TOOL_IDS.indexOf(tool)
    e.preventDefault()
    pick(TOOL_IDS[(index + (forward ? 1 : -1) + total) % total])
  }
}

export default function Toolbox() {
  const open = useToolbox((s) => s.open)
  const setOpen = useToolbox((s) => s.setOpen)
  const wide = useWide()
  const onKeyDown = useKeys()
  // Escape on a tool's page goes back to the drawers first
  const onEscape = (e: globalThis.KeyboardEvent) => {
    const { tool, pick } = useToolbox.getState()
    if (tool) {
      e.preventDefault()
      pick(null)
    }
  }

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          onKeyDown={onKeyDown}
          onEscapeKeyDown={onEscape}
          className="flex h-[min(48rem,calc(100dvh-3rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(64rem,calc(100%-3rem))]"
        >
          <Header />
          <Body />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        onKeyDown={onKeyDown}
        onEscapeKeyDown={onEscape}
        className="gap-0 overflow-hidden rounded-t-xl p-0 data-[side=bottom]:h-[92dvh]"
      >
        <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
        <Header />
        <Body />
      </SheetContent>
    </Sheet>
  )
}
