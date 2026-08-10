// components/project-detail/ProjectDetailOverlay.tsx
import { useEffect, useRef, useState } from 'react'
import { useFaceStore } from '../../store/useFaceStore'
import { projects } from '../../config/projects.config'
import styles from './ProjectDetailOverlay.module.css'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'

// Đăng ký Flip plugin trực tiếp để đảm bảo hoạt động độc lập
gsap.registerPlugin(Flip)

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.actionIcon}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.actionIcon}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export function ProjectDetailOverlay() {
  const { activeProjectSlug, closeProject } = useFaceStore()
  const [isClosing, setIsClosing] = useState(false)
  const [detailsVisible, setDetailsVisible] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLImageElement>(null)

  const project = projects.find((p) => p.slug === activeProjectSlug)

  // Flip Enter Animation
  useEffect(() => {
    if (!project) return

    setIsClosing(false)
    setDetailsVisible(false)

    // Tìm element ảnh bìa card gốc trong ProjectsFace
    const originalImg = document.querySelector(`#project-card-${project.slug} img`) as HTMLElement
    if (!originalImg || !bannerRef.current) {
      setDetailsVisible(true)
      return
    }

    // Lấy trạng thái của ảnh bìa gốc
    const state = Flip.getState(originalImg)

    // Ẩn tạm thời ảnh bìa gốc để tránh nhân đôi phần tử lúc lướt bay
    gsap.set(originalImg, { opacity: 0 })

    // Chạy Flip phóng to lên thành bannerRef lớn trong overlay
    Flip.from(state, {
      duration: 0.6,
      ease: 'power2.out',
      scale: true,
      absolute: true,
      onComplete: () => {
        setDetailsVisible(true)
      },
    })

    // Reset lại style ảnh bìa gốc khi unmount
    return () => {
      gsap.set(originalImg, { opacity: 1 })
    }
  }, [project])

  // Lắng nghe phím ESC để đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project])

  const handleClose = () => {
    if (!project) return

    setIsClosing(true)
    setDetailsVisible(false)

    const originalImg = document.querySelector(`#project-card-${project.slug} img`) as HTMLElement
    if (!originalImg || !bannerRef.current) {
      closeProject()
      return
    }

    // Lấy state của ảnh lớn hiện tại
    const state = Flip.getState(bannerRef.current)

    // Đảm bảo ảnh gốc được hiển thị lại trước khi chạy animation ngược về
    gsap.set(originalImg, { opacity: 1 })

    // Flip từ banner lớn thu nhỏ trở lại vị trí ảnh gốc nhỏ
    Flip.from(state, {
      duration: 0.55,
      ease: 'power2.inOut',
      targets: originalImg,
      scale: true,
      absolute: true,
      onComplete: () => {
        gsap.set(originalImg, { clearProps: 'all' })
        closeProject()
      },
    })
  }

  if (!project) return null

  return (
    <div
      ref={overlayRef}
      className={[
        styles.overlay,
        isClosing ? styles.overlayClosing : ''
      ].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
    >
      <div className={styles.contentWrapper}>
        
        {/* Nút Đóng */}
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Đóng chi tiết dự án"
        >
          <span aria-hidden="true" style={{ fontSize: '20px', fontWeight: 'bold' }}>×</span>
        </button>

        {/* Hero Banner (Nhận GSAP Flip) */}
        <div className={styles.bannerWrapper}>
          <img
            ref={bannerRef}
            src={project.coverImage}
            alt={`Ảnh bìa lớn của ${project.title}`}
            className={styles.bannerImg}
          />
        </div>

        {/* Thông tin Chi tiết */}
        <div
          className={[
            styles.details,
            !detailsVisible ? styles.detailsEntering : ''
          ].filter(Boolean).join(' ')}
        >
          <header className={styles.header}>
            <div className={styles.titleArea}>
              <h1 id="project-detail-title" className={styles.title}>
                {project.title}
              </h1>
              <p className={styles.tagline}>{project.tagline}</p>
            </div>

            {/* CTA Links */}
            <div className={styles.actions}>
              {project.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className={styles.actionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.type === 'github' ? <GithubIcon /> : <ExternalLinkIcon />}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </header>

          {/* Project Specs */}
          <section className={styles.metaInfo}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Role</span>
              <span className={styles.metaValue}>{project.role}</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Year</span>
              <span className={styles.metaValue}>{project.year}</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Technologies</span>
              <div className={styles.techBadgeList}>
                {project.techStack.map((tech) => (
                  <span
                    key={tech.label}
                    className={styles.techBadge}
                    style={{ borderColor: tech.color || 'var(--color-border)' }}
                  >
                    {tech.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features / Details */}
          <section className={styles.bodyText}>
            <h2 className={styles.sectionTitle}>Mô tả chi tiết</h2>
            <p className={styles.descFull}>{project.description}</p>
          </section>

          {/* Realistic Screenshot Gallery */}
          <section className={styles.bodyText}>
            <h2 className={styles.sectionTitle}>Hình ảnh thực tế từ sản phẩm</h2>
            <div className={styles.galleryGrid}>
              {project.gallery.map((image, idx) => (
                <div key={idx} className={styles.galleryCard}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={styles.galleryImg}
                    loading="lazy"
                  />
                  <div className={styles.galleryCaption}>
                    {image.caption} — {image.alt}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
