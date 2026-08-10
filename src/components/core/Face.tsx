// components/core/Face.tsx
// 1 "mặt" của khối rubik — chiếm full viewport, absolute positioned
// GSAP sẽ animate transform trực tiếp trên element này qua ref

import React, { forwardRef } from 'react'
import type { FaceId } from '../../config/faces.config'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './Face.module.css'

interface FaceProps {
  id: FaceId
  isActive: boolean
  isVisible: boolean    // MỚI: Quản lý display đồng bộ cho transition
  background?: string   // CSS color override
  children: React.ReactNode
  className?: string
}

/**
 * forwardRef vì FaceFlipController cần ref để chạy GSAP animation
 */
export const Face = forwardRef<HTMLDivElement, FaceProps>(
  ({ id, isActive, isVisible, background, children, className = '' }, ref) => {
    const isAnimating = useFaceStore((state) => state.isAnimating)

    return (
      <div
        ref={ref}
        id={`face-${id}`}
        role="region"
        aria-label={`Section: ${id}`}
        data-face-id={id}
        className={[
          styles.face,
          'face-3d',  // will-change: transform hint từ animations.css
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          display: isVisible ? 'flex' : 'none',
          background: background ?? 'var(--color-frame)',
          overflowY: (isActive && !isAnimating) ? 'auto' : 'visible',
          overflowX: 'hidden',
        }}
      >
        {children}
      </div>
    )
  }
)

Face.displayName = 'Face'
