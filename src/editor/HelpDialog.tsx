import { CircleQuestionMark } from '@/components/animate-ui/icons/circle-question-mark'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'

/**
 * "How to play". It brings its own button in the top bar; on phones the
 * "More" menu opens it instead through `open` / `onOpenChange`.
 */
export function HelpDialog({
  open,
  onOpenChange,
  withTrigger = true,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  withTrigger?: boolean
}) {
  const { t } = useI18n()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {withTrigger && (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-lg" aria-label={t.toolbar.help}>
                <CircleQuestionMark size={18} animateOnHover />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{t.toolbar.help}</TooltipContent>
        </Tooltip>
      )}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{t.help.title}</DialogTitle>
          <DialogDescription className="text-pretty">{t.help.intro}</DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {t.help.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <div className="rounded-xl bg-muted/60 p-3 max-md:hidden">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{t.help.shortcuts}</p>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-sm">
            {t.help.keys.map(([key, label]) => (
              <div key={key} className="contents">
                <dt dir="ltr" className="text-end">
                  <Kbd>{key}</Kbd>
                </dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  )
}
