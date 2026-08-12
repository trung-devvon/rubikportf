export type AboutBlockIndex = 0 | 1 | 2 | 3 | 4

export interface BlockLayout {
  left: string
  top: string
  width: string
  height: string
}

export interface FlightDelta {
  x: number
  y: number
}

export interface BoardBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface CollisionPair {
  first: AboutBlockIndex
  second: AboutBlockIndex
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
  laneZ: number
  releaseStart: number
  travelStart: number
  landingStart: number
  targetClearAt: number
  rotationX: number
  rotationY: number
  rotationZ: number
}

export interface ExchangePlan {
  from: number
  to: number
  steps: readonly ExchangeStep[]
  conflicts: readonly CollisionPair[]
  duration: number
}

export const IDLE_DURATION_SECONDS = 7
export const EXCHANGE_DURATION_SECONDS = 3.13
export const BLOCK_DEPTH_PX = 32
export const LANE_CLEARANCE_PX = 16

export const PHYSICAL_EXCHANGE_TIMING = {
  liftDuration: 0.54,
  travelStart: 0.72,
  travelDuration: 0.82,
  landingDuration: 0.4,
  landingStagger: 0.08,
  releaseDuration: 0.35,
  releaseStagger: 0.11,
  holdDuration: 0.18,
  serialTravelDuration: 0.3,
  serialTravelGap: 0.06,
} as const

const LANE_HEIGHTS = [176, 128, 80, -64, -112] as const

function percentOffset(value: string): number {
  return Number.parseFloat(value) / 100
}

export function getFlightDelta(
  source: BlockLayout,
  target: BlockLayout,
  boardWidth: number,
  boardHeight: number,
): FlightDelta {
  return {
    x: Math.round((percentOffset(target.left) - percentOffset(source.left)) * boardWidth * 100) / 100,
    y: Math.round((percentOffset(target.top) - percentOffset(source.top)) * boardHeight * 100) / 100,
  }
}

export function getBoardBounds(layout: BlockLayout): BoardBounds {
  const left = Math.round(Number.parseFloat(layout.left) / 33.333)
  const top = Math.round(Number.parseFloat(layout.top) / 33.333)
  const width = Math.round(Number.parseFloat(layout.width) / 33.333)
  const height = Math.round(Number.parseFloat(layout.height) / 33.333)

  return { left, top, right: left + width, bottom: top + height }
}

function getSweptBounds(source: BlockLayout, target: BlockLayout): BoardBounds {
  const first = getBoardBounds(source)
  const second = getBoardBounds(target)

  return {
    left: Math.min(first.left, second.left),
    top: Math.min(first.top, second.top),
    right: Math.max(first.right, second.right),
    bottom: Math.max(first.bottom, second.bottom),
  }
}

function overlaps(first: BoardBounds, second: BoardBounds): boolean {
  return first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top
}

export function getCollisionPairs(
  source: LayoutConfig,
  target: LayoutConfig,
): readonly CollisionPair[] {
  const pairs: CollisionPair[] = []

  for (let first = 0; first < source.length; first += 1) {
    for (let second = first + 1; second < source.length; second += 1) {
      if (overlaps(
        getSweptBounds(source[first], target[first]),
        getSweptBounds(source[second], target[second]),
      )) {
        pairs.push({
          first: first as AboutBlockIndex,
          second: second as AboutBlockIndex,
        })
      }
    }
  }

  return pairs
}

// Every block keeps the same physical footprint in both opposing boards:
// About = 2x1, Story = 1x2, Mission/Mindset = 1x1, Passions = 3x1.
export const ABOUT_LAYOUTS: readonly LayoutConfig[] = [
  [
    { left: '0%', top: '0%', width: '66.666%', height: '33.333%' },
    { left: '66.666%', top: '0%', width: '33.333%', height: '66.666%' },
    { left: '0%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' },
    { left: '0%', top: '66.666%', width: '100%', height: '33.333%' },
  ],
  [
    { left: '33.333%', top: '33.333%', width: '66.666%', height: '33.333%' },
    { left: '0%', top: '33.333%', width: '33.333%', height: '66.666%' },
    { left: '33.333%', top: '66.666%', width: '33.333%', height: '33.333%' },
    { left: '66.666%', top: '66.666%', width: '33.333%', height: '33.333%' },
    { left: '0%', top: '0%', width: '100%', height: '33.333%' },
  ],
]

