import { useMemo } from 'react'
import * as THREE from 'three'
import { useMapStore } from '../../stores/mapStore'
import { renderMapTexture } from '../../utils/mapRenderer'

export default function MapFloor() {
  const { data, width, height, resolution } = useMapStore()

  const texture = useMemo(() => {
    if (!data || width === 0 || height === 0) return null
    return renderMapTexture(data, width, height)
  }, [data, width, height])

  const mapWidth = width * resolution
  const mapHeight = height * resolution

  if (!texture) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    )
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mapWidth / 2, -0.01, mapHeight / 2]} receiveShadow>
      <planeGeometry args={[mapWidth, mapHeight]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
