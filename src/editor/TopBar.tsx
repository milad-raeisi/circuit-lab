import { GradientText } from '@animate-ui/react/primitives/texts/gradient'
import { useState, type ReactNode } from 'react'
import { LiquidButton } from '@/components/animate-ui/buttons/liquid'
import { ThemeTogglerButton, ThemeTogglerButtonIcon } from '@/components/animate-ui/buttons/theme-toggler'
import { BookOpen } from '@/components/animate-ui/icons/book-open'
import { Globe } from '@/components/animate-ui/icons/globe'
import { Moon } from '@/components/animate-ui/icons/moon'
import { Pause } from '@/components/animate-ui/icons/pause'
import { Play } from '@/components/animate-ui/icons/play'
import { Sun } from '@/components/animate-ui/icons/sun'
import { Trash2 } from '@/components/animate-ui/icons/trash-2'
import { Undo2 } from '@/components/animate-ui/icons/undo-2'
import { Volume2 } from '@/components/animate-ui/icons/volume-2'
import { VolumeX } from '@/components/animate-ui/icons/volume-x'
import { Zap } from '@/components/animate-ui/icons/zap'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PRESET_ORDER, buildPreset, type PresetId } from '@/circuit/presets'
import { LANGUAGES, useI18n, type Lang } from '@/i18n'
import { unlockAudio } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useCircuit } from '@/store/circuit'
import { useSettings } from '@/store/settings'
import { useSimulation } from '@/store/simulation'
import { HelpDialog } from './HelpDialog'
import { MobileParts } from './MobileParts'

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button variant="ghost" size="icon-lg" aria-label={label} onClick={onClick} disabled={disabled}>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function LanguageMenu() {
  const { t, lang } = useI18n()
  const setLang = useSettings((s) => s.setLang)
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="gap-1.5 px-2 font-bold" aria-label={t.toolbar.language}>
              <Globe size={18} animateOnHover />
              <span className="min-w-5 text-xs">{current.short}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.toolbar.language}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t.toolbar.language}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={lang} onValueChange={(value) => setLang(value as Lang)}>
          {LANGUAGES.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code} className="justify-between">
              <span dir={l.dir}>{l.label}</span>
              <span className="text-xs text-muted-foreground">{l.short}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type Pending = { kind: 'clear' } | { kind: 'preset'; id: PresetId } | null

function RunToggle() {
  const { t } = useI18n()
  const running = useSimulation((s) => s.running)
  const toggle = useSimulation((s) => s.toggleRunning)
  return (
    <LiquidButton
      onClick={toggle}
      aria-pressed={running}
      className={cn(
        'h-9 gap-2 rounded-xl px-3.5 text-sm font-bold',
        running
          ? '[--liquid-button-background-color:var(--color-emerald-500)] [--liquid-button-color:var(--color-emerald-600)] text-white hover:text-white'
          : '[--liquid-button-background-color:var(--muted)] [--liquid-button-color:var(--primary)]',
      )}
    >
      <span className="relative flex size-2.5">
        {running && <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80" />}
        <span className={cn('relative inline-flex size-2.5 rounded-full', running ? 'bg-white' : 'bg-muted-foreground')} />
      </span>
      <span className="max-lg:hidden">{running ? t.toolbar.running : t.toolbar.paused}</span>
      {running ? <Pause size={16} animateOnHover /> : <Play size={16} animateOnHover />}
    </LiquidButton>
  )
}

export function TopBar() {
  const { t } = useI18n()
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)
  const sound = useSettings((s) => s.sound)
  const toggleSound = useSettings((s) => s.toggleSound)
  const canUndo = useCircuit((s) => s.past.length > 0)
  const canRedo = useCircuit((s) => s.future.length > 0)
  const hasParts = useCircuit((s) => s.nodes.length > 0)
  const { undo, redo, load, clear } = useCircuit.getState()
  const [pending, setPending] = useState<Pending>(null)

  const loadPreset = (id: PresetId) => {
    load(buildPreset(id))
  }

  const confirm = () => {
    if (pending?.kind === 'clear') clear()
    if (pending?.kind === 'preset') loadPreset(pending.id)
    setPending(null)
  }

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-1.5 overflow-x-auto border-b bg-background px-3 [scrollbar-width:none] *:shrink-0">
      <div className="flex items-center gap-2.5 pe-2">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-md shadow-orange-500/30">
          <Zap size={20} animateOnHover />
        </span>
        <div className="leading-tight max-sm:hidden">
          <GradientText
            text={t.app.title}
            className="text-base font-extrabold"
            gradient="linear-gradient(90deg, #f59e0b 0%, #ec4899 30%, #6366f1 60%, #f59e0b 100%)"
          />
          <p className="text-[11px] text-muted-foreground">{t.app.subtitle}</p>
        </div>
      </div>

      <Separator orientation="vertical" className="mx-1 !h-6" />
      <MobileParts />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="lg" className="gap-2 font-semibold">
            <BookOpen size={17} animateOnHover />
            <span className="max-sm:hidden">{t.toolbar.examples}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>{t.toolbar.examples}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PRESET_ORDER.map((id) => (
            <DropdownMenuItem
              key={id}
              className="flex-col items-start gap-0.5 py-2"
              onSelect={() => (hasParts ? setPending({ kind: 'preset', id }) : loadPreset(id))}
            >
              <span className="font-semibold">{t.presets[id].name}</span>
              <span className="text-xs text-muted-foreground">{t.presets[id].description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolButton label={t.toolbar.undo} onClick={undo} disabled={!canUndo}>
        <Undo2 size={18} animateOnHover />
      </ToolButton>
      <ToolButton label={t.toolbar.redo} onClick={redo} disabled={!canRedo}>
        <Undo2 size={18} animateOnHover className="-scale-x-100" />
      </ToolButton>
      <ToolButton label={t.toolbar.clear} onClick={() => setPending({ kind: 'clear' })} disabled={!hasParts}>
        <Trash2 size={18} animateOnHover />
      </ToolButton>

      <div className="ms-auto flex shrink-0 items-center gap-1 ps-2">
        <RunToggle />
        <ToolButton
          label={sound ? t.toolbar.soundOn : t.toolbar.soundOff}
          onClick={() => {
            unlockAudio()
            toggleSound()
          }}
        >
          {sound ? <Volume2 size={18} animateOnHover /> : <VolumeX size={18} animateOnHover />}
        </ToolButton>
        <LanguageMenu />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ThemeTogglerButton
                theme={theme}
                resolvedTheme={theme}
                setTheme={(next) => setTheme(next === 'dark' ? 'dark' : 'light')}
                modes={['light', 'dark']}
                variant="ghost"
                size="default"
                aria-label={t.toolbar.theme}
              >
                <ThemeTogglerButtonIcon light={<Sun size={18} />} dark={<Moon size={18} />} />
              </ThemeTogglerButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>{t.toolbar.theme}</TooltipContent>
        </Tooltip>
        <HelpDialog />
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === 'clear' ? t.confirm.clearTitle : t.confirm.loadTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === 'clear' ? t.confirm.clearBody : t.confirm.loadBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.confirm.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} variant={pending?.kind === 'clear' ? 'destructive' : 'default'}>
              {pending?.kind === 'clear' ? t.confirm.clear : t.confirm.load}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
