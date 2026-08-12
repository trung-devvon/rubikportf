// components/faces/AboutFace.tsx — Mặt ABOUT 3D Blocks (Giai đoạn 3 & 4)
import { forwardRef } from 'react'
import { Face } from '../core/Face'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useFaceStore } from '../../store/useFaceStore'
import { ABOUT_LAYOUTS, type AboutBlockIndex } from './aboutSceneModel'
import { useAboutChoreography } from './useAboutChoreography'
import styles from './AboutFace.module.css'

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

const SAFE_TILE_CLASSES = [
  'colorAbout',
  'colorStory',
  'colorMission',
  'colorMindset',
  'colorPassions',
] as const

export const AboutFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip, isAnimating } = useFaceStore()
    const reducedMotion = useReducedMotion()
    const { activePreset, sceneRef, setLayoutRef, setMotionRef } = useAboutChoreography({
      isLive: isActive && !isAnimating,
      reducedMotion,
    })
    const sceneMode = isActive && !isAnimating ? 'live' : 'sealed'

    const currentLayout = ABOUT_LAYOUTS[activePreset]

    return (
      <Face ref={ref} id="about" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.sceneGate} data-scene-mode={sceneMode}>
          <div className={styles.safeSurface} data-testid="about-safe-surface" aria-hidden="true">
            <div className={styles.safeBoard} data-testid="about-safe-board">
              {SAFE_TILE_CLASSES.map((colorClass, index) => (
                <div
                  key={colorClass}
                  className={`${styles.safeTile} ${styles[colorClass]}`}
                  style={currentLayout[index as AboutBlockIndex]}
                />
              ))}
            </div>
          </div>

          <div
            className={styles.liveScene}
            data-testid="about-live-scene"
            data-scene-mode={sceneMode}
          >
            <div ref={sceneRef} className={styles.gridContainer} data-testid="about-live-board">
          {/* Block 0: ABOUT ME (Terracotta) */}
          <div 
            ref={setLayoutRef(0)}
            data-testid="about-layout-block-0"
            className={`${styles.block} ${styles.colorAbout}`}
            style={{ 
              left: currentLayout[0].left, 
              top: currentLayout[0].top, 
              width: currentLayout[0].width, 
              height: currentLayout[0].height,
            }}
          >
            <div ref={setMotionRef(0)} data-testid="about-motion-block-0" className={styles.blockSurface}>
                <div className={styles.aboutHeadingRow}>
                  <div>
                    <p className={styles.eyebrow}>Creative Developer</p>
                    <h2 className={styles.title}>About Me</h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startFlip('menu', 'right')
                    }}
                    className={styles.menuButton}
                    aria-label="Back to Menu"
                  >
                    <span aria-hidden="true">←</span> Menu
                  </button>
                </div>
                <p className={styles.desc}>
                  Nguyễn Đình Trung builds tactile, high-performance interfaces where motion carries meaning.
                </p>
                <a 
                  href="/cv.pdf" 
                  download 
                  className={styles.cvBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  Download CV
                </a>
            </div>
          </div>

          {/* Block 1: MY STORY (Mustard, Dark Text) */}
          <div 
            ref={setLayoutRef(1)}
            data-testid="about-layout-block-1"
            className={`${styles.block} ${styles.colorStory}`}
            style={{ 
              left: currentLayout[1].left, 
              top: currentLayout[1].top, 
              width: currentLayout[1].width, 
              height: currentLayout[1].height,
            }}
          >
            <div ref={setMotionRef(1)} data-testid="about-motion-block-1" className={`${styles.blockSurface} ${styles.storySurface}`}>
                <h2 className={styles.title}>My Story</h2>
                <p className={styles.desc}>Based in Hanoi, I build responsive web applications from concept to deployment. I specialize in frontend design architecture and smooth transitions.</p>
            </div>
          </div>

          {/* Block 2: MISSION (Sage) */}
          <div 
            ref={setLayoutRef(2)}
            data-testid="about-layout-block-2"
            className={`${styles.block} ${styles.colorMission}`}
            style={{ 
              left: currentLayout[2].left, 
              top: currentLayout[2].top, 
              width: currentLayout[2].width, 
              height: currentLayout[2].height,
            }}
          >
            <div ref={setMotionRef(2)} data-testid="about-motion-block-2" className={styles.blockSurface}>
                <h2 className={styles.title}>Mission</h2>
                <p className={styles.desc}>Empower web design with premium animations and clean structures.</p>
            </div>
          </div>

          {/* Block 3: MINDSET (Cream Warm, Dark Text) */}
          <div 
            ref={setLayoutRef(3)}
            data-testid="about-layout-block-3"
            className={`${styles.block} ${styles.colorMindset} ${styles.darkText}`}
            style={{ 
              left: currentLayout[3].left, 
              top: currentLayout[3].top, 
              width: currentLayout[3].width, 
              height: currentLayout[3].height,
            }}
          >
            <div ref={setMotionRef(3)} data-testid="about-motion-block-3" className={styles.blockSurface}>
                <h2 className={styles.title}>Mindset</h2>
                <p className={styles.desc}>Code is clean, layouts are kinetic. I aim for perfect rendering.</p>
            </div>
          </div>

          {/* Block 4: PASSIONS (Blue/Dark) */}
          <div 
            ref={setLayoutRef(4)}
            data-testid="about-layout-block-4"
            className={`${styles.block} ${styles.colorPassions}`}
            style={{ 
              left: currentLayout[4].left, 
              top: currentLayout[4].top, 
              width: currentLayout[4].width, 
              height: currentLayout[4].height,
            }}
          >
            <div ref={setMotionRef(4)} data-testid="about-motion-block-4" className={styles.blockSurface}>
                <h2 className={styles.title}>Passions</h2>
                <p className={styles.desc}>Coffee, mechanical keyboards, solving Rubik puzzles, and coding with Lofi beats.</p>
            </div>
          </div>
            </div>
          </div>
        </div>
      </Face>
    )
  }
)

AboutFace.displayName = 'AboutFace'
