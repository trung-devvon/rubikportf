// components/faces/IntroFace.tsx
// Mặt INTRO — hiện đầu tiên sau Preloader
// Full-bleed: tên, chức danh, tagline + nút "Mở Menu"

import { forwardRef } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import styles from './IntroFace.module.css'

const RubikIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'transform 0.4s ease' }}
  >
    {/* Mặt ngoài khối lập phương */}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    {/* Các đường chia isometric của rubik */}
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
    <polyline points="12 12.01 20.73 6.96 12 2 3.27 6.96 12 12.01" />
  </svg>
)

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

export const IntroFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()

    const handleOpenMenu = () => {
      // Menu flip vào từ TOP (Intro → Menu)
      startFlip('menu', 'top')
    }

    return (
      <Face ref={ref} id="intro" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.grid}>
          {/* Main Info Cell: 2x2 top-left */}
          <div className={`${styles.cell} ${styles.cellMain}`}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>Creative Developer</span>
              <h1 className={styles.name}>
                Nguyễn<br />Đình Trung
              </h1>
              <p className={styles.tagline}>
                Building high-performance web applications with clean code and optimized user experiences.
              </p>
            </div>
          </div>

          {/* Terracotta Decorative Cell: top-right */}
          <div className={`${styles.cell} ${styles.cellTerracotta}`}>
            <div className={styles.stickerInner}>
              <span className={styles.stickerLabel}>PORTFOLIO</span>
              <span className={styles.stickerYear}>©2026</span>
            </div>
          </div>

          {/* Mustard Decorative Cell: middle-right */}
          <div className={`${styles.cell} ${styles.cellMustard}`}>
            <div className={styles.stickerInner}>
              <span className={styles.techLabel}>TypeScript</span>
              <span className={styles.techLabel}>React</span>
              <span className={styles.techLabel}>NestJS</span>
            </div>
          </div>

          {/* CTA Cell: bottom-left (Sage Green) */}
          <button
            id="intro-open-menu"
            className={`${styles.cell} ${styles.cellCta}`}
            onClick={handleOpenMenu}
            aria-label="Explore Menu"
          >
            <div className={styles.ctaContent}>
              <span className={styles.ctaText}>Explore</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                <RubikIcon />
              </span>
            </div>
          </button>

          {/* Location Cell: bottom-middle (Dark Maroon) */}
          <div className={`${styles.cell} ${styles.cellLocation}`}>
            <div className={styles.locationContent}>
              <span className={styles.locationTitle}>LOCATION</span>
              <span className={styles.locationValue}>HANOI, VN</span>
            </div>
          </div>

          {/* Tech/Social Cell: bottom-right */}
          <div className={`${styles.cell} ${styles.cellTech}`}>
            <div className={styles.techContent}>
              <span className={styles.techCode}>const dev = {"{"} code: () =&gt; "craft" {"}"};</span>
            </div>
          </div>
        </div>
      </Face>
    )
  }
)

IntroFace.displayName = 'IntroFace'
