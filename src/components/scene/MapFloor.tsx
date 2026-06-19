import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useMapStore } from '../../stores/mapStore'
import { renderMapToCanvas } from '../../utils/mapRenderer'

export default function MapFloor() {
  const data = useMapStore((s) => s.data)
  const width = useMapStore((s) => s.width)
  const height = useMapStore((s) => s.height)
  const resolution = useMapStore((s) => s.resolution)
  const meshRef = useRef<THREE.Mesh>(null)

  const offlineCanvas = useMemo(() => document.createElement('canvas'), [])

  useEffect(() => {
    if (!data) return
    renderMapToCanvas(offlineCanvas, { width, height, resolution, originX: 0, originY: 0, data })
    if (meshRef.current) {
      const tex = new THREE.CanvasTexture(offlineCanvas)
      tex.flipY = false
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.NearestFilter
      ;(meshRef.current.material as THREE.MeshBasicMaterial).map = tex
      ;(meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true
      const w = width * resolution
      const h = height * resolution
      meshRef.current.scale.set(w, h, 1)
      meshRef.current.position.set(w / 2, 0, h / 2)
    }
  }, [data, width, height, resolution, offlineCanvas])

  if (!data) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, -0.01, 5]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
    )
  }

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  )
}
