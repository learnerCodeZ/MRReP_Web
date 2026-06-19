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
  isDrawing: boolean
  addPoint: (p: Point2D) => void
  closeZone: () => void
  cancelDrawing: () => void
  removeZone: (id: string) => void
  loadZones: (zones: HRZone[]) => void
  clearAll: () => void
  clearCurrent: () => void
}

export const useHrzStore = create<HrzState>((set, get) => ({
  zones: [],
  currentPoints: [],
  isDrawing: false,

  addPoint: (p) => {
    const { currentPoints, isDrawing } = get()
    if (!isDrawing) {
      set({ isDrawing: true, currentPoints: [p] })
      return
    }
    const first = currentPoints[0]
    if (currentPoints.length >= 3 && first) {
      const dx = p.x - first.x
      const dz = p.z - first.z
      if (Math.sqrt(dx * dx + dz * dz) < 0.3) {
        get().closeZone()
        return
      }
    }
    set({ currentPoints: [...currentPoints, p] })
  },

  closeZone: () => {
    const { currentPoints, zones } = get()
    if (currentPoints.length < 3) return
    const zone: HRZone = {
      id: crypto.randomUUID(),
      points: [...currentPoints],
    }
    set({ zones: [...zones, zone], currentPoints: [], isDrawing: false })
  },

  cancelDrawing: () => set({ currentPoints: [], isDrawing: false }),

  removeZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),

  loadZones: (zones) => set({ zones }),

  clearAll: () => set({ zones: [], currentPoints: [], isDrawing: false }),

  clearCurrent: () => set({ currentPoints: [] }),
}))
