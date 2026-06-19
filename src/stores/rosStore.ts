import { create } from 'zustand'

export type EditMode = 'navigate' | 'hrz' | 'hrp' | 'mapedit'

interface RosState {
  url: string
  connected: boolean
  connecting: boolean
  error: string | null
  editMode: EditMode
  isMock: boolean
  setUrl: (url: string) => void
  setConnected: (v: boolean) => void
  setConnecting: (v: boolean) => void
  setError: (err: string | null) => void
  setEditMode: (mode: EditMode) => void
  setMock: (mock: boolean) => void
}

export const useRosStore = create<RosState>((set) => ({
  url: 'ws://localhost:9090',
  connected: false,
  connecting: false,
  error: null,
  editMode: 'navigate',
  isMock: false,
  setUrl: (url) => set({ url }),
  setConnected: (v) => set({ connected: v, connecting: false }),
  setConnecting: (v) => set({ connecting: v }),
  setError: (err) => set({ error: err, connecting: false, connected: false }),
  setEditMode: (mode) => set({ editMode: mode }),
  setMock: (isMock) => set({ isMock }),
}))
