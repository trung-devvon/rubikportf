// config/faces.config.ts — Central config cho toàn bộ hệ thống flip
// Đây là nguồn sự thật duy nhất (single source of truth) về:
//   - Mỗi mặt là gì
//   - Hướng lật vào (flipFrom) — dùng để set transform-origin + trục xoay
//   - Các ô (cells) trong mặt đó

export type FlipDirection = 'top' | 'bottom' | 'left' | 'right'
export type FaceId = 'intro' | 'menu' | 'about' | 'skills' | 'projects' | 'contact'
export type CellSize = 'sm' | 'md' | 'lg'

export interface CellConfig {
  id: string
  gridArea?: string           // CSS grid-area name, khớp với class trong bento.css
  size: CellSize
  title: string
  subtitle?: string
  image?: string              // path từ /public, e.g. '/assets/avatar.jpg'
  accentColor?: string        // CSS var hoặc hex
  accentClass?: string        // CSS class variant, e.g. 'bento-cell--terracotta'
  linkTo?: FaceId             // id của face khác (menu cell → face destination)
  projectSlug?: string        // dùng cho project cells, e.g. 'cv-builder'
}

export interface FaceConfig {
  id: FaceId
  /** Hướng mặt này flip VÀO khi được kích hoạt.
   *  - 'top'    → nội dung trượt/lật từ trên xuống (rotateX từ -90→0)
   *  - 'bottom' → từ dưới lên (rotateX từ 90→0)
   *  - 'left'   → từ trái sang (rotateY từ -90→0)
   *  - 'right'  → từ phải sang (rotateY từ 90→0)
   */
  flipFrom: FlipDirection
  /** Id của face mà nút "Về Menu" sẽ quay về. Thường là 'menu', trừ Intro. */
  backTo?: FaceId
  cells: CellConfig[]
}

// ── Face configs ─────────────────────────────────────────────────────────────


export const faces: FaceConfig[] = [
  // ── INTRO ──────────────────────────────────────────────────────────────────
  {
    id: 'intro',
    flipFrom: 'top',   // Intro luôn là mặt đầu — không flip vào từ đâu, dùng cho Preloader exit
    cells: [
      {
        id: 'intro-main',
        size: 'lg',
        title: 'Nguyễn Đình Trung',
        subtitle: 'Fullstack Developer',
      },
      {
        id: 'intro-cta',
        size: 'sm',
        title: 'Mở Menu',
        linkTo: 'menu',
      },
    ],
  },

  // ── MENU ───────────────────────────────────────────────────────────────────
  {
    id: 'menu',
    flipFrom: 'top',   // Menu flip vào từ trên (từ Intro → Menu)
    cells: [
      {
        id: 'menu-about',
        gridArea: 'about',
        size: 'lg',
        title: 'About',
        subtitle: 'Người sau màn hình',
        accentClass: 'bento-cell--terracotta',
        linkTo: 'about',
      },
      {
        id: 'menu-skills',
        gridArea: 'skills',
        size: 'md',
        title: 'Skills',
        subtitle: 'Công cụ & kỹ năng',
        accentClass: 'bento-cell--mustard',
        linkTo: 'skills',
      },
      {
        id: 'menu-projects',
        gridArea: 'projects',
        size: 'md',
        title: 'Projects',
        subtitle: 'Những thứ đã build',
        accentClass: 'bento-cell--sage',
        linkTo: 'projects',
      },
      {
        id: 'menu-contact',
        gridArea: 'contact',
        size: 'sm',
        title: 'Contact',
        subtitle: 'Liên hệ',
        accentClass: 'bento-cell--frame',
        linkTo: 'contact',
      },
    ],
  },

  // ── ABOUT ──────────────────────────────────────────────────────────────────
  {
    id: 'about',
    flipFrom: 'left',  // About ở bên trái Menu → flip vào từ trái
    backTo: 'menu',
    cells: [
      {
        id: 'about-avatar',
        gridArea: 'avatar',
        size: 'lg',
        title: 'Nguyễn Đình Trung',
        image: '/assets/trung.jpg',
        accentClass: 'bento-cell--terracotta',
      },
      {
        id: 'about-meta',
        gridArea: 'meta',
        size: 'md',
        title: 'Web Dev',
        subtitle: 'Chuyên môn chính',
      },
      {
        id: 'about-tools',
        gridArea: 'tools',
        size: 'sm',
        title: 'React · NestJS · TypeScript',
        subtitle: 'Stack yêu thích',
      },
    ],
  },

  // ── SKILLS ─────────────────────────────────────────────────────────────────
  {
    id: 'skills',
    flipFrom: 'right', // Skills ở bên phải Menu → flip vào từ phải
    backTo: 'menu',
    cells: [
      {
        id: 'skills-header',
        gridArea: 'header',
        size: 'lg',
        title: 'Technical Skills',
        subtitle: 'Frontend · Backend · Database',
        accentClass: 'bento-cell--mustard',
      },
      {
        id: 'skills-react',
        gridArea: 'react',
        size: 'md',
        title: 'React / Next.js',
        subtitle: 'TypeScript · Vite · CSS Modules',
      },
      {
        id: 'skills-nest',
        gridArea: 'nest',
        size: 'md',
        title: 'NestJS / Node.js',
        subtitle: 'PostgreSQL · MongoDB · REST APIs',
      },
      {
        id: 'skills-ai',
        gridArea: 'ai',
        size: 'md',
        title: 'Tools & DevOps',
        subtitle: 'Git · Docker · AI Tooling (Cursor/Gemini)',
      },
    ],
  },

  // ── PROJECTS ───────────────────────────────────────────────────────────────
  {
    id: 'projects',
    flipFrom: 'bottom', // Projects ở dưới Menu → flip lên từ dưới
    backTo: 'menu',
    cells: [
      {
        id: 'project-cv-builder',
        size: 'lg',
        title: 'CV Builder',
        subtitle: 'SaaS xây CV kéo-thả',
        image: '/assets/projects/cv-builder-cover.png',
        accentClass: 'bento-cell--sage',
        projectSlug: 'cv-builder',
      },
      {
        id: 'project-nova-homestay',
        size: 'lg',
        title: 'Nova Homestay',
        subtitle: 'Nền tảng quản lý lưu trú',
        image: '/assets/projects/lodging.png',
        accentClass: 'bento-cell--terracotta',
        projectSlug: 'nova-homestay',
      },
    ],
  },

  // ── CONTACT ────────────────────────────────────────────────────────────────
  {
    id: 'contact',
    flipFrom: 'top',   // Contact tiếp nối trục dọc Intro→Menu→Contact
    backTo: 'menu',
    cells: [
      {
        id: 'contact-main',
        size: 'lg',
        title: "Let's build something.",
        subtitle: 'ngdinhtrungg.01@gmail.com',
        accentClass: 'bento-cell--frame',
      },
    ],
  },
]

// ── Lookup helper ─────────────────────────────────────────────────────────────

/** Tìm FaceConfig theo id — throw nếu không tìm thấy */
export function getFaceConfig(id: FaceId): FaceConfig {
  const face = faces.find((f) => f.id === id)
  if (!face) throw new Error(`FaceConfig not found for id: "${id}"`)
  return face
}

/** Lấy hướng flip ngược lại (để thoát về menu đúng hướng) */
export function getExitDirection(flipFrom: FlipDirection): FlipDirection {
  const map: Record<FlipDirection, FlipDirection> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }
  return map[flipFrom]
}

