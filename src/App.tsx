import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Sidebar from './components/layout/Sidebar'
import StatusBar from './components/layout/StatusBar'
import Scene3D from './components/scene/Scene3D'
import type { AppMode } from './components/ui/ModeSelector'
import { useHrzStore } from './stores/hrzStore'
import { useHrpStore } from './stores/hrpStore'
import { useRosStore } from './stores/rosStore'
import { save, load } from './utils/persistence'

export default function App() {
  const [mode, setMode] = useState<AppMode>('navigate')
  const hrzZones = useHrzStore((s) => s.zones)
  const hrpPath = useHrpStore((s) => s.path)
  const loadZones = useHrzStore((s) => s.loadZones)
  const loadPath = useHrpStore((s) => s.loadPath)
  const isMock = useRosStore((s) => s.isMock)

  useEffect(() => {
    const data = load()
    if (data) {
      if (data.hrzZones) loadZones(data.hrzZones)
      if (data.hrpPath) loadPath(data.hrpPath)
    }
  }, [])

  useEffect(() => {
    save(hrzZones, hrpPath)
  }, [hrzZones, hrpPath])

  useEffect(() => {
    if (!isMock && mode === 'mapedit') {
      setMode('navigate')
    }
  }, [isMock, mode])

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar mode={mode} onModeChange={setMode} />
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [5, 15, 15], fov: 50, near: 0.1, far: 500 }}
            style={{ background: '#1a1a2e' }}
          >
            <Scene3D mode={mode} />
          </Canvas>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
