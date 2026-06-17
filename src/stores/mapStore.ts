import { create } from 'zustand'

export interface MapInfo {
  originX: number
  originY: number
  resolution: number
  width: number
  height: number
  data: Int8Array | null
}

interface MapState extends MapInfo {
  setMap: (info: MapInfo) => void
}

export const useMapStore = create<MapState>((set) => ({
  originX: 0,
  originY: 0,
  resolution: 0.05,
  width: 0,
  height: 0,
  data: null,
  setMap: (info) => set(info),
}))
