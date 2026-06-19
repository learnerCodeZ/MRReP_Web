import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec2 } from '../../utils/coordinate'

interface NavPathVisualProps {
  path: Vec2[]
  color?: string
}

export default function NavPathVisual({ path, color = '#ff4081' }: NavPathVisualProps) {
  const lineObj = useMemo(() => {
    if (path.length < 2) return null
    const pts = path.map((p) => new THREE.Vector3(p.x, 0.05, p.z))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 })
    return new THREE.Line(geo, mat)
  }, [path, color])

  if (path.length < 2) return null

  return (
    <group>
      {lineObj && <primitive object={lineObj} />}
      {path.map((p, i) => {
        if (i === 0 || i === path.length - 1) return null
        return (
          <mesh key={i} position={[p.x, 0.05, p.z]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}
