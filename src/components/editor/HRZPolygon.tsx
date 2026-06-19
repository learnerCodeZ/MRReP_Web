import * as THREE from 'three'
import { useMemo } from 'react'
import type { Point2D } from '../../stores/hrzStore'

interface HRZPolygonProps {
  points: Point2D[]
  color?: string
  opacity?: number
  closed?: boolean
}

export default function HRZPolygon({ points, color = '#e53935', opacity = 0.3, closed = true }: HRZPolygonProps) {
  if (points.length === 0) return null

  const lineObj = useMemo(() => {
    const linePoints = points.map((v) => new THREE.Vector3(v.x, 0.02, v.z))
    if (closed && points.length >= 3) {
      linePoints.push(new THREE.Vector3(points[0].x, 0.02, points[0].z))
    }
    if (linePoints.length < 2) return null
    const geo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 })
    return new THREE.Line(geo, mat)
  }, [points, closed, color])

  return (
    <group>
      {closed && points.length >= 3 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <shapeGeometry args={[createShape(points)]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} side={2} />
        </mesh>
      )}
      {lineObj && <primitive object={lineObj} />}
      {points.map((v, i) => (
        <mesh key={i} position={[v.x, 0.05, v.z]}>
          <sphereGeometry args={[i === 0 ? 0.12 : 0.08, 16, 16]} />
          <meshBasicMaterial color={i === 0 ? '#fdd835' : color} />
        </mesh>
      ))}
    </group>
  )
}

function createShape(points: Point2D[]): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(points[0].x, -points[0].z)
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, -points[i].z)
  }
  shape.closePath()
  return shape
}