export function getTargetBlockers(
  source: LayoutConfig,
  target: LayoutConfig,
  block: AboutBlockIndex,
): readonly AboutBlockIndex[] {
  const targetBounds = getBoardBounds(target[block])

  return source.flatMap((layout, index) => (
    index !== block && overlaps(getBoardBounds(layout), targetBounds)
      ? [index as AboutBlockIndex]
      : []
  ))
}

function getRotation(source: BlockLayout, target: BlockLayout) {
  const delta = getFlightDelta(source, target, 1, 1)
  const horizontal = Math.sign(delta.x)
  const vertical = Math.sign(delta.y)

  return {
    rotationX: vertical * -3,
    rotationY: horizontal * 4,
    rotationZ: (horizontal || vertical) * 1.5,
  }
}

function getRoutePriority(
  source: LayoutConfig,
  target: LayoutConfig,
  conflicts: readonly CollisionPair[],
  block: AboutBlockIndex,
): number {
  const sourceBounds = getBoardBounds(source[block])
  const footprintArea = (sourceBounds.right - sourceBounds.left)
    * (sourceBounds.bottom - sourceBounds.top)
  const delta = getFlightDelta(source[block], target[block], 1, 1)
  const travelLength = Math.hypot(delta.x, delta.y)
  const conflictCount = conflicts.filter(({ first, second }) => first === block || second === block).length
  const targetBlockerCount = getTargetBlockers(source, target, block).length

  return conflictCount * 1_000 + targetBlockerCount * 100 + footprintArea * 10 + travelLength
}

export function getNextExchangePlan(currentPreset: number): ExchangePlan {
  if (currentPreset < 0 || currentPreset >= ABOUT_LAYOUTS.length) {
    throw new Error(`Unknown About preset: ${currentPreset}`)
  }

  const from = currentPreset
  const to = from === 0 ? 1 : 0
  const source = ABOUT_LAYOUTS[from]
  const target = ABOUT_LAYOUTS[to]
  const conflicts = getCollisionPairs(source, target)
  const releaseEnd = PHYSICAL_EXCHANGE_TIMING.releaseDuration
    + PHYSICAL_EXCHANGE_TIMING.releaseStagger * (ABOUT_LAYOUTS[0].length - 1)
  const firstTravelStart = releaseEnd + PHYSICAL_EXCHANGE_TIMING.holdDuration
  const lastTravelEnd = firstTravelStart
    + (PHYSICAL_EXCHANGE_TIMING.serialTravelDuration + PHYSICAL_EXCHANGE_TIMING.serialTravelGap)
      * (ABOUT_LAYOUTS[0].length - 1)
    + PHYSICAL_EXCHANGE_TIMING.serialTravelDuration
  const orderedBlocks = ([0, 1, 2, 3, 4] as const)
    .slice()
    .sort((first, second) => {
      const priority = getRoutePriority(source, target, conflicts, second)
        - getRoutePriority(source, target, conflicts, first)

      return priority || first - second
    })
  const steps = orderedBlocks.map((block, rank) => {
    const laneZ = LANE_HEIGHTS[rank]
    const travelStart = firstTravelStart
      + rank * (PHYSICAL_EXCHANGE_TIMING.serialTravelDuration + PHYSICAL_EXCHANGE_TIMING.serialTravelGap)
    const landingStart = travelStart + PHYSICAL_EXCHANGE_TIMING.serialTravelDuration

    return {
      block,
      lift: laneZ,
      laneZ,
      zIndex: ABOUT_LAYOUTS[0].length - rank,
      delay: rank * PHYSICAL_EXCHANGE_TIMING.releaseStagger,
      releaseStart: rank * PHYSICAL_EXCHANGE_TIMING.releaseStagger,
      travelStart,
      landingStart,
      targetClearAt: releaseEnd,
      ...getRotation(source[block], target[block]),
    }
  })

  return {
    from,
    to,
    steps,
    conflicts,
    duration: lastTravelEnd + PHYSICAL_EXCHANGE_TIMING.landingDuration,
  }
}
