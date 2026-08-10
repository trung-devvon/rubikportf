// components/faces/ContactFace.tsx — Mặt CONTACT
import { forwardRef } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './ContactFace.module.css'

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

export const ContactFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()
    const cells = Array.from({ length: 9 }, (_, i) => i)

    return (
      <Face ref={ref} id="contact" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.grid}>
          {cells.map((index) => {
            if (index === 4) {
              return (
                <button
                  key={index}
                  id="contact-back-menu"
                  className={`${styles.cell} ${styles.cellCenter}`}
                  onClick={() => startFlip('menu', 'bottom')}
                  aria-label="Back to Menu"
                >
                  <div className={styles.centerContent}>
                    <span className={styles.title}>CONTACT</span>
                    <span className={styles.backLabel}>↓ Menu</span>
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

ContactFace.displayName = 'ContactFace'
