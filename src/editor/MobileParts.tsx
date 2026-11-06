import { useState } from 'react'
import { CircuitBoard } from '@/components/animate-ui/icons/circuit-board'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { PARTS, PART_ORDER } from '@/circuit/catalog'
import { useI18n } from '@/i18n'
import { usePlacePart } from './DragGhost'
import { PartIcon } from './PartIcon'

/** On narrow screens the parts box lives in a sheet; tapping a part adds it. */
export function MobileParts() {
  const { t, dir } = useI18n()
  const [open, setOpen] = useState(false)
  const { placeCenter } = usePlacePart()
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="lg" className="gap-2 font-semibold md:hidden">
          <CircuitBoard size={17} />
          <span className="max-sm:sr-only">{t.sidebar.title}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-80">
        <SheetHeader>
          <SheetTitle>{t.sidebar.title}</SheetTitle>
          <SheetDescription>{t.sidebar.tapToAdd}</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto px-4 pb-4">
          {PART_ORDER.map((type) => (
            <button
              key={type}
              type="button"
              className="flex flex-col items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition hover:bg-accent"
              onClick={() => {
                placeCenter(type)
                setOpen(false)
              }}
            >
              <span
                className="grid size-11 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklch, ${PARTS[type].accent} 16%, transparent)`, color: PARTS[type].accent }}
              >
                <PartIcon partType={type} size={22} animateOnHover />
              </span>
              {t.parts[type].name}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
