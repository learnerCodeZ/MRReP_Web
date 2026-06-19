import { create } from 'zustand'
import type { Point2D } from './hrzStore'

interface HrpState {
  path: Point2D[]
  isDrawing: boolean
  startDrawing: () => void
  addPoint: (p: Point2D) => void
  finishDrawing: () => void
  cancelDrawing: () => void
  loadPath: (path: Point2D[]) => void
  clearPath: () => void
}

export const useHrpStore = create<HrpState>((set) => ({
  path: [],
  isDrawing: false,

  startDrawing: () => set({ isDrawing: true, path: [] }),

  addPoint: (p) =>
    set((s) => {
      if (!s.isDrawing) return s
      return { path: [...s.path, p] }
    }),

  finishDrawing: () => set({ isDrawing: false }),

  cancelDrawing: () => set({ isDrawing: false, path: [] }),

  loadPath: (path) => set({ path }),

  clearPath: () => set({ path: [], isDrawing: false }),
}))
