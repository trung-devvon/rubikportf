// components/faces/AboutFace.tsx — Mặt ABOUT 3D Blocks (Giai đoạn 3)
import { forwardRef, useState, useEffect } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './AboutFace.module.css'

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

interface BlockLayout {
  left: string
  top: string
  width: string
  height: string
}

type LayoutConfig = [BlockLayout, BlockLayout, BlockLayout, BlockLayout, BlockLayout]

const LAYOUT_PRESETS: LayoutConfig[] = [
  [
    { left: '5%', top: '5%', width: '50%', height: '25%' },
    { left: '60%', top: '5%', width: '35%', height: '55%' },
    { left: '5%', top: '35%', width: '25%', height: '25%' },
    { left: '35%', top: '35%', width: '20%', height: '25%' },
    { left: '5%', top: '65%', width: '90%', height: '30%' }
  ],
  [
    { left: '40%', top: '5%', width: '55%', height: '30%' },
    { left: '5%', top: '5%', width: '30%', height: '60%' },
    { left: '40%', top: '40%', width: '25%', height: '25%' },
    { left: '70%', top: '40%', width: '25%', height: '25%' },
    { left: '40%', top: '70%', width: '55%', height: '25%' }
  ],
  [
    { left: '5%', top: '5%', width: '30%', height: '30%' },
    { left: '40%', top: '5%', width: '55%', height: '30%' },
    { left: '5%', top: '40%', width: '55%', height: '25%' },
    { left: '65%', top: '40%', width: '30%', height: '25%' },
    { left: '5%', top: '70%', width: '90%', height: '25%' }
  ],
  [
    { left: '5%', top: '40%', width: '40%', height: '25%' },
    { left: '50%', top: '5%', width: '45%', height: '35%' },
    { left: '5%', top: '5%', width: '40%', height: '30%' },
    { left: '50%', top: '45%', width: '45%', height: '20%' },
    { left: '5%', top: '70%', width: '90%', height: '25%' }
  ],
  [
    { left: '5%', top: '5%', width: '45%', height: '40%' },
    { left: '55%', top: '5%', width: '40%', height: '40%' },
    { left: '5%', top: '50%', width: '25%', height: '45%' },
    { left: '35%', top: '50%', width: '25%', height: '45%' },
    { left: '65%', top: '50%', width: '30%', height: '45%' }
  ]
]

export const AboutFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()
    const [activePreset, setActivePreset] = useState<number>(0)

    // Layout cycling effect
    useEffect(() => {
      if (!isActive) return

      const interval = setInterval(() => {
        setActivePreset((prev) => {
          let nextIndex = prev
          while (nextIndex === prev) {
            nextIndex = Math.floor(Math.random() * LAYOUT_PRESETS.length)
          }
          return nextIndex
        })
      }, 2000)

      return () => clearInterval(interval)
    }, [isActive])

    const currentLayout = LAYOUT_PRESETS[activePreset]

    return (
      <Face ref={ref} id="about" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.gridContainer}>
          {/* Block 0: ABOUT ME */}
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[0].left, 
              top: currentLayout[0].top, 
              width: `calc(${currentLayout[0].width} - 10px)`, 
              height: `calc(${currentLayout[0].height} - 10px)` 
            }}
          >
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
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[1].left, 
              top: currentLayout[1].top, 
              width: `calc(${currentLayout[1].width} - 10px)`, 
              height: `calc(${currentLayout[1].height} - 10px)` 
            }}
          >
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
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[2].left, 
              top: currentLayout[2].top, 
              width: `calc(${currentLayout[2].width} - 10px)`, 
              height: `calc(${currentLayout[2].height} - 10px)` 
            }}
          >
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
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[3].left, 
              top: currentLayout[3].top, 
              width: `calc(${currentLayout[3].width} - 10px)`, 
              height: `calc(${currentLayout[3].height} - 10px)` 
            }}
          >
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
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[4].left, 
              top: currentLayout[4].top, 
              width: `calc(${currentLayout[4].width} - 10px)`, 
              height: `calc(${currentLayout[4].height} - 10px)` 
            }}
          >
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
