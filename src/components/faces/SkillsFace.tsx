// components/faces/SkillsFace.tsx — Mặt TECHNICAL SKILLS
import { forwardRef } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './SkillsFace.module.css'

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

export const SkillsFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()
    const cells = Array.from({ length: 9 }, (_, i) => i)

    return (
      <Face ref={ref} id="skills" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.grid}>
          {cells.map((index) => {
            if (index === 4) {
              return (
                <button
                  key={index}
                  id="skills-back-menu"
                  className={`${styles.cell} ${styles.cellCenter}`}
                  onClick={() => startFlip('menu', 'left')}
                  aria-label="Back to Menu"
                >
                  <div className={styles.centerContent}>
                    <span className={styles.title}>SKILLS</span>
                    <span className={styles.backLabel}>Menu →</span>
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

SkillsFace.displayName = 'SkillsFace'
