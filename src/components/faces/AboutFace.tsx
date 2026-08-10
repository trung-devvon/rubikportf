// components/faces/AboutFace.tsx — Mặt ABOUT 3D Blocks (Giai đoạn 3 & 4)
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

// Layout Presets covering 100% of the 3x3 Rubik face with zero overlapping and zero blank spots
const LAYOUT_PRESETS: LayoutConfig[] = [
  // Preset 0
  [
    { left: '0%', top: '0%', width: '66.666%', height: '33.333%' },    // Block 0: ABOUT ME (2x1)
    { left: '66.666%', top: '0%', width: '33.333%', height: '66.666%' }, // Block 1: MY STORY (1x2)
    { left: '0%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 2: MISSION (1x1)
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 3: MINDSET (1x1)
    { left: '0%', top: '66.666%', width: '100%', height: '33.333%' }    // Block 4: PASSIONS (3x1)
  ],
  // Preset 1
  [
    { left: '33.333%', top: '0%', width: '66.666%', height: '33.333%' }, // Block 0: ABOUT ME (2x1 shifted right)
    { left: '0%', top: '0%', width: '33.333%', height: '66.666%' },    // Block 1: MY STORY (1x2 shifted left)
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 2: MISSION (1x1 center)
    { left: '66.666%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 3: MINDSET (1x1 right)
    { left: '0%', top: '66.666%', width: '100%', height: '33.333%' }    // Block 4: PASSIONS (3x1)
  ],
  // Preset 2
  [
    { left: '0%', top: '0%', width: '33.333%', height: '100%' },       // Block 0: ABOUT ME (1x3 vertical)
    { left: '33.333%', top: '0%', width: '66.666%', height: '33.333%' }, // Block 1: MY STORY (2x1)
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 2: MISSION (1x1)
    { left: '66.666%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 3: MINDSET (1x1)
    { left: '33.333%', top: '66.666%', width: '66.666%', height: '33.333%' }  // Block 4: PASSIONS (2x1)
  ],
  // Preset 3
  [
    { left: '0%', top: '0%', width: '66.666%', height: '33.333%' },    // Block 0: ABOUT ME (2x1)
    { left: '66.666%', top: '0%', width: '33.333%', height: '100%' },   // Block 1: MY STORY (1x3 vertical)
    { left: '0%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 2: MISSION (1x1)
    { left: '33.333%', top: '33.333%', width: '33.333%', height: '33.333%' }, // Block 3: MINDSET (1x1)
    { left: '0%', top: '66.666%', width: '66.666%', height: '33.333%' }   // Block 4: PASSIONS (2x1)
  ],
  // Preset 4
  [
    { left: '0%', top: '0%', width: '33.333%', height: '66.666%' },    // Block 0: ABOUT ME (1x2)
    { left: '33.333%', top: '0%', width: '33.333%', height: '66.666%' }, // Block 1: MY STORY (1x2)
    { left: '66.666%', top: '0%', width: '33.333%', height: '66.666%' }, // Block 2: MISSION (1x2)
    { left: '0%', top: '66.666%', width: '66.666%', height: '33.333%' },  // Block 3: MINDSET (2x1)
    { left: '66.666%', top: '66.666%', width: '33.333%', height: '33.333%' } // Block 4: PASSIONS (1x1)
  ]
]

export const AboutFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()
    const [activePreset, setActivePreset] = useState<number>(0)
    const [isSwapping, setIsSwapping] = useState<boolean>(false)

    // Layout cycle effect
    useEffect(() => {
      if (!isActive) return

      const interval = setInterval(() => {
        setIsSwapping(true)
        setActivePreset((prev) => {
          let nextIndex = prev
          while (nextIndex === prev) {
            nextIndex = Math.floor(Math.random() * LAYOUT_PRESETS.length)
          }
          return nextIndex
        })
        
        // Swapping animation finishes in 600ms
        const timeout = setTimeout(() => {
          setIsSwapping(false)
        }, 600)
        
        return () => clearTimeout(timeout)
      }, 2500) // 2.5 seconds total (0.6s move, 1.9s pause to read)

      return () => clearInterval(interval)
    }, [isActive])

    // Parallax tilt mousemove handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      
      const tiltX = (x / (rect.width / 2)) * 6 // max 6deg horizontal offset
      const tiltY = -(y / (rect.height / 2)) * 6 // max 6deg vertical offset
      
      e.currentTarget.style.setProperty('--tilt-x', `${tiltX}deg`)
      e.currentTarget.style.setProperty('--tilt-y', `${tiltY}deg`)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.setProperty('--tilt-x', '0deg')
      e.currentTarget.style.setProperty('--tilt-y', '0deg')
    }

    const currentLayout = LAYOUT_PRESETS[activePreset]

    // Returns unique 3D transform during swapping state to make them cross layers
    const getBlockTransform = (index: number) => {
      if (!isSwapping) return 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1)'
      
      switch (index) {
        case 0:
          return 'translateZ(50px) rotateX(8deg) rotateY(-8deg) scale(1.02)' // Lift high
        case 1:
          return 'translateZ(-40px) scale(0.93)' // Sink deep
        case 2:
          return 'translateZ(35px) rotateY(12deg) scale(1.01)' // Lift & tilt Y
        case 3:
          return 'translateZ(-30px) scale(0.95)' // Sink
        case 4:
          return 'translateZ(40px) rotateX(-8deg) scale(1.02)' // Lift mid
        default:
          return 'translateZ(0px)'
      }
    }

    return (
      <Face ref={ref} id="about" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div 
          className={styles.gridContainer}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Block 0: ABOUT ME (Terracotta) */}
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[0].left, 
              top: currentLayout[0].top, 
              width: currentLayout[0].width, 
              height: currentLayout[0].height,
              transform: getBlockTransform(0)
            }}
          >
            <div className={styles.box3dInner}>
              <div className={`${styles.face} ${styles.front} ${styles.colorAbout}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                  <h2 className={styles.title} style={{ margin: 0 }}>About Me</h2>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      startFlip('menu', 'right')
                    }}
                    style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '10px', 
                      color: 'rgba(255, 255, 255, 0.75)',
                      cursor: 'pointer',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '3px 10px',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      textTransform: 'uppercase'
                    }}
                    aria-label="Back to Menu"
                  >
                    ← Menu
                  </button>
                </div>
                <p className={styles.desc}>Nguyen Dinh Trung — Creative Developer dedicated to crafting immersive, high-performance digital interfaces.</p>
                <a 
                  href="/cv.pdf" 
                  download 
                  className={styles.cvBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  Download CV
                </a>
              </div>
              <div className={`${styles.face} ${styles.back}`}></div>
              <div className={`${styles.face} ${styles.top}`}></div>
              <div className={`${styles.face} ${styles.bottom}`}></div>
              <div className={`${styles.face} ${styles.left}`}></div>
              <div className={`${styles.face} ${styles.right}`}></div>
            </div>
          </div>

          {/* Block 1: MY STORY (Mustard, Dark Text) */}
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[1].left, 
              top: currentLayout[1].top, 
              width: currentLayout[1].width, 
              height: currentLayout[1].height,
              transform: getBlockTransform(1)
            }}
          >
            <div className={styles.box3dInner}>
              <div className={`${styles.face} ${styles.front} ${styles.colorStory} ${styles.darkText}`} style={{ justifyContent: 'flex-start' }}>
                <h2 className={styles.title}>My Story</h2>
                <p className={styles.desc}>Based in Hanoi, I build responsive web applications from concept to deployment. I specialize in frontend design architecture and smooth transitions.</p>
              </div>
              <div className={`${styles.face} ${styles.back}`}></div>
              <div className={`${styles.face} ${styles.top}`}></div>
              <div className={`${styles.face} ${styles.bottom}`}></div>
              <div className={`${styles.face} ${styles.left}`}></div>
              <div className={`${styles.face} ${styles.right}`}></div>
            </div>
          </div>

          {/* Block 2: MISSION (Sage) */}
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[2].left, 
              top: currentLayout[2].top, 
              width: currentLayout[2].width, 
              height: currentLayout[2].height,
              transform: getBlockTransform(2)
            }}
          >
            <div className={styles.box3dInner}>
              <div className={`${styles.face} ${styles.front} ${styles.colorMission}`}>
                <h2 className={styles.title}>Mission</h2>
                <p className={styles.desc}>Empower web design with premium animations and clean structures.</p>
              </div>
              <div className={`${styles.face} ${styles.back}`}></div>
              <div className={`${styles.face} ${styles.top}`}></div>
              <div className={`${styles.face} ${styles.bottom}`}></div>
              <div className={`${styles.face} ${styles.left}`}></div>
              <div className={`${styles.face} ${styles.right}`}></div>
            </div>
          </div>

          {/* Block 3: MINDSET (Cream Warm, Dark Text) */}
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[3].left, 
              top: currentLayout[3].top, 
              width: currentLayout[3].width, 
              height: currentLayout[3].height,
              transform: getBlockTransform(3)
            }}
          >
            <div className={styles.box3dInner}>
              <div className={`${styles.face} ${styles.front} ${styles.colorMindset} ${styles.darkText}`}>
                <h2 className={styles.title}>Mindset</h2>
                <p className={styles.desc}>Code is clean, layouts are kinetic. I aim for perfect rendering.</p>
              </div>
              <div className={`${styles.face} ${styles.back}`}></div>
              <div className={`${styles.face} ${styles.top}`}></div>
              <div className={`${styles.face} ${styles.bottom}`}></div>
              <div className={`${styles.face} ${styles.left}`}></div>
              <div className={`${styles.face} ${styles.right}`}></div>
            </div>
          </div>

          {/* Block 4: PASSIONS (Blue/Dark) */}
          <div 
            className={styles.box3d} 
            style={{ 
              left: currentLayout[4].left, 
              top: currentLayout[4].top, 
              width: currentLayout[4].width, 
              height: currentLayout[4].height,
              transform: getBlockTransform(4)
            }}
          >
            <div className={styles.box3dInner}>
              <div className={`${styles.face} ${styles.front} ${styles.colorPassions}`}>
                <h2 className={styles.title}>Passions</h2>
                <p className={styles.desc}>Coffee, mechanical keyboards, solving Rubik puzzles, and coding with Lofi beats.</p>
              </div>
              <div className={`${styles.face} ${styles.back}`}></div>
              <div className={`${styles.face} ${styles.top}`}></div>
              <div className={`${styles.face} ${styles.bottom}`}></div>
              <div className={`${styles.face} ${styles.left}`}></div>
              <div className={`${styles.face} ${styles.right}`}></div>
            </div>
          </div>
        </div>
      </Face>
    )
  }
)

AboutFace.displayName = 'AboutFace'
