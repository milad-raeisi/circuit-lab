import { Cable, Info, PackageOpen, Trophy } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MISSION_IDS } from '@/circuit/missions'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { selectSelectedWire, useCircuit, useSelectedPart } from '@/store/circuit'
import { useSettings } from '@/store/settings'
import { InspectorBody } from './Inspector'
import { Missions } from './Missions'
import { PartArt } from './PartArt'
import { PartTray } from './PartsSidebar'

type Panel = 'parts' | 'missions' | 'details'

function DockButton({
  label,
  icon,
  badge,
  active,
  className,
  onClick,
}: {
  label: string
  icon: ReactNode
  badge?: string
  active?: boolean
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition',
        'active:scale-[0.97] active:bg-muted',
        active && 'text-primary',
        className,
      )}
    >
      <span className="relative grid h-6 place-items-center [&_svg]:size-5">
        {icon}
        {badge && (
          <span className="absolute -end-4 -top-1 rounded-full bg-primary px-1 text-[9px] leading-[14px] font-semibold text-primary-foreground tabular-nums">
            {badge}
          </span>
        )}
      </span>
      <span className="max-w-full truncate">{label}</span>
    </button>
  )
}

/**
 * Phones and tablets have no room for side panels, so the parts box, the
 * missions and the details of the picked part live in bottom sheets opened
 * from this bar, right under the thumb.
 */
export function MobileDock() {
  const { t } = useI18n()
  const part = useSelectedPart()
  const wire = useCircuit(selectSelectedWire)
  const done = useSettings((s) => s.completed.length)
  const [open, setOpen] = useState(false)
  // kept after closing so the sheet does not go blank while it slides away
  const [panel, setPanel] = useState<Panel>('parts')

  const show = (next: Panel) => {
    setPanel(next)
    setOpen(true)
  }

  const picked = part ? t.parts[part.data.type].name : wire ? t.inspector.wire : null

  const title = { parts: t.sidebar.title, missions: t.missions.title, details: picked ?? t.inspector.tab }[panel]
  const description = {
    parts: t.sidebar.tapToAdd,
    missions: t.missions.progress(done, MISSION_IDS.length),
    details: t.inspector.emptyHint,
  }[panel]

  return (
    <>
      <nav className="pb-safe relative z-20 grid shrink-0 grid-cols-3 gap-1 border-t bg-background px-2 pt-1 md:grid-cols-2 lg:hidden">
        <DockButton
          className="md:hidden"
          label={t.sidebar.title}
          icon={<PackageOpen />}
          onClick={() => show('parts')}
        />
        <DockButton
          label={t.missions.title}
          icon={<Trophy />}
          badge={`${done}/${MISSION_IDS.length}`}
          onClick={() => show('missions')}
        />
        <DockButton
          label={picked ?? t.inspector.tab}
          active={!!picked}
          icon={part ? <PartArt partType={part.data.type} size={24} /> : wire ? <Cable /> : <Info />}
          onClick={() => show('details')}
        />
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 rounded-t-3xl p-0"
          // focusing the search box would pop the phone keyboard up over the parts
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
          <SheetHeader className={cn('px-5 pt-2 pb-1', panel !== 'parts' && 'sr-only')}>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="pb-safe min-h-0 overflow-y-auto overscroll-contain">
            {panel === 'parts' && (
              <div className="px-4 pt-2">
                <PartTray mode="tap" onPicked={() => setOpen(false)} />
              </div>
            )}
            {panel === 'missions' && <Missions />}
            {panel === 'details' && <InspectorBody />}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
