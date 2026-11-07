/*
 * The real workshop tools the Toolbox teaches, grouped like the drawers of
 * a maker's toolbox. Words for every language live in src/i18n/toolbox/;
 * the drawings live in ToolArt.tsx.
 */

export type ToolCategory = 'measure' | 'build' | 'cut' | 'power' | 'fix' | 'safe'

export const TOOL_IDS = [
  'multimeter',
  'oscilloscope',
  'calipers',
  'partTester',
  'breadboard',
  'jumperWires',
  'crocClips',
  'solderingIron',
  'solder',
  'helpingHands',
  'hotGlue',
  'heatShrink',
  'wireStripper',
  'sideCutters',
  'pliers',
  'tweezers',
  'screwdrivers',
  'benchSupply',
  'batteryHolder',
  'usbPower',
  'desolderPump',
  'solderWick',
  'tipCleaner',
  'safetyGlasses',
  'fumeFan',
  'heatMat',
  'antiStatic',
] as const

export type ToolId = (typeof TOOL_IDS)[number]

export type ToolInfo = {
  category: ToolCategory
  /** only with a grown-up next to you */
  grownUp?: boolean
  /** the tool itself, or what it is used with, gets very hot */
  hot?: boolean
}

export const TOOLS: Record<ToolId, ToolInfo> = {
  multimeter: { category: 'measure' },
  oscilloscope: { category: 'measure', grownUp: true },
  calipers: { category: 'measure' },
  partTester: { category: 'measure' },
  breadboard: { category: 'build' },
  jumperWires: { category: 'build' },
  crocClips: { category: 'build' },
  solderingIron: { category: 'build', grownUp: true, hot: true },
  solder: { category: 'build', grownUp: true, hot: true },
  helpingHands: { category: 'build' },
  hotGlue: { category: 'build', grownUp: true, hot: true },
  heatShrink: { category: 'build', grownUp: true, hot: true },
  wireStripper: { category: 'cut' },
  sideCutters: { category: 'cut' },
  pliers: { category: 'cut' },
  tweezers: { category: 'cut' },
  screwdrivers: { category: 'cut' },
  benchSupply: { category: 'power', grownUp: true },
  batteryHolder: { category: 'power' },
  usbPower: { category: 'power' },
  desolderPump: { category: 'fix', grownUp: true, hot: true },
  solderWick: { category: 'fix', grownUp: true, hot: true },
  tipCleaner: { category: 'fix', grownUp: true, hot: true },
  safetyGlasses: { category: 'safe' },
  fumeFan: { category: 'safe' },
  heatMat: { category: 'safe' },
  antiStatic: { category: 'safe' },
}

export const TOOL_CATEGORIES: ToolCategory[] = ['measure', 'build', 'cut', 'power', 'fix', 'safe']

/** One colour per drawer, used for its label, its cards' glow and the detail page. */
export const CATEGORY_COLOR: Record<ToolCategory, string> = {
  measure: '#0ea5e9',
  build: '#f97316',
  cut: '#8b5cf6',
  power: '#eab308',
  fix: '#14b8a6',
  safe: '#22c55e',
}

export const toolsIn = (category: ToolCategory) => TOOL_IDS.filter((id) => TOOLS[id].category === category)
