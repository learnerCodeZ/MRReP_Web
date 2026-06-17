import { Canvas } from '@react-three/fiber'
import Sidebar from './components/layout/Sidebar'
import StatusBar from './components/layout/StatusBar'
import Scene3D from './components/scene/Scene3D'

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [10, 15, 10], fov: 50, near: 0.1, far: 500 }}
            gl={{ antialias: true }}
          >
            <Scene3D />
          </Canvas>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
