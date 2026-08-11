import { describe, expect, it } from 'vitest'
import {
  ABOUT_LAYOUTS,
  EXCHANGE_DURATION_SECONDS,
  IDLE_DURATION_SECONDS,
  getNextExchangePlan,
} from './aboutSceneModel'

describe('about scene model', () => {
  it('uses five presets and an eight-second cycle', () => {
    expect(ABOUT_LAYOUTS).toHaveLength(5)
    expect(IDLE_DURATION_SECONDS + EXCHANGE_DURATION_SECONDS).toBe(8)
  })

  it('returns one deterministic non-self exchange for every preset', () => {
    for (let preset = 0; preset < ABOUT_LAYOUTS.length; preset += 1) {
      const plan = getNextExchangePlan(preset)

      expect(plan.from).toBe(preset)
      expect(plan.to).not.toBe(preset)
      expect(plan.steps).toHaveLength(3)
      expect(new Set(plan.steps.map((step) => step.block))).toHaveLength(3)
      expect(plan.steps.map((step) => step.delay)).toEqual([0, 0.08, 0.16])
    }
  })

  it('rejects an unknown preset instead of selecting randomly', () => {
    expect(() => getNextExchangePlan(99)).toThrow('Unknown About preset: 99')
  })
})
