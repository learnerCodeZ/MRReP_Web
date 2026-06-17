// Ref: Kosaka et al., "MRHaD: Mixed Reality-based Hand-drawn Restricted Zone
// Editing Interface for Mobile Robot Navigation," arXiv:2504.00580, 2025.
// Implements the HRZ polygon drawing interaction from Section III-C.
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useHrzStore } from '../../stores/hrzStore'
import { useGroundRaycast } from '../scene/Scene3D'
import { publishHrzZones } from '../../ros/connection'
import { sceneToRos } from '../../utils/coordinate'
import HRZPolygon from './HRZPolygon'

const CLOSE_THRESHOLD = 0.3

export default function HRZEditor3D() {
  const { zones, currentPoints, addPoint, closeZone } = useHrzStore()
  const raycast = useGroundRaycast()
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const hit = raycast(e.clientX, e.clientY)
      if (!hit) return

      const point = { x: hit.x, z: hit.z }

      if (currentPoints.length >= 3) {
        const first = currentPoints[0]
        const dist = Math.sqrt((point.x - first.x) ** 2 + (point.z - first.z) ** 2)
        if (dist < CLOSE_THRESHOLD) {
          closeZone()
          const allZones = useHrzStore.getState().zones
          const rosZones = allZones.map((z) => ({
            ...z,
            points: z.points.map((p) => sceneToRos(p.x, p.z)),
          }))
          publishHrzZones(JSON.stringify(rosZones))
          return
        }
      }

      addPoint(point)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    return () => canvas.removeEventListener('pointerdown', onPointerDown)
  }, [gl, raycast, currentPoints, addPoint, closeZone])

  const firstPoint = currentPoints[0]

  const currentLineObj = useMemo(() => {
    if (currentPoints.length < 2) return null
    const pts = currentPoints.map((p) => new THREE.Vector3(p.x, 0.05, p.z))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color: '#ffaa00' })
    return new THREE.Line(geo, mat)
  }, [currentPoints])

  return (
    <group>
      {zones.map((z) => (
        <HRZPolygon key={z.id} zone={z} />
      ))}

      {currentPoints.map((p, i) => (
        <mesh key={i} position={[p.x, 0.05, p.z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      ))}

      {currentPoints.length >= 3 && firstPoint && (
        <mesh position={[firstPoint.x, 0.05, firstPoint.z]}>
          <sphereGeometry args={[CLOSE_THRESHOLD, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}

      {currentLineObj && <primitive object={currentLineObj} />}
    </group>
  )
}
