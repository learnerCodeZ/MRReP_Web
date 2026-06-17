import { useRef, useEffect, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMapStore } from '../../stores/mapStore'
import { useRosStore } from '../../stores/rosStore'
import { renderMapTexture } from '../../utils/mapRenderer'
import MapFloor from './MapFloor'
import RobotModel from './RobotModel'
import HRZEditor3D from '../editor/HRZEditor3D'
import HRPEditor3D from '../editor/HRPEditor3D'

const raycaster = new THREE.Raycaster()
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

export function useGroundRaycast() {
  const { camera, gl } = useThree()

  return useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(mouse, camera)
      const target = new THREE.Vector3()
      const hit = raycaster.ray.intersectPlane(groundPlane, target)
      return hit
    },
    [camera, gl],
  )
}

export default function Scene3D() {
  const editMode = useRosStore((s) => s.editMode)

  return (
    <>
      <OrbitControls
        makeDefault
        mouseButtons={{
          LEFT: undefined as unknown as THREE.MOUSE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <MapFloor />
      <RobotModel />
      {editMode === 'hrz' && <HRZEditor3D />}
      {editMode === 'hrp' && <HRPEditor3D />}
      <gridHelper args={[100, 100, '#444', '#222']} rotation={[0, 0, 0]} />
    </>
  )
}
