// components/faces/MenuFace.tsx — Mặt MENU bento 4 ô
import { forwardRef } from 'react'
import { Face } from '../core/Face'
import { useFaceStore } from '../../store/useFaceStore'
import type { FaceId, FlipDirection } from '../../config/faces.config'
import styles from './MenuFace.module.css'

const AboutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.cellIcon}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SkillsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.cellIcon}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const ProjectsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.cellIcon}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const ContactIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.cellIcon}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

interface MenuItem {
  id: FaceId
  direction: FlipDirection
  label: string
  title: string
  subtitle: string
  className: string
  Icon: () => React.JSX.Element
  arrow: string
}

const menuItems: MenuItem[] = [
  {
    id: 'about',
    direction: 'left',
    label: '01 / ABOUT',
    title: 'Bio & Story',
    subtitle: 'The developer behind the code.',
    className: `${styles.cell} ${styles.cellAbout}`,
    Icon: AboutIcon,
    arrow: '←'
  },
  {
    id: 'skills',
    direction: 'right',
    label: '02 / SKILLS',
    title: 'Technologies',
    subtitle: 'Languages & tools I use.',
    className: `${styles.cell} ${styles.cellSkills}`,
    Icon: SkillsIcon,
    arrow: '→'
  },
  {
    id: 'projects',
    direction: 'bottom',
    label: '03 / PROJECTS',
    title: 'Selected Works',
    subtitle: 'SaaS & web applications.',
    className: `${styles.cell} ${styles.cellProjects}`,
    Icon: ProjectsIcon,
    arrow: '↓'
  },
  {
    id: 'contact',
    direction: 'top',
    label: '04 / CONTACT',
    title: "Let's Connect",
    subtitle: 'Start a conversation.',
    className: `${styles.cell} ${styles.cellContact}`,
    Icon: ContactIcon,
    arrow: '↑'
  }
]

interface FaceComponentProps {
  isActive: boolean
  isVisible: boolean
}

export const MenuFace = forwardRef<HTMLDivElement, FaceComponentProps>(
  ({ isActive, isVisible }, ref) => {
    const { startFlip } = useFaceStore()

    return (
      <Face ref={ref} id="menu" isActive={isActive} isVisible={isVisible} className={styles.faceOverride}>
        <div className={styles.grid}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              id={`menu-${item.id}`}
              className={item.className}
              onClick={() => startFlip(item.id, item.direction)}
              aria-label={`Go to ${item.title}`}
            >
              <div className={styles.stickerInner}>
                <div className={styles.header}>
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.arrow}>{item.arrow}</span>
                </div>
                <div className={styles.body}>
                  <h2 className={styles.title}>{item.title}</h2>
                  <p className={styles.subtitle}>{item.subtitle}</p>
                </div>
                <div className={styles.footer}>
                  <item.Icon />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Face>
    )
  }
)

MenuFace.displayName = 'MenuFace'
