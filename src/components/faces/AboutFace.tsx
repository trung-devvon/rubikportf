// components/faces/AboutFace.tsx — Mặt ABOUT
import { forwardRef } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './AboutFace.module.css'

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

export const AboutFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()

    // Lưới 3x3 chứa 9 ô vuông (ô thứ 4 ở trung tâm làm nút quay về Menu)
    const cells = Array.from({ length: 9 }, (_, i) => i)

    return (
      <Face ref={ref} id="about" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.grid}>
          {cells.map((index) => {
            if (index === 4) {
              return (
                <button
                  key={index}
                  id="about-back-menu"
                  className={`${styles.cell} ${styles.cellCenter}`}
                  onClick={() => startFlip('menu', 'right')}
                  aria-label="Back to Menu"
                >
                  <div className={styles.centerContent}>
                    <span className={styles.title}>ABOUT</span>
                    <span className={styles.backLabel}>← Menu</span>
                  </div>
                </button>
              )
            }
            return (
              <div key={index} className={`${styles.cell} ${styles.cellSticker}`} />
            )
          })}
        </div>
      </Face>
    )
  }
)

AboutFace.displayName = 'AboutFace'
