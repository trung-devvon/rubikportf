import { describe, expect, it } from 'vitest'
import {
  ABOUT_LAYOUTS,
  EXCHANGE_DURATION_SECONDS,
  IDLE_DURATION_SECONDS,
  PHYSICAL_EXCHANGE_TIMING,
  getFlightDelta,
  getNextExchangePlan,
} from './aboutSceneModel'

describe('about scene model', () => {
  it('uses two opposing physical boards and a seven-second idle period', () => {
    expect(ABOUT_LAYOUTS).toHaveLength(2)
    expect(IDLE_DURATION_SECONDS).toBe(7)
    expect(EXCHANGE_DURATION_SECONDS).toBeGreaterThan(0)
  })

  it('fills each 3×3 board without overlapping physical blocks', () => {
    for (const layout of ABOUT_LAYOUTS) {
      const cells = layout.flatMap((block) => {
        const left = Math.round(Number.parseFloat(block.left) / 33.333)
        const top = Math.round(Number.parseFloat(block.top) / 33.333)
        const width = Math.round(Number.parseFloat(block.width) / 33.333)
        const height = Math.round(Number.parseFloat(block.height) / 33.333)

        return Array.from({ length: width * height }, (_, index) => {
          const x = left + (index % width)
          const y = top + Math.floor(index / width)
          return `${x}:${y}`
        })
      })

      expect(cells).toHaveLength(9)
      expect(new Set(cells)).toHaveLength(9)
    }
  })

  it('reports collision pairs from the source and target swept bounds', () => {
    const plan = getNextExchangePlan(0)
    const source = ABOUT_LAYOUTS[plan.from]
    const target = ABOUT_LAYOUTS[plan.to]
    const sweptBounds = source.map((layout, index) => {
      const asBounds = (block: typeof layout) => {
        const left = Math.round(Number.parseFloat(block.left) / 33.333)
        const top = Math.round(Number.parseFloat(block.top) / 33.333)
        const width = Math.round(Number.parseFloat(block.width) / 33.333)
        const height = Math.round(Number.parseFloat(block.height) / 33.333)
        return { left, top, right: left + width, bottom: top + height }
      }
      const first = asBounds(layout)
      const second = asBounds(target[index])

      return {
        left: Math.min(first.left, second.left),
        top: Math.min(first.top, second.top),
        right: Math.max(first.right, second.right),
        bottom: Math.max(first.bottom, second.bottom),
      }
    })
    const expectedPairs: Array<{ first: number; second: number }> = []

    for (let first = 0; first < sweptBounds.length; first += 1) {
      for (let second = first + 1; second < sweptBounds.length; second += 1) {
        const firstBounds = sweptBounds[first]
        const secondBounds = sweptBounds[second]
        const intersects = firstBounds.left < secondBounds.right
          && firstBounds.right > secondBounds.left
          && firstBounds.top < secondBounds.bottom
          && firstBounds.bottom > secondBounds.top

        if (intersects) expectedPairs.push({ first, second })
      }
    }

    expect(plan).toMatchObject({ conflicts: expectedPairs })
  })

  it('turns collision pairs into depth-safe serial travel lanes', () => {
    const plan = getNextExchangePlan(0)
    const steps = plan.steps as ReadonlyArray<{
      block: number
      laneZ?: number
      travelStart?: number
    }>
    const laneZ = steps.map((step) => step.laneZ)

    expect(steps.map((step) => step.block)).toEqual([4, 1, 0, 2, 3])
    expect(laneZ).toEqual([176, 128, 80, -64, -112])

    const sortedLanes = laneZ.slice().sort((first, second) => first! - second!)
    for (let index = 1; index < sortedLanes.length; index += 1) {
      expect(sortedLanes[index]! - sortedLanes[index - 1]!).toBeGreaterThanOrEqual(48)
    }

    for (const { first, second } of plan.conflicts) {
      const firstStep = steps.find((step) => step.block === first)!
      const secondStep = steps.find((step) => step.block === second)!
      const firstEnds = firstStep.travelStart! + 0.3
      const secondEnds = secondStep.travelStart! + 0.3

      expect(firstEnds <= secondStep.travelStart! || secondEnds <= firstStep.travelStart!).toBe(true)
    }
  })

  it('keeps every block shape while it changes physical position', () => {
    for (let preset = 0; preset < ABOUT_LAYOUTS.length; preset += 1) {
      const plan = getNextExchangePlan(preset)

      for (let block = 0; block < ABOUT_LAYOUTS[preset].length; block += 1) {
        const from = ABOUT_LAYOUTS[plan.from][block]
        const to = ABOUT_LAYOUTS[plan.to][block]

        expect(to.width).toBe(from.width)
        expect(to.height).toBe(from.height)
      }
    }
  })

  it('reserves visible time for lifting, travel, and landing', () => {
    expect(PHYSICAL_EXCHANGE_TIMING.liftDuration).toBe(0.54)
    expect(PHYSICAL_EXCHANGE_TIMING.travelStart).toBe(0.72)
    expect(PHYSICAL_EXCHANGE_TIMING.travelDuration).toBe(0.82)
    expect(PHYSICAL_EXCHANGE_TIMING.landingDuration).toBe(0.4)
    expect(PHYSICAL_EXCHANGE_TIMING.landingStagger).toBe(0.08)
  })

  it('assigns a flight lane to every block that changes position', () => {
    for (let preset = 0; preset < ABOUT_LAYOUTS.length; preset += 1) {
      const plan = getNextExchangePlan(preset)
      const movingBlocks = ABOUT_LAYOUTS[plan.from]
        .map((layout, block) => {
          const target = ABOUT_LAYOUTS[plan.to][block]
          return layout.left !== target.left || layout.top !== target.top ? block : null
        })
        .filter((block): block is number => block !== null)

      expect(plan.steps.map((step) => step.block).sort()).toEqual(movingBlocks)
    }
  })

  it('settles every block immediately after its own flat travel ends', () => {
    for (let preset = 0; preset < ABOUT_LAYOUTS.length; preset += 1) {
      const plan = getNextExchangePlan(preset)

      for (const step of plan.steps) {
        expect(step.landingStart).toBeCloseTo(
          step.travelStart + PHYSICAL_EXCHANGE_TIMING.serialTravelDuration,
        )
      }
    }
  })

  it('moves Passions as part of every board exchange', () => {
    for (let preset = 0; preset < ABOUT_LAYOUTS.length; preset += 1) {
      const plan = getNextExchangePlan(preset)
      const source = ABOUT_LAYOUTS[plan.from][4]
      const target = ABOUT_LAYOUTS[plan.to][4]

      expect(source.left !== target.left || source.top !== target.top).toBe(true)
      expect(plan.steps.map((step) => step.block)).toContain(4)
    }
  })

  it('derives each block travel from its source and target coordinates', () => {
    const aboutTravel = getFlightDelta(ABOUT_LAYOUTS[0][0], ABOUT_LAYOUTS[1][0], 900, 600)
    const storyTravel = getFlightDelta(ABOUT_LAYOUTS[0][1], ABOUT_LAYOUTS[1][1], 900, 600)

    expect(aboutTravel.x).toBeCloseTo(300, 1)
    expect(aboutTravel.y).toBeCloseTo(200, 1)
    expect(storyTravel.x).toBeCloseTo(-600, 1)
    expect(storyTravel.y).toBeCloseTo(200, 1)
  })

  it('returns one deterministic non-self exchange for every preset', () => {
    for (let preset = 0; preset < ABOUT_LAYOUTS.length; preset += 1) {
      const plan = getNextExchangePlan(preset)

      expect(plan.from).toBe(preset)
      expect(plan.to).not.toBe(preset)
      expect(plan.steps.length).toBeGreaterThanOrEqual(2)
      expect(new Set(plan.steps.map((step) => step.block))).toHaveLength(plan.steps.length)
      expect(plan.steps[0].delay).toBe(0)
      expect(plan.steps.slice(1).every((step, index) => step.delay > plan.steps[index].delay)).toBe(true)
    }
  })

  it('rejects an unknown preset instead of selecting randomly', () => {
    expect(() => getNextExchangePlan(99)).toThrow('Unknown About preset: 99')
  })
})
