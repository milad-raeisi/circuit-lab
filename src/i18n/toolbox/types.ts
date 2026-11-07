import type { ToolCategory, ToolId } from '@/toolbox/catalog'

export type ToolPage = {
  name: string
  /** a few words under the name, e.g. "Measures volts and more" */
  short: string
  /** what it is for: 2 or 3 short sentences */
  use: string
  /** how to use it: 3 to 5 short steps, in order */
  steps: string[]
  /** the one safety rule to remember */
  safe: string
  /** one surprising, true fact */
  fact: string
}

export type ToolboxBook = {
  title: string
  /** one sentence under the title */
  intro: string
  /** "7 of 27 explored" */
  explored: (seen: number, total: number) => string
  /** the three rules shown above the drawers */
  rules: { title: string; items: [string, string, string] }
  categories: Record<ToolCategory, { name: string; blurb: string }>
  labels: {
    use: string
    steps: string
    safe: string
    fact: string
    grownUp: string
    hot: string
    seen: string
    back: string
    previous: string
    next: string
    close: string
    /** "3 of 27" */
    position: (index: number, total: number) => string
  }
  tools: Record<ToolId, ToolPage>
}
