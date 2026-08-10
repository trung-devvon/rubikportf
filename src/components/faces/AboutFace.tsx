// components/faces/AboutFace.tsx — Mặt ABOUT Scramble & Solve
import { forwardRef, useState, useMemo } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './AboutFace.module.css'

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

interface AboutStickerData {
  label: string
  title: string
  content: string
}

const stickerContents: Record<number, AboutStickerData> = {
  0: { label: 'IDENTITY', title: 'WHO I AM', content: 'Nguyen Dinh Trung, a Creative Developer based in Hanoi. I craft high-performance web experiences.' },
  1: { label: 'MISSION', title: 'MY GOAL', content: 'Blending aesthetics with technical excellence to build websites that feel alive and responsive.' },
  2: { label: 'TECH STACK', title: 'CORE TOOLS', content: 'Expertise in TypeScript, React, Next.js, Node.js, and GSAP for fluid 3D / 2D animations.' },
  3: { label: 'LOCATION', title: 'WHERE', content: 'Hanoi, Vietnam (GMT+7). Available for remote work and interesting global collaborations.' },
  5: { label: 'STATS', title: 'NUMBERS', content: '3+ years of professional development, building 15+ complex web apps and landing pages.' },
  6: { label: 'MINDSET', title: 'PHILOSOPHY', content: 'Clean code is poetry. Perfect layouts are music. I treat design implementation with absolute precision.' },
  7: { label: 'PASSIONS', title: 'DAILY LIFE', content: 'Addicted to specialty coffee, mechanical keyboards, solving Rubik cubes, and Lofi coding beats.' },
  8: { label: 'RESOLVE', title: 'CONTACT', content: 'Let\'s collaborate! Swipe to the CONTACT page to start a conversation or download my resume.' }
}

const hexCodes: Record<number, string> = {
  0: '0x3F', 1: '0x1A', 2: '0x21', 3: '0x3D', 5: '0x0F', 6: '0x15', 7: '0x7A', 8: '0x25'
}

export const AboutFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()

    // Local state for solved status of outer stickers
    const [solvedStickers, setSolvedStickers] = useState<Record<number, boolean>>(() => ({
      0: false,
      1: false,
      2: false,
      3: false,
      5: false,
      6: false,
      7: false,
      8: false
    }))

    // Scrambled colors generated once
    const scrambledColors = useMemo(() => {
      const colorClasses = [
        styles.colorRed,
        styles.colorYellow,
        styles.colorGreen,
        styles.colorCream,
        styles.colorBlue
      ]
      
      const colors: Record<number, string> = {}
      const indices = [0, 1, 2, 3, 5, 6, 7, 8]
      indices.forEach((idx) => {
        colors[idx] = colorClasses[Math.floor(Math.random() * colorClasses.length)]
      })
      return colors
    }, [])

    // Check if all outer stickers are solved
    const isFullySolved = useMemo(() => {
      return Object.values(solvedStickers).every(val => val === true)
    }, [solvedStickers])

    const handleStickerClick = (index: number) => {
      setSolvedStickers((prev) => ({
        ...prev,
        [index]: true
      }))
    }

    const cells = Array.from({ length: 9 }, (_, i) => i)

    return (
      <Face ref={ref} id="about" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={`${styles.grid} ${isFullySolved ? styles.gridSolved : ''}`}>
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
                    {isFullySolved ? (
                      <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cvButton}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download CV
                      </a>
                    ) : (
                      <span className={styles.backLabel}>← Menu</span>
                    )}
                  </div>
                </button>
              )
            }

            const data = stickerContents[index]
            const isSolved = solvedStickers[index]
            const randomColorClass = scrambledColors[index]

            return (
              <div key={index} className={styles.cell} style={{ padding: 0, background: 'transparent' }}>
                <div className={styles.cardContainer}>
                  <div 
                    className={`${styles.cardInner} ${isSolved ? styles.isFlipped : ''}`}
                    onClick={() => !isSolved && handleStickerClick(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        !isSolved && handleStickerClick(index)
                      }
                    }}
                    aria-label={`Sticker ${data.label}`}
                  >
                    {/* Front: Scrambled Color + Hex Code */}
                    <div className={`${styles.cardFront} ${randomColorClass}`}>
                      <span className={styles.hexCode}>{hexCodes[index]}</span>
                      <span className={styles.hoverLabel}>{data.label}</span>
                    </div>
                    
                    {/* Back: Solved Terracotta + Information */}
                    <div className={styles.cardBack}>
                      <span className={styles.cardTitle}>{data.title}</span>
                      <p className={styles.cardText}>{data.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Face>
    )
  }
)

AboutFace.displayName = 'AboutFace'
