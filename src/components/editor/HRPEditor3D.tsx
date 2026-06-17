// Ref: Kosaka et al., "MRReP: Mixed Reality-based Hand-drawn Reference Path
// Editing Interface for Mobile Robot Navigation," arXiv:2604.00059, 2025.
// Implements the HRP freehand path drawing from Section III-C and the
// robot-to-path-start connection (Section III-D).
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useHrpStore } from '../../stores/hrpStore'
import { useGroundRaycast } from '../scene/Scene3D'
import { publishHrpPath } from '../../ros/connection'
import { sceneToRos } from '../../utils/coordinate'

const DASH_SEGMENTS = 20

export default function HRPEditor3D() {
  const { path, robotPos, setPath } = useHrpStore()
  const raycast = useGroundRaycast()
  const { gl } = useThree()
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      drawing.current = true
      const hit = raycast(e.clientX, e.clientY)
      if (hit) {
        setPath([{ x: hit.x, z: hit.z }])
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!drawing.current) return
      const hit = raycast(e.clientX, e.clientY)
      if (hit) {
        const currentPath = useHrpStore.getState().path
        const last = currentPath[currentPath.length - 1]
        if (!last || Math.sqrt((hit.x - last.x) ** 2 + (hit.z - last.z) ** 2) > 0.1) {
          setPath([...currentPath, { x: hit.x, z: hit.z }])
        }
      }
    }

    const onPointerUp = () => {
      if (!drawing.current) return
      drawing.current = false
      const finalPath = useHrpStore.getState().path
      if (finalPath.length >= 2) {
        const now = Math.floor(Date.now() / 1000)
        const pathMsg = {
          header: { seq: 0, stamp: { secs: now, nsecs: 0 }, frame_id: 'map' },
          poses: finalPath.map((p, i) => {
            const ros = sceneToRos(p.x, p.z)
            return {
              header: { seq: i, stamp: { secs: now, nsecs: 0 }, frame_id: 'map' },
              pose: {
                position: { x: ros.x, y: ros.y, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 },
              },
            }
          }),
        }
        publishHrpPath(pathMsg)
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
    }
  }, [gl, raycast, setPath])

  const pathLineObj = useMemo(() => {
    if (path.length < 2) return null
    const pts = path.map((p) => new THREE.Vector3(p.x, 0.05, p.z))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color: '#00ff88' })
    return new THREE.Line(geo, mat)
  }, [path])

  const dashLineObj = useMemo(() => {
    if (!robotPos || path.length === 0) return null
    const start = path[0]
    const dist = Math.sqrt((robotPos.x - start.x) ** 2 + (robotPos.z - start.z) ** 2)
    const color = dist > 1 ? '#ff4444' : '#44ff44'
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= DASH_SEGMENTS; i++) {
      const t = i / DASH_SEGMENTS
      pts.push(
        new THREE.Vector3(
          robotPos.x + (start.x - robotPos.x) * t,
          0.06,
          robotPos.z + (start.z - robotPos.z) * t,
        ),
      )
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.15, gapSize: 0.1 })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [robotPos, path])

  return (
    <group>
      {pathLineObj && <primitive object={pathLineObj} />}

      {path.length > 0 && (
        <mesh position={[path[0].x, 0.05, path[0].z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      )}

      {dashLineObj && <primitive object={dashLineObj} />}
    </group>
  )
}
