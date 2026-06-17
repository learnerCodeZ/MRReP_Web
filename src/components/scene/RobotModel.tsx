import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useHrpStore } from '../../stores/hrpStore'

export default function RobotModel() {
  const ref = useRef<THREE.Group>(null)
  const robotPos = useHrpStore((s) => s.robotPos)

  useFrame(() => {
    if (ref.current && robotPos) {
      ref.current.position.set(robotPos.x, 0.15, robotPos.z)
    }
  })

  if (!robotPos) return null

  return (
    <group ref={ref} position={[robotPos.x, 0.15, robotPos.z]}>
      {/* body */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#2196F3" />
      </mesh>
      {/* direction arrow */}
      <mesh position={[0, 0.2, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#FF5722" />
      </mesh>
    </group>
  )
}
