// components/core/FaceContainer.tsx
// Wrapper ngoài cùng chứa tất cả các Face
// Cài `perspective` ở đây để tạo chiều sâu 3D cho các face bên trong

import React from 'react'
import styles from './FaceContainer.module.css'

interface FaceContainerProps {
  children: React.ReactNode
}

export function FaceContainer({ children }: FaceContainerProps) {
  return (
    <div className={styles.container} aria-live="polite">
      {children}
    </div>
  )
}
