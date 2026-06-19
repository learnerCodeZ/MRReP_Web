import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useHrpStore } from '../../stores/hrpStore'
import { dist } from '../../utils/coordinate'

interface HRPEditor3DProps {
  robotX: number
  robotZ: number
}

export default function HRPEditor3D({ robotX, robotZ }: HRPEditor3DProps) {
  const path = useHrpStore((s) => s.path)
  const connectorRef = useRef<THREE.Line | null>(null)
  const dashOffset = useRef(0)

  const pathLineObj = useMemo(() => {
    if (path.length < 2) return null
    const pts = path.map((p) => new THREE.Vector3(p.x, 0.05, p.z))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color: '#4caf50', linewidth: 3 })
    return new THREE.Line(geo, mat)
  }, [path])

  const connectorColor = useMemo(() => {
    if (path.length === 0) return '#4caf50'
    const first = path[0]
    const d = dist({ x: robotX, z: robotZ }, { x: first.x, z: first.z })
    return d > 1 ? '#fdd835' : '#4caf50'
  }, [path, robotX, robotZ])

  const connectorLineObj = useMemo(() => {
    if (path.length === 0) return null
    const first = path[0]
    const pts = [
      new THREE.Vector3(robotX, 0.05, robotZ),
      new THREE.Vector3(first.x, 0.05, first.z),
    ]
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({
      color: connectorColor,
      dashSize: 0.2,
      gapSize: 0.1,
      linewidth: 2,
    })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [path, robotX, robotZ, connectorColor])

  useFrame((_, delta) => {
    if (connectorRef.current) {
      const mat = connectorRef.current.material as THREE.LineDashedMaterial
      if (mat.isLineDashedMaterial) {
        dashOffset.current -= delta * 0.5
        ;(mat as any).dashOffset = dashOffset.current
        mat.needsUpdate = true
      }
      connectorRef.current.computeLineDistances()
    }
  })

  if (path.length === 0) return null

  return (
    <group>
      {pathLineObj && <primitive object={pathLineObj} />}
      {connectorLineObj && <primitive object={connectorLineObj} ref={connectorRef} />}
      {path.map((p, i) => (
        <mesh key={i} position={[p.x, 0.05, p.z]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={i === 0 ? '#4caf50' : '#81c784'} />
        </mesh>
      ))}
    </group>
  )
}
