import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFaceStore } from './useFaceStore'

describe('face flip gate', () => {
  let releaseFrame: FrameRequestCallback

  beforeEach(() => {
    document.documentElement.classList.remove('rubik-flipping')
    useFaceStore.setState({
      activeFaceId: 'intro',
      previousFaceId: null,
      pendingFaceId: null,
      pendingDirection: null,
      isAnimating: false,
      activeProjectSlug: null,
    })
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      releaseFrame = callback
      return 1
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the gate closed until the next browser frame', () => {
    useFaceStore.getState().startFlip('about', 'left')
    useFaceStore.getState().completeFlip('about')

    expect(useFaceStore.getState().activeFaceId).toBe('about')
    expect(document.documentElement).toHaveClass('rubik-flipping')

    releaseFrame(16)

    expect(document.documentElement).not.toHaveClass('rubik-flipping')
  })

  it('does not let a prior release frame unseal a newer flip', () => {
    const frames = new Map<number, FrameRequestCallback>()
    let frameId = 0

    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frameId += 1
      frames.set(frameId, callback)
      return frameId
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => {
      frames.delete(id)
    }))

    useFaceStore.getState().startFlip('about', 'left')
    useFaceStore.getState().completeFlip('about')

    const staleRelease = frames.get(1)
    expect(staleRelease).toBeDefined()

    useFaceStore.getState().startFlip('skills', 'right')

    staleRelease?.(16)

    expect(document.documentElement).toHaveClass('rubik-flipping')
  })
})
