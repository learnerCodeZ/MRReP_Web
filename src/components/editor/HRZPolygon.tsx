// Ref: Kosaka et al., "MRHaD: Mixed Reality-based Hand-drawn Restricted Zone
// Editing Interface for Mobile Robot Navigation," arXiv:2504.00580, 2025.
// Implements HRZ polygon fill + outline rendering with costmap integration.
import { useMemo } from 'react'
import * as THREE from 'three'
import type { HRZone } from '../../stores/hrzStore'

interface Props {
  zone: HRZone
}

export default function HRZPolygon({ zone }: Props) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    if (zone.points.length === 0) return s
    s.moveTo(zone.points[0].x, -zone.points[0].z)
    for (let i = 1; i < zone.points.length; i++) {
      s.lineTo(zone.points[i].x, -zone.points[i].z)
    }
    s.closePath()
    return s
  }, [zone.points])

  const lineObj = useMemo(() => {
    const pts = zone.points.map((p) => new THREE.Vector3(p.x, 0.05, p.z))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color: '#ff0000' })
    return new THREE.Line(geo, mat)
  }, [zone.points])

  if (zone.points.length < 3) return null

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <primitive object={lineObj} position={[0, 0, 0]} />
    </group>
  )
}
