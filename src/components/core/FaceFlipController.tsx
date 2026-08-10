// components/core/FaceFlipController.tsx
// Orchestrator: lắng nghe store, kích hoạt GSAP flip animation đúng lúc

import { useEffect } from 'react'
import { useFaceStore } from '../../store/useFaceStore'
import { useFlipAnimation } from '../../hooks/useFlipAnimation'

interface FaceRefs {
  [faceId: string]: React.RefObject<HTMLDivElement | null>
}

interface FaceFlipControllerProps {
  faceRefs: FaceRefs
}

export function FaceFlipController({ faceRefs }: FaceFlipControllerProps) {
  const {
    previousFaceId,
    pendingFaceId,
    pendingDirection,
    isAnimating,
    completeFlip,
  } = useFaceStore()

  const { runFlip } = useFlipAnimation()

  useEffect(() => {
    if (!isAnimating || !pendingDirection || !previousFaceId || !pendingFaceId) return

    const exitEl = faceRefs[previousFaceId]?.current
    const enterEl = faceRefs[pendingFaceId]?.current

    if (!exitEl || !enterEl) {
      completeFlip(pendingFaceId)
      return
    }

    runFlip({
      exitFaceEl: exitEl,
      enterFaceEl: enterEl,
      enterDirection: pendingDirection,
      onComplete: () => completeFlip(pendingFaceId),
    })
  }, [isAnimating, pendingDirection, previousFaceId, pendingFaceId, completeFlip, runFlip])

  // Controller không render gì — chỉ là logic layer
  return null
}
