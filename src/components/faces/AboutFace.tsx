// components/faces/AboutFace.tsx — Mặt ABOUT 3D Blocks (Giai đoạn 2)
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

    return (
      <Face ref={ref} id="about" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.gridContainer}>
          {/* Block 0: ABOUT ME */}
          <div className={styles.box3d} style={{ left: '5%', top: '5%', width: 'calc(50% - 10px)', height: 'calc(25% - 10px)' }}>
            <div className={`${styles.face} ${styles.front}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                <h2 className={styles.title} style={{ margin: 0 }}>About Me</h2>
                <button 
                  onClick={() => startFlip('menu', 'right')} 
                  style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '10px', 
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '2px 8px',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    textTransform: 'uppercase'
                  }}
                  aria-label="Back to Menu"
                >
                  ← Menu
                </button>
              </div>
              <p className={styles.desc}>Nguyen Dinh Trung — Creative Developer dedicated to crafting immersive digital interfaces.</p>
            </div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>

          {/* Block 1: MY STORY */}
          <div className={styles.box3d} style={{ left: '60%', top: '5%', width: 'calc(35% - 10px)', height: 'calc(55% - 10px)' }}>
            <div className={`${styles.face} ${styles.front}`} style={{ justifyContent: 'flex-start' }}>
              <h2 className={styles.title}>My Story</h2>
              <p className={styles.desc}>Based in Hanoi, I build high-performance, responsive web applications from concept to deployment. I specialize in frontend design architecture and smooth transitions.</p>
            </div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>

          {/* Block 2: MISSION */}
          <div className={styles.box3d} style={{ left: '5%', top: '35%', width: 'calc(25% - 10px)', height: 'calc(25% - 10px)' }}>
            <div className={`${styles.face} ${styles.front}`}>
              <h2 className={styles.title}>Mission</h2>
              <p className={styles.desc}>Empower web design with premium animations and clean structures.</p>
            </div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>

          {/* Block 3: MINDSET */}
          <div className={styles.box3d} style={{ left: '35%', top: '35%', width: 'calc(20% - 10px)', height: 'calc(25% - 10px)' }}>
            <div className={`${styles.face} ${styles.front}`}>
              <h2 className={styles.title}>Mindset</h2>
              <p className={styles.desc}>Code is clean, layouts are kinetic. I aim for perfect rendering.</p>
            </div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>

          {/* Block 4: PASSIONS */}
          <div className={styles.box3d} style={{ left: '5%', top: '65%', width: 'calc(90% - 10px)', height: 'calc(30% - 10px)' }}>
            <div className={`${styles.face} ${styles.front}`}>
              <h2 className={styles.title}>Passions</h2>
              <p className={styles.desc}>Coffee, mechanical keyboards, solving Rubik puzzles, and coding with Lofi beats.</p>
            </div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>
        </div>
      </Face>
    )
  }
)

AboutFace.displayName = 'AboutFace'
