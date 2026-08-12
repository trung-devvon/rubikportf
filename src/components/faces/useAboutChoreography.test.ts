import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      matches: false,
      media: '',
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }),
    writable: true,
  })
})

import {
  ABOUT_LAYOUTS,
  PHYSICAL_EXCHANGE_TIMING,
  getFlightDelta,
  getNextExchangePlan,
} from './aboutSceneModel'
import * as choreographyModule from './useAboutChoreography'

interface MotionInstruction {
  block: number
  phase: 'release' | 'travel' | 'landing'
  at: number
  duration: number
  x?: number
  y?: number
}

type MotionInstructionFactory = (
  plan: ReturnType<typeof getNextExchangePlan>,
  source: (typeof ABOUT_LAYOUTS)[number],
  target: (typeof ABOUT_LAYOUTS)[number],
  boardWidth: number,
  boardHeight: number,
) => readonly MotionInstruction[]

interface BoardSize {
  width: number
  height: number
}

const { createAboutMotionInstructions, getChoreographyBoardSize } = choreographyModule as {
  createAboutMotionInstructions?: MotionInstructionFactory
  getChoreographyBoardSize?: (element: HTMLElement) => BoardSize
}

describe('About choreography motion instructions', () => {
  it('uses a flat lift, serial travel, and landing windows', () => {
    expect(createAboutMotionInstructions).toBeTypeOf('function')

    if (!createAboutMotionInstructions) throw new Error('Expected motion instruction factory')

    const plan = getNextExchangePlan(0)
    const source = ABOUT_LAYOUTS[plan.from]
    const target = ABOUT_LAYOUTS[plan.to]
    const instructions = createAboutMotionInstructions(plan, source, target, 900, 600)

    for (const step of plan.steps) {
      const release = instructions.find((instruction) => (
        instruction.block === step.block && instruction.phase === 'release'
      ))
      const travel = instructions.find((instruction) => (
        instruction.block === step.block && instruction.phase === 'travel'
      ))
      const landing = instructions.find((instruction) => (
        instruction.block === step.block && instruction.phase === 'landing'
      ))

      expect(release).toMatchObject({
        at: step.releaseStart,
        duration: PHYSICAL_EXCHANGE_TIMING.releaseDuration,
        y: -12,
      })
      expect(travel).toMatchObject({
        at: step.travelStart,
        duration: PHYSICAL_EXCHANGE_TIMING.serialTravelDuration,
        ...getFlightDelta(source[step.block], target[step.block], 900, 600),
      })
      expect(landing).toMatchObject({
        at: step.landingStart,
        duration: PHYSICAL_EXCHANGE_TIMING.landingDuration,
        scale: 1,
      })
      expect(landing).not.toHaveProperty('x')
      expect(landing).not.toHaveProperty('y')
    }

    const passionsStep = plan.steps.find((step) => step.block === 4)!
    const passionsLanding = instructions.find((instruction) => (
      instruction.block === 4 && instruction.phase === 'landing'
    ))!

    expect(passionsLanding.at).toBeCloseTo(
      passionsStep.travelStart + PHYSICAL_EXCHANGE_TIMING.serialTravelDuration,
    )
  })

  it('uses the inner board dimensions when the visual perimeter has a border', () => {
    expect(getChoreographyBoardSize).toBeTypeOf('function')

    if (!getChoreographyBoardSize) throw new Error('Expected board-size helper')

    const board = document.createElement('div')
    Object.defineProperties(board, {
      clientHeight: { configurable: true, value: 714 },
      clientWidth: { configurable: true, value: 1274 },
    })

    expect(getChoreographyBoardSize(board)).toEqual({ width: 1274, height: 714 })
  })
})
