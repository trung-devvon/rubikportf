// hooks/useFlipAnimation.ts — GSAP timeline logic cho flip animation
// Hook này đọc flipFrom config và tạo đúng transform-origin + trục xoay

import { useCallback } from 'react'
import { gsap } from '../lib/gsap'
import type { FlipDirection } from '../config/faces.config'
import { useFaceStore } from '../store/useFaceStore'
import { useReducedMotion } from './useReducedMotion'

interface FlipAnimationParams {
  /** Ref của face đang thoát ra (face cũ) */
  exitFaceEl: HTMLElement | null
  /** Ref của face đang vào (face mới) */
  enterFaceEl: HTMLElement | null
  /** Hướng flip của face MỚI (flipFrom của face destination) */
  enterDirection: FlipDirection
  /** Callback sau khi animation hoàn thành */
  onComplete?: () => void
}

/**
 * Tính transform-origin và axis dựa trên hướng flip.
 *
 * Quy tắc: transform-origin = cạnh face MỚI "gắn" vào.
 *   - Vào từ TOP    → face mới xoay quanh cạnh top  (rotateX -90→0)
 *   - Vào từ BOTTOM → face mới xoay quanh cạnh bot  (rotateX 90→0)
 *   - Vào từ LEFT   → face mới xoay quanh cạnh left (rotateY -90→0)
 *   - Vào từ RIGHT  → face mới xoay quanh cạnh right(rotateY 90→0)
 */
function getFlipParams(direction: FlipDirection) {
  switch (direction) {
    case 'top':
      return {
        enterFrom: { rotateX: 90,  rotateY: 0 },
        exitTo:    { rotateX: -90, rotateY: 0 },
      }
    case 'bottom':
      return {
        enterFrom: { rotateX: -90, rotateY: 0 },
        exitTo:    { rotateX: 90,  rotateY: 0 },
      }
    case 'left':
      return {
        enterFrom: { rotateX: 0, rotateY: -90 },
        exitTo:    { rotateX: 0, rotateY: 90 },
      }
    case 'right':
      return {
        enterFrom: { rotateX: 0, rotateY: 90 },
        exitTo:    { rotateX: 0, rotateY: -90 },
      }
  }
}


export function useFlipAnimation() {
  const { completeFlip } = useFaceStore()
  const reducedMotion = useReducedMotion()

  const runFlip = useCallback(
    ({
      exitFaceEl,
      enterFaceEl,
      enterDirection,
      onComplete,
    }: FlipAnimationParams) => {
      if (!exitFaceEl || !enterFaceEl) return

      // Reduced motion fallback: simple crossfade
      if (reducedMotion) {
        gsap
          .timeline({
            onComplete: () => {
              gsap.set([exitFaceEl, enterFaceEl], { clearProps: 'opacity' })
              onComplete?.()
            },
          })
          .set(enterFaceEl, { opacity: 0 })
          .set(exitFaceEl, { opacity: 1 })
          .to(exitFaceEl, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0)
          .to(enterFaceEl, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0.12)
        return
      }

      // Full 3D flip timeline (Desktop and Optimized Mobile)
      const params = getFlipParams(enterDirection)
      
      // Calculate dynamic z depth based on viewport. Smaller screen uses smaller depth to fit view
      const depthZ = enterDirection === 'top' || enterDirection === 'bottom'
        ? -window.innerHeight / 2
        : -window.innerWidth / 2
      
      const transformOrigin = `50% 50% ${depthZ}px`

      // Use force3D to promote layers in GSAP
      gsap
        .timeline({
          onComplete: () => {
            gsap.set([exitFaceEl, enterFaceEl], { 
              clearProps: 'transform,transformOrigin,rotateX,rotateY,force3D' 
            })
            onComplete?.()
          },
        })
        .set(enterFaceEl, {
          transformOrigin: transformOrigin,
          force3D: true,
          ...params.enterFrom,
        })
        .set(exitFaceEl, {
          transformOrigin: transformOrigin,
          force3D: true,
          rotateX: 0,
          rotateY: 0,
        })
        .to(
          exitFaceEl,
          {
            ...params.exitTo,
            duration: 0.85,
            ease: 'power3.inOut',
          },
          0
        )
        .to(
          enterFaceEl,
          {
            rotateX: 0,
            rotateY: 0,
            duration: 0.85,
            ease: 'power3.inOut',
          },
          0
        )
    },
    [reducedMotion, completeFlip]
  )

  return { runFlip }
}
