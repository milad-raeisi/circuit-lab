import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TOOL_IDS, type ToolId } from './catalog'

type ToolboxState = {
  open: boolean
  /** true once the box has been opened, so its code is loaded and it can animate closed */
  loaded: boolean
  /** the tool on show, or null for the drawers of tools */
  tool: ToolId | null
  /** tools the child has opened at least once */
  seen: ToolId[]
  /** the last page turn: 1 forwards, -1 backwards, 0 a jump */
  step: number
  /** the tool whose page was just left for the drawers, to put the focus back on its card */
  returnTo: ToolId | null
  setOpen: (open: boolean) => void
  pick: (tool: ToolId | null) => void
}

const known = new Set<string>(TOOL_IDS)

/** One Toolbox for the whole app: the top bar and the phone dock both open it. */
export const useToolbox = create<ToolboxState>()(
  persist(
    (set) => ({
      open: false,
      loaded: false,
      tool: null,
      seen: [],
      step: 0,
      returnTo: null,
      setOpen: (open) => set(open ? { open, loaded: true } : { open }),
      pick: (tool) =>
        set((s) => {
          const total = TOOL_IDS.length
          const from = s.tool ? TOOL_IDS.indexOf(s.tool) : -1
          const to = tool ? TOOL_IDS.indexOf(tool) : -1
          const turn = (to - from + total) % total
          return {
            tool,
            step: from < 0 || to < 0 ? 0 : turn === 1 ? 1 : turn === total - 1 ? -1 : 0,
            returnTo: tool ? s.returnTo : s.tool,
            seen: tool && !s.seen.includes(tool) ? [...s.seen, tool] : s.seen,
          }
        }),
    }),
    {
      name: 'circuit-lab:toolbox',
      version: 1,
      // only what was explored is kept; the box always opens closed
      partialize: (s) => ({ seen: s.seen }),
      merge: (saved, current) => {
        const seen = (saved as { seen?: unknown } | undefined)?.seen
        return {
          ...current,
          seen: Array.isArray(seen) ? (seen.filter((id) => known.has(id)) as ToolId[]) : [],
        }
      },
    },
  ),
)

/** Starts loading the Toolbox before it is opened, e.g. when the pointer reaches its button. */
export const preloadToolbox = () => void import('./Toolbox')
