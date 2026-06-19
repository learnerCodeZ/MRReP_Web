import { useMapStore } from '../stores/mapStore'

export type Vec2 = {
  x: number
  z: number
}

export type Vec3 = {
  x: number
  y: number
  z: number
}

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

export function quaternionToYaw(
  qx: number,
  qy: number,
  qz: number,
  qw: number,
): number {
  const siny_cosp = 2 * (qw * qz + qx * qy)
  const cosy_cosp = 1 - 2 * (qy * qy + qz * qz)
  return Math.atan2(siny_cosp, cosy_cosp)
}

export function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dz * dz)
}
