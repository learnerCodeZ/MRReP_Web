// Ref: Kosaka et al., "MRReP," arXiv:2604.00059, 2025 — HRP path data model
import { create } from 'zustand'
import type { Point2D } from './hrzStore'

interface HrpState {
  path: Point2D[]
  robotPos: Point2D | null
  setPath: (p: Point2D[]) => void
  setRobotPos: (p: Point2D | null) => void
  clearPath: () => void
}

export const useHrpStore = create<HrpState>((set) => ({
  path: [],
  robotPos: null,
  setPath: (p) => set({ path: p }),
  setRobotPos: (p) => set({ robotPos: p }),
  clearPath: () => set({ path: [] }),
}))
