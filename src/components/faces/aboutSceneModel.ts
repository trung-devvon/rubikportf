export type AboutBlockIndex = 0 | 1 | 2 | 3 | 4

export interface BlockLayout {
  left: string
  top: string
  width: string
  height: string
}

export type LayoutConfig = readonly [
  BlockLayout,
  BlockLayout,
  BlockLayout,
  BlockLayout,
  BlockLayout,
]

export interface ExchangeStep {
  block: AboutBlockIndex
  lift: number
  zIndex: number
  delay: number
}

export interface ExchangePlan {
  from: number
  to: number
  steps: readonly [ExchangeStep, ExchangeStep, ExchangeStep]
}

export const IDLE_DURATION_SECONDS = 6.6
export const EXCHANGE_DURATION_SECONDS = 1.4

export const ABOUT_LAYOUTS: readonly LayoutConfig[] = [
  [
    { left: '0%', top: '0%', width: '66.666%', height: '33.333%' },
    { left: '66.666%', top: '0%', width: '33.333%', height: '66.666%' },
    { left: '0%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '0%', top: '66.666%', width: '100%', height: '33.333%' },
  ],
  [
    { left: '33.333%', top: '0%', width: '66.666%', height: '33.333%' },
    { left: '0%', top: '0%', width: '33.333%', height: '66.666%' },
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '66.666%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '0%', top: '66.666%', width: '100%', height: '33.333%' },
  ],
  [
    { left: '0%', top: '0%', width: '33.333%', height: '100%' },
    { left: '33.333%', top: '0%', width: '66.666%', height: '33.333%' },
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '66.666%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '33.333%', top: '66.666%', width: '66.666%', height: '33.333%' },
  ],
  [
    { left: '0%', top: '0%', width: '66.666%', height: '33.333%' },
    { left: '66.666%', top: '0%', width: '33.333%', height: '100%' },
    { left: '0%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '0%', top: '66.666%', width: '66.666%', height: '33.333%' },
  ],
  [
    { left: '0%', top: '0%', width: '33.333%', height: '66.666%' },
    { left: '33.333%', top: '0%', width: '33.333%', height: '66.666%' },
    { left: '66.666%', top: '0%', width: '33.333%', height: '66.666%' },
    { left: '0%', top: '66.666%', width: '66.666%', height: '33.333%' },
    { left: '66.666%', top: '66.666%', width: '33.333%', height: '33.333%' },
  ],
]

export const EXCHANGE_PLANS: readonly ExchangePlan[] = [
  {
    from: 0,
    to: 1,
    steps: [
      { block: 0, lift: 56, zIndex: 3, delay: 0 },
      { block: 2, lift: 40, zIndex: 2, delay: 0.08 },
      { block: 4, lift: 32, zIndex: 1, delay: 0.16 },
    ],
  },
  {
    from: 1,
    to: 2,
    steps: [
      { block: 1, lift: 52, zIndex: 3, delay: 0 },
      { block: 4, lift: 38, zIndex: 2, delay: 0.08 },
      { block: 3, lift: 30, zIndex: 1, delay: 0.16 },
    ],
  },
  {
    from: 2,
    to: 3,
    steps: [
      { block: 0, lift: 56, zIndex: 3, delay: 0 },
      { block: 2, lift: 40, zIndex: 2, delay: 0.08 },
      { block: 3, lift: 30, zIndex: 1, delay: 0.16 },
    ],
  },
  {
    from: 3,
    to: 4,
    steps: [
      { block: 1, lift: 52, zIndex: 3, delay: 0 },
      { block: 4, lift: 38, zIndex: 2, delay: 0.08 },
      { block: 2, lift: 30, zIndex: 1, delay: 0.16 },
    ],
  },
  {
    from: 4,
    to: 0,
    steps: [
      { block: 4, lift: 56, zIndex: 3, delay: 0 },
      { block: 0, lift: 40, zIndex: 2, delay: 0.08 },
      { block: 3, lift: 30, zIndex: 1, delay: 0.16 },
    ],
  },
]

export function getNextExchangePlan(currentPreset: number): ExchangePlan {
  const plan = EXCHANGE_PLANS.find((candidate) => candidate.from === currentPreset)

  if (!plan) {
    throw new Error(`Unknown About preset: ${currentPreset}`)
  }

  return plan
}
