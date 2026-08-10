// store/useFaceStore.ts — Zustand store quản lý trạng thái navigation
// Đây là nguồn sự thật duy nhất về "đang ở mặt nào"

import { create } from 'zustand'
import type { FaceId, FlipDirection } from '../config/faces.config'

interface FaceState {
  /** Id mặt đang hiển thị */
  activeFaceId: FaceId

  /** Id mặt trước đó (để biết thoát về đâu) */
  previousFaceId: FaceId | null

  /** Id mặt sắp hiển thị trong lúc đang lật */
  pendingFaceId: FaceId | null

  /** Hướng flip của transition đang/sắp chạy */
  pendingDirection: FlipDirection | null

  /** Lock animation — không cho trigger flip khi đang chạy */
  isAnimating: boolean

  /** Project đang mở trong overlay detail (null = đóng) */
  activeProjectSlug: string | null

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Bắt đầu chuyển sang face khác — set pendingDirection và isAnimating */
  startFlip: (targetId: FaceId, direction: FlipDirection) => void

  /** Gọi khi GSAP animation hoàn thành — unlock và cập nhật activeFaceId */
  completeFlip: (targetId: FaceId) => void

  /** Mở project detail overlay */
  openProject: (slug: string) => void

  /** Đóng project detail overlay */
  closeProject: () => void
}

export const useFaceStore = create<FaceState>((set, get) => ({
  activeFaceId: 'intro',
  previousFaceId: null,
  pendingFaceId: null,
  pendingDirection: null,
  isAnimating: false,
  activeProjectSlug: null,

  startFlip: (targetId, direction) => {
    if (get().isAnimating) return  // guard: ignore nếu đang animate
    set((state) => ({
      previousFaceId: state.activeFaceId,
      pendingFaceId: targetId,
      pendingDirection: direction,
      isAnimating: true,
    }))
  },

  completeFlip: (targetId) => {
    set({
      activeFaceId: targetId,
      pendingFaceId: null,
      previousFaceId: null,
      pendingDirection: null,
      isAnimating: false,
    })
  },

  openProject: (slug) => {
    set({ activeProjectSlug: slug })
  },

  closeProject: () => {
    set({ activeProjectSlug: null })
  },
}))
