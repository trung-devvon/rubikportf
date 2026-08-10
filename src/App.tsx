// App.tsx — Root component
// Quản lý: Preloader → Portfolio (FaceContainer với 6 faces)

import { useState, useRef, useEffect } from 'react'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'

// Core
import { FaceContainer } from './components/core/FaceContainer'
import { FaceFlipController } from './components/core/FaceFlipController'
import { Preloader } from './components/core/Preloader'
import { ProjectDetailOverlay } from './components/project-detail/ProjectDetailOverlay'

// Faces
import { IntroFace }    from './components/faces/IntroFace'
import { MenuFace }     from './components/faces/MenuFace'
import { AboutFace }    from './components/faces/AboutFace'
import { SkillsFace }   from './components/faces/SkillsFace'
import { ProjectsFace } from './components/faces/ProjectsFace'
import { ContactFace }  from './components/faces/ContactFace'

// Store & Config
import { useFaceStore } from './store/useFaceStore'
import type { FaceId, FlipDirection } from './config/faces.config'

// GSAP init — import once here
import './lib/gsap'

function PortfolioApp() {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const isFirstMount = useRef(true)

  const {
    activeFaceId,
    previousFaceId,
    pendingFaceId,
    activeProjectSlug,
    openProject,
    closeProject,
    startFlip,
    isAnimating,
  } = useFaceStore()

  const location = useLocation()
  const navigate = useNavigate()

  // Đồng bộ từ URL vào Zustand Store
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    if (pathParts[0] === 'projects' && pathParts[1]) {
      const slug = pathParts[1]
      if (activeProjectSlug !== slug) {
        openProject(slug)
      }
      if (isFirstMount.current) {
        // Tải trang lần đầu, hiển thị ngay mặt projects mà không chạy flip animation
        useFaceStore.setState({ activeFaceId: 'projects' })
      } else {
        // Nếu chuyển URL bình thường, lật từ mặt hiện tại sang Projects
        if (activeFaceId !== 'projects' && pendingFaceId !== 'projects') {
          startFlip('projects', 'bottom')
        }
      }
    } else if (location.pathname === '/') {
      if (activeProjectSlug) {
        closeProject()
      }
    }
    isFirstMount.current = false
  }, [location.pathname])

  // Đồng bộ từ Zustand Store ra URL
  useEffect(() => {
    if (activeProjectSlug) {
      if (location.pathname !== `/projects/${activeProjectSlug}`) {
        navigate(`/projects/${activeProjectSlug}`)
      }
    } else {
      if (location.pathname !== '/') {
        navigate('/')
      }
    }
  }, [activeProjectSlug, navigate, location.pathname])

  // Xử lý cuộn chuột và vuốt màn hình kéo thả để quay Rubik 6 mặt liên tục
  useEffect(() => {
    if (!preloaderDone || isAnimating || activeProjectSlug) return

    // Bản đồ điều hướng 3D vòng lặp khép kín 4 hướng cho 6 mặt
    const faceTransitions: Record<FaceId, {
      up: { target: FaceId; direction: FlipDirection }
      down: { target: FaceId; direction: FlipDirection }
      left: { target: FaceId; direction: FlipDirection }
      right: { target: FaceId; direction: FlipDirection }
    }> = {
      intro: {
        up:    { target: 'contact',  direction: 'top' },
        down:  { target: 'menu',     direction: 'bottom' },
        left:  { target: 'about',    direction: 'left' },
        right: { target: 'skills',   direction: 'right' },
      },
      menu: {
        up:    { target: 'intro',    direction: 'top' },
        down:  { target: 'projects', direction: 'bottom' },
        left:  { target: 'about',    direction: 'left' },
        right: { target: 'skills',   direction: 'right' },
      },
      projects: {
        up:    { target: 'menu',     direction: 'top' },
        down:  { target: 'contact',  direction: 'bottom' },
        left:  { target: 'about',    direction: 'left' },
        right: { target: 'skills',   direction: 'right' },
      },
      about: {
        up:    { target: 'intro',    direction: 'top' },
        down:  { target: 'projects', direction: 'bottom' },
        left:  { target: 'contact',  direction: 'left' },
        right: { target: 'menu',     direction: 'right' },
      },
      skills: {
        up:    { target: 'intro',    direction: 'top' },
        down:  { target: 'projects', direction: 'bottom' },
        left:  { target: 'menu',     direction: 'left' },
        right: { target: 'contact',  direction: 'right' },
      },
      contact: {
        up:    { target: 'projects', direction: 'top' },
        down:  { target: 'intro',    direction: 'bottom' },
        left:  { target: 'skills',   direction: 'left' },
        right: { target: 'about',    direction: 'right' },
      },
    }

    let startX = 0
    let startY = 0
    let isDragging = false

    const handleWheel = (e: WheelEvent) => {
      // Ngăn chặn sự kiện nhạy quá mức hoặc khi đang chạy animation
      if (useFaceStore.getState().isAnimating) return

      const threshold = 40
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)

      if (absX < threshold && absY < threshold) return

      const transitions = faceTransitions[activeFaceId]
      if (!transitions) return

      if (absY > absX) {
        // Cuộn dọc
        if (e.deltaY > threshold) {
          // Cuộn xuống -> Mặt tiếp theo ở dưới
          startFlip(transitions.down.target, transitions.down.direction)
        } else if (e.deltaY < -threshold) {
          // Cuộn lên -> Mặt tiếp theo ở trên
          startFlip(transitions.up.target, transitions.up.direction)
        }
      } else {
        // Cuộn ngang
        if (e.deltaX > threshold) {
          // Cuộn sang phải -> Mặt tiếp theo bên phải
          startFlip(transitions.right.target, transitions.right.direction)
        } else if (e.deltaX < -threshold) {
          // Cuộn sang trái -> Mặt tiếp theo bên trái
          startFlip(transitions.left.target, transitions.left.direction)
        }
      }
    }

    // Thiết lập kéo thả (Drag) bằng Chuột & Swipe bằng Cảm ứng
    const onDragStart = (x: number, y: number) => {
      startX = x
      startY = y
      isDragging = true
      document.body.style.cursor = 'grabbing'
    }

    const onDragEnd = (endX: number, endY: number) => {
      if (!isDragging) return
      isDragging = false
      document.body.style.cursor = ''

      if (useFaceStore.getState().isAnimating) return

      const diffX = endX - startX
      const diffY = endY - startY
      const minDistance = 50

      const absDiffX = Math.abs(diffX)
      const absDiffY = Math.abs(diffY)

      if (absDiffX < minDistance && absDiffY < minDistance) return

      const transitions = faceTransitions[activeFaceId]
      if (!transitions) return

      if (absDiffX > absDiffY) {
        // Kéo ngang
        if (diffX > minDistance) {
          // Kéo từ trái sang phải -> Xem mặt bên trái
          startFlip(transitions.left.target, transitions.left.direction)
        } else if (diffX < -minDistance) {
          // Kéo từ phải sang trái -> Xem mặt bên phải
          startFlip(transitions.right.target, transitions.right.direction)
        }
      } else {
        // Kéo dọc
        if (diffY > minDistance) {
          // Kéo từ trên xuống dưới -> Xem mặt bên trên
          startFlip(transitions.up.target, transitions.up.direction)
        } else if (diffY < -minDistance) {
          // Kéo từ dưới lên trên -> Xem mặt bên dưới
          startFlip(transitions.down.target, transitions.down.direction)
        }
      }
    }

    // Đăng ký các sự kiện chuột (desktop drag)
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) return
      onDragStart(e.clientX, e.clientY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      onDragEnd(e.clientX, e.clientY)
    }

    // Đăng ký các sự kiện chạm (mobile swipe)
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) return
      onDragStart(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }

    // Đăng ký sự kiện bàn phím (keydown)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (useFaceStore.getState().isAnimating) return

      // Bỏ qua nếu người dùng đang gõ trong ô văn bản
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const transitions = faceTransitions[activeFaceId]
      if (!transitions) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          startFlip(transitions.up.target, transitions.up.direction)
          break
        case 'ArrowDown':
          e.preventDefault()
          startFlip(transitions.down.target, transitions.down.direction)
          break
        case 'ArrowLeft':
          e.preventDefault()
          startFlip(transitions.left.target, transitions.left.direction)
          break
        case 'ArrowRight':
          e.preventDefault()
          startFlip(transitions.right.target, transitions.right.direction)
          break
        default:
          break
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    // Thêm cursor grab trên màn hình
    document.body.style.cursor = 'grab'

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.cursor = ''
    }
  }, [preloaderDone, activeFaceId, isAnimating, activeProjectSlug, startFlip])

  // Refs cho từng face — FaceFlipController cần để animate
  const faceRefs = {
    intro:    useRef<HTMLDivElement>(null),
    menu:     useRef<HTMLDivElement>(null),
    about:    useRef<HTMLDivElement>(null),
    skills:   useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    contact:  useRef<HTMLDivElement>(null),
  }

  const isVisible = (id: FaceId) =>
    id === activeFaceId || id === previousFaceId || id === pendingFaceId

  const isActive = (id: FaceId) => id === activeFaceId

  return (
    <HelmetProvider>
      {/* SEO */}
      <Helmet>
        <title>Nguyễn Đình Trung — Fullstack Developer</title>
        <meta name="description" content="Portfolio của Nguyễn Đình Trung (Trung Dev) — Fullstack Developer chuyên React, NestJS." />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>

      {/* Preloader — ẩn đi sau khi animation xong */}
      {!preloaderDone && (
        <Preloader
          name="Nguyễn Đình Trung"
          onComplete={() => setPreloaderDone(true)}
        />
      )}

      {/* Main portfolio */}
      <FaceContainer>
        <FaceFlipController faceRefs={faceRefs} />

        <IntroFace    ref={faceRefs.intro}    isActive={isActive('intro')}    isVisible={isVisible('intro')}    />
        <MenuFace     ref={faceRefs.menu}     isActive={isActive('menu')}     isVisible={isVisible('menu')}     />
        <AboutFace    ref={faceRefs.about}    isActive={isActive('about')}    isVisible={isVisible('about')}    />
        <SkillsFace   ref={faceRefs.skills}   isActive={isActive('skills')}   isVisible={isVisible('skills')}   />
        <ProjectsFace ref={faceRefs.projects} isActive={isActive('projects')} isVisible={isVisible('projects')} />
        <ContactFace  ref={faceRefs.contact}  isActive={isActive('contact')}  isVisible={isVisible('contact')}  />
      </FaceContainer>

      {/* Project Detail Overlay */}
      {activeProjectSlug && <ProjectDetailOverlay />}
    </HelmetProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioApp />
    </BrowserRouter>
  )
}
