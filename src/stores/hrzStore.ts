// Ref: Kosaka et al., "MRHaD," arXiv:2504.00580, 2025 — HRZ zone data model
import { create } from 'zustand'

export interface Point2D {
  x: number
  z: number
}

export interface HRZone {
  id: string
  points: Point2D[]
}

interface HrzState {
  zones: HRZone[]
  currentPoints: Point2D[]
  addPoint: (p: Point2D) => void
  closeZone: () => void
  removeZone: (id: string) => void
  clearAll: () => void
  clearCurrent: () => void
}

export const useHrzStore = create<HrzState>((set, get) => ({
  zones: [],
  currentPoints: [],
  addPoint: (p) => set((s) => ({ currentPoints: [...s.currentPoints, p] })),
  closeZone: () => {
    const { currentPoints, zones } = get()
    if (currentPoints.length < 3) return
    const zone: HRZone = {
      id: crypto.randomUUID(),
      points: [...currentPoints],
    }
    set({ zones: [...zones, zone], currentPoints: [] })
  },
  removeZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),
  clearAll: () => set({ zones: [], currentPoints: [] }),
  clearCurrent: () => set({ currentPoints: [] }),
}))
