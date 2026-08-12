import { useGSAP } from '@gsap/react'
import { useCallback, useRef, useState, type RefCallback } from 'react'
import { gsap } from '../../lib/gsap'
import {
  ABOUT_LAYOUTS,
  IDLE_DURATION_SECONDS,
  PHYSICAL_EXCHANGE_TIMING,
  getFlightDelta,
  getNextExchangePlan,
  type AboutBlockIndex,
  type ExchangePlan,
  type LayoutConfig,
} from './aboutSceneModel'

const BLOCK_COUNT = ABOUT_LAYOUTS[0].length

function collectElements(refs: Array<HTMLDivElement | null>) {
  return refs.filter((element): element is HTMLDivElement => element !== null)
}

export function getChoreographyBoardSize(element: HTMLElement) {
  return {
    width: element.clientWidth,
    height: element.clientHeight,
  }
}

interface UseAboutChoreographyOptions {
  isLive: boolean
  reducedMotion: boolean
}

export interface AboutMotionInstruction {
  block: AboutBlockIndex
  phase: 'release' | 'travel' | 'landing'
  at: number
  duration: number
  x?: number
  y?: number
  scale?: number
}

export function createAboutMotionInstructions(
  plan: ExchangePlan,
  source: LayoutConfig,
  target: LayoutConfig,
  boardWidth: number,
  boardHeight: number,
): readonly AboutMotionInstruction[] {
  return plan.steps.flatMap((step) => {
    const delta = getFlightDelta(
      source[step.block],
      target[step.block],
      boardWidth,
      boardHeight,
    )

    return [
      {
        block: step.block,
        phase: 'release' as const,
        at: step.releaseStart,
        duration: PHYSICAL_EXCHANGE_TIMING.releaseDuration,
        y: -12,
        scale: 0.985,
      },
      {
        block: step.block,
        phase: 'travel' as const,
        at: step.travelStart,
        duration: PHYSICAL_EXCHANGE_TIMING.serialTravelDuration,
        x: delta.x,
        y: delta.y,
      },
      {
        block: step.block,
        phase: 'landing' as const,
        at: step.landingStart,
        duration: PHYSICAL_EXCHANGE_TIMING.landingDuration,
        scale: 1,
      },
    ]
  })
}

export function useAboutChoreography({
  isLive,
  reducedMotion,
}: UseAboutChoreographyOptions) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const layoutRefs = useRef<Array<HTMLDivElement | null>>(Array(BLOCK_COUNT).fill(null))
  const motionRefs = useRef<Array<HTMLDivElement | null>>(Array(BLOCK_COUNT).fill(null))
  const layoutCallbacks = useRef<Array<RefCallback<HTMLDivElement>>>([])
  const motionCallbacks = useRef<Array<RefCallback<HTMLDivElement>>>([])
  const scheduleRef = useRef<ReturnType<typeof gsap.delayedCall> | null>(null)
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const enabledRef = useRef(false)
  const activePresetRef = useRef(0)
  const [activePreset, setActivePreset] = useState(0)

  const setLayoutRef = useCallback((index: AboutBlockIndex) => {
    if (!layoutCallbacks.current[index]) {
      layoutCallbacks.current[index] = (element) => {
        layoutRefs.current[index] = element
      }
    }

    return layoutCallbacks.current[index]
  }, [])

  const setMotionRef = useCallback((index: AboutBlockIndex) => {
    if (!motionCallbacks.current[index]) {
      motionCallbacks.current[index] = (element) => {
        motionRefs.current[index] = element
      }
    }

    return motionCallbacks.current[index]
  }, [])

  const { contextSafe } = useGSAP(
    () => {
      enabledRef.current = isLive && !reducedMotion

      const clearTemporaryProps = () => {
        const layoutTargets = collectElements(layoutRefs.current)
        const motionTargets = collectElements(motionRefs.current)

        gsap.killTweensOf([...layoutTargets, ...motionTargets])
        gsap.set([...layoutTargets, ...motionTargets], {
          clearProps: 'transform,zIndex,boxShadow',
        })
      }

      const stop = () => {
        enabledRef.current = false
        scheduleRef.current?.kill()
        scheduleRef.current = null
        timelineRef.current?.kill()
        timelineRef.current = null
        clearTemporaryProps()
      }

      if (!enabledRef.current) {
        stop()
        return stop
      }

      let scheduleNext = () => undefined

      const runExchange = contextSafe(() => {
        if (!enabledRef.current || !sceneRef.current) return

        const layoutTargets = collectElements(layoutRefs.current)
        const motionTargets = collectElements(motionRefs.current)
        const boardSize = getChoreographyBoardSize(sceneRef.current)

        if (
          layoutTargets.length !== BLOCK_COUNT ||
          motionTargets.length !== BLOCK_COUNT ||
          boardSize.width === 0 ||
          boardSize.height === 0
        ) {
          scheduleNext()
          return
        }

        scheduleRef.current = null

        const plan = getNextExchangePlan(activePresetRef.current)
        const sourceLayout = ABOUT_LAYOUTS[plan.from]
        const targetLayout = ABOUT_LAYOUTS[plan.to]
        const instructions = createAboutMotionInstructions(
          plan,
          sourceLayout,
          targetLayout,
          boardSize.width,
          boardSize.height,
        )

        const timeline = gsap.timeline({
          onComplete: () => {
            // Commit the destination board only after every visible object has landed.
            targetLayout.forEach((layout, index) => {
              const node = layoutRefs.current[index]
              if (!node) return

              node.style.left = layout.left
              node.style.top = layout.top
              node.style.width = layout.width
              node.style.height = layout.height
            })

            gsap.set(motionTargets, {
              clearProps: 'transform,boxShadow',
            })
            gsap.set(layoutTargets, { clearProps: 'transform,zIndex' })

            activePresetRef.current = plan.to
            setActivePreset(plan.to)
            timelineRef.current = null

            if (enabledRef.current) scheduleNext()
          },
        })

        timelineRef.current = timeline

        plan.steps.forEach((step) => {
          const layoutTarget = layoutRefs.current[step.block]
          if (!layoutTarget) return

          timeline.set(layoutTarget, { zIndex: step.zIndex }, step.releaseStart)
        })

        instructions.forEach((instruction) => {
          const motionTarget = motionRefs.current[instruction.block]
          if (!motionTarget) return

          const ease = instruction.phase === 'release'
            ? 'power3.out'
            : instruction.phase === 'travel'
              ? 'power2.inOut'
              : 'power2.out'
          const transform = instruction.phase === 'release'
            ? {
                y: instruction.y,
                scale: instruction.scale,
              }
            : instruction.phase === 'travel'
              ? { x: instruction.x, y: instruction.y }
            : {
                  scale: instruction.scale,
                }

          timeline.to(
            motionTarget,
            {
              ...transform,
              duration: instruction.duration,
              ease,
            },
            instruction.at,
          )
        })
      })

      scheduleNext = contextSafe(() => {
        if (!enabledRef.current) return

        scheduleRef.current?.kill()
        scheduleRef.current = gsap.delayedCall(IDLE_DURATION_SECONDS, runExchange)
      })

      scheduleNext()

      return stop
    },
    {
      dependencies: [isLive, reducedMotion],
      revertOnUpdate: true,
      scope: sceneRef,
    },
  )

  return {
    sceneRef,
    activePreset,
    setLayoutRef,
    setMotionRef,
  }
}
