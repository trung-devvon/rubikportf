// config/projects.config.ts — Data chi tiết từng project
// Dùng cho ProjectDetailOverlay khi expand 1 project từ mặt Projects

export interface TechBadge {
  label: string
  color?: string  // accent màu badge (hex hoặc CSS var)
}

export interface ProjectLink {
  label: string
  url: string
  type: 'demo' | 'github' | 'figma' | 'other'
}

export interface ProjectImage {
  src: string    // path từ /public
  alt: string
  caption?: string
}

export interface ProjectConfig {
  slug: string           // khớp với projectSlug trong faces.config.ts
  title: string
  tagline: string        // 1 dòng ngắn, hiện trong ô Projects
  description: string    // mô tả đầy đủ, hiện trong detail overlay
  role: string           // vai trò của bạn trong project
  year: string           // '2024' hoặc '2023–2024'
  coverImage: string     // path ảnh cover (khớp với faces.config cells.image)
  gallery: ProjectImage[]
  techStack: TechBadge[]
  links: ProjectLink[]
  accentColor: string    // màu chủ của project, dùng cho header detail overlay
}

// ── Projects data ─────────────────────────────────────────────────────────────

export const projects: ProjectConfig[] = [
  {
    slug: 'cv-builder',
    title: 'CV Builder',
    tagline: 'SaaS xây CV kéo-thả',
    description:
      'Ứng dụng SaaS cho phép người dùng tạo CV chuyên nghiệp bằng giao diện kéo-thả trực quan. ' +
      'Hỗ trợ nhiều template, export PDF chất lượng cao, và chia sẻ CV qua link. ' +
      'Được xây dựng với kiến trúc micro-frontend, tích hợp thanh toán subscription.',
    role: 'Fullstack Developer — thiết kế system architecture, build toàn bộ frontend và backend API.',
    year: '2024',
    coverImage: '/assets/projects/cv-builder-cover.png',
    gallery: [
      {
        src: '/assets/projects/cv-builder/detail-1.png',
        alt: 'CV Builder — màn hình editor chính',
        caption: 'Drag & drop editor',
      },
      {
        src: '/assets/projects/cv-builder/detail-2.png',
        alt: 'CV Builder — chọn template',
        caption: 'Template library',
      },
      {
        src: '/assets/projects/cv-builder/detail-3.png',
        alt: 'CV Builder — preview PDF',
        caption: 'PDF preview & export',
      },
    ],
    techStack: [
      { label: 'React', color: '#61DAFB' },
      { label: 'TypeScript', color: '#3178C6' },
      { label: 'NestJS', color: '#E0234E' },
      { label: 'PostgreSQL', color: '#336791' },
      { label: 'Prisma', color: '#2D3748' },
      { label: 'PDF-lib', color: '#5F6E52' },
    ],
    links: [
      { label: 'Live Demo', url: 'https://github.com', type: 'demo' },
      { label: 'GitHub', url: 'https://github.com', type: 'github' },
    ],
    accentColor: 'var(--color-sage)',
  },

  {
    slug: 'nova-homestay',
    title: 'Nova Homestay',
    tagline: 'Nền tảng quản lý lưu trú',
    description:
      'Nền tảng quản lý homestay toàn diện: đặt phòng online, quản lý phòng/giá theo mùa, ' +
      'dashboard doanh thu cho chủ homestay, và app mobile cho nhân viên. ' +
      'Tích hợp thanh toán VNPay và Stripe, gửi email/SMS tự động.',
    role: 'Lead Developer — thiết kế database schema, xây dựng booking engine và dashboard quản trị.',
    year: '2023–2024',
    coverImage: '/assets/projects/lodging.png',
    gallery: [
      {
        src: '/assets/projects/nova-homestay/detail-1.png',
        alt: 'Nova Homestay — trang booking',
        caption: 'Booking flow',
      },
      {
        src: '/assets/projects/nova-homestay/detail-2.png',
        alt: 'Nova Homestay — dashboard quản trị',
        caption: 'Admin dashboard',
      },
      {
        src: '/assets/projects/nova-homestay/detail-3.png',
        alt: 'Nova Homestay — quản lý phòng',
        caption: 'Room management',
      },
    ],
    techStack: [
      { label: 'Next.js', color: '#000000' },
      { label: 'TypeScript', color: '#3178C6' },
      { label: 'Prisma', color: '#2D3748' },
      { label: 'PostgreSQL', color: '#336791' },
      { label: 'Stripe', color: '#635BFF' },
      { label: 'Tailwind CSS', color: '#06B6D4' },
    ],
    links: [
      { label: 'Live Demo', url: 'https://github.com', type: 'demo' },
      { label: 'GitHub', url: 'https://github.com', type: 'github' },
    ],
    accentColor: 'var(--color-terracotta)',
  },
]

// ── Lookup helper ─────────────────────────────────────────────────────────────

/** Tìm ProjectConfig theo slug */
export function getProjectBySlug(slug: string): ProjectConfig | undefined {
  return projects.find((p) => p.slug === slug)
}
