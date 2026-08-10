// components/core/Preloader.tsx
// Loading screen — hiện trước khi Intro face xuất hiện
// Animate tên/logo vào, sau đó exit để reveal mặt Intro

import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import styles from './Preloader.module.css'

interface PreloaderProps {
  onComplete: () => void
  name?: string  // tên người dùng, default placeholder
}

export function Preloader({ onComplete, name = 'Your Name' }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nameRef      = useRef<HTMLSpanElement>(null)
  const titleRef     = useRef<HTMLSpanElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)

  // Dùng ref để giữ tham chiếu onComplete mới nhất mà không kích hoạt lại useEffect
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => onCompleteRef.current(),
        delay: 0.2,
      })

      // Phase 1: reveal tên từ trái → phải (mask reveal)
      tl.fromTo(
        nameRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.out' }
      )
      // Phase 2: fade in chức danh
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
      // Pause ngắn để người dùng đọc
      .to({}, { duration: 0.8 })
      // Phase 3: exit — overlay wipe
      .to(overlayRef.current, {
        scaleY: 1,
        transformOrigin: 'bottom',
        duration: 0.6,
        ease: 'power3.inOut',
      })
      .to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.in',
        },
        '-=0.1'
      )
    })

    return () => ctx.revert()
  }, []) // Chỉ chạy 1 lần duy nhất khi mount

  return (
    <div ref={containerRef} className={styles.preloader} aria-hidden="true">
      <div className={styles.content}>
        <span ref={nameRef} className={styles.name}>
          {name}
        </span>
        <span ref={titleRef} className={styles.title}>
          Creative Developer
          {/* TODO: thay bằng chức danh thật */}
        </span>
      </div>

      {/* Exit overlay wipe */}
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{ transform: 'scaleY(0)' }}
      />
    </div>
  )
}
