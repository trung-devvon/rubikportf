import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      matches: false,
      media: '',
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }),
    writable: true,
  })
})

import { useFaceStore } from '../../store/useFaceStore'
import { AboutFace } from './AboutFace'
import styles from './AboutFace.module.css'

describe('AboutFace scene gate', () => {
  beforeEach(() => {
    useFaceStore.setState({
      activeFaceId: 'about',
      previousFaceId: null,
      pendingFaceId: null,
      pendingDirection: null,
      isAnimating: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('seals the live permutation layer while a flip is active', () => {
    render(<AboutFace isActive isVisible />)

    expect(screen.getByTestId('about-safe-surface')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('about-live-scene')).toHaveAttribute('data-scene-mode', 'live')

    act(() => useFaceStore.setState({ isAnimating: true }))

    expect(screen.getByTestId('about-live-scene')).toHaveAttribute('data-scene-mode', 'sealed')
  })

  it('keeps the permutation layer sealed when About is inactive', () => {
    render(<AboutFace isActive={false} isVisible />)

    expect(screen.getByTestId('about-live-scene')).toHaveAttribute('data-scene-mode', 'sealed')
  })

  it('keeps layout geometry separate from the block motion layer', () => {
    render(<AboutFace isActive isVisible />)

    for (let index = 0; index < 5; index += 1) {
      const layout = screen.getByTestId(`about-layout-block-${index}`)
      const motion = screen.getByTestId(`about-motion-block-${index}`)

      expect(layout.style.transform).toBe('')
      expect(motion.parentElement).toBe(layout)
    }
  })

  it('keeps the live board directly inside its safe-scene sibling', () => {
    render(<AboutFace isActive isVisible />)

    const safeBoard = screen.getByTestId('about-safe-board')
    const liveScene = screen.getByTestId('about-live-scene')
    const liveBoard = screen.getByTestId('about-live-board')

    expect(safeBoard).toHaveClass(styles.safeBoard)
    expect(liveBoard).toHaveClass(styles.gridContainer)
    expect(liveBoard.parentElement).toBe(liveScene)

    for (let index = 0; index < 5; index += 1) {
      expect(screen.getByTestId(`about-layout-block-${index}`).parentElement).toBe(liveBoard)
    }
  })

  it('renders one flat moving surface per layout block', () => {
    render(<AboutFace isActive isVisible />)

    expect(screen.queryByTestId('about-grid-backplane')).not.toBeInTheDocument()

    for (let index = 0; index < 5; index += 1) {
      const motion = screen.getByTestId(`about-motion-block-${index}`)

      expect(motion).toHaveClass(styles.blockSurface)
      expect(motion.querySelector('[data-testid^="about-block-side-"]')).toBeNull()
    }
  })

  it('keeps editorial hierarchy and navigation controls available while idle', () => {
    render(<AboutFace isActive isVisible />)

    expect(screen.getByText('Creative Developer')).toHaveClass(styles.eyebrow)
    expect(screen.getByRole('button', { name: 'Back to Menu' })).toHaveClass(styles.menuButton)
    expect(screen.getByRole('link', { name: /download cv/i })).toHaveClass(styles.cvBtn)
  })
})
