import { useMapStore } from '../stores/mapStore'

export function sceneToRos(x: number, z: number): { x: number; y: number } {
  const { originX, originY, resolution } = useMapStore.getState()
  return {
    x: originX + x * resolution,
    y: originY + z * resolution,
  }
}

export function rosToScene(rosX: number, rosY: number): { x: number; z: number } {
  const { originX, originY, resolution } = useMapStore.getState()
  if (resolution === 0) return { x: rosX, z: rosY }
  return {
    x: (rosX - originX) / resolution,
    z: (rosY - originY) / resolution,
  }
}
