import { useEffect, useCallback, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import MapFloor from './MapFloor'
import RobotModel from './RobotModel'
import CameraControls from './CameraControls'
import HRZEditor3D from '../editor/HRZEditor3D'
import HRPEditor3D from '../editor/HRPEditor3D'
import NavPathVisual from './NavPathVisual'
import MapEditPreview from './MapEditPreview'
import type { AppMode } from '../ui/ModeSelector'
import { useHrzStore } from '../../stores/hrzStore'
import { useHrpStore } from '../../stores/hrpStore'
import { useRobotPoseStore } from '../../stores/robotPoseStore'
import { useRosStore } from '../../stores/rosStore'
import { useNavTargetStore } from '../../stores/navTargetStore'
import { useMapEditorStore } from '../../stores/mapEditorStore'
import { mockNavigateTo, mockCancelNav, mockPaintBrush, mockPaintRect, mockPlaceRobot } from '../../ros/mock'
import { publishNavGoal } from '../../ros/connection'
import type { Vec2 } from '../../utils/coordinate'
import { dist } from '../../utils/coordinate'

function SceneEvents({ mode }: { mode: AppMode }) {
  const { gl, camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const lastPathPoint = useRef<Vec2 | null>(null)
  const isDrawingMap = useRef(false)

  const getScenePoint = useCallback(
    (e: PointerEvent): Vec2 | null => {
      const rect = gl.domElement.getBoundingClientRect()
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
      const hit = new THREE.Vector3()
      const result = raycaster.ray.intersectPlane(groundPlane, hit)
      if (!result) return null
      return { x: hit.x, z: hit.z }
    },
    [gl, camera, raycaster, groundPlane],
  )

  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return

      const pt = getScenePoint(e)
      if (!pt) return

      if (mode === 'hrz') {
        useHrzStore.getState().addPoint(pt)
      } else if (mode === 'hrp') {
        const store = useHrpStore.getState()
        store.startDrawing()
        store.addPoint(pt)
        lastPathPoint.current = pt
      } else if (mode === 'navigate') {
        const rosStore = useRosStore.getState()
        if (rosStore.isMock) {
          const navStore = useNavTargetStore.getState()
          if (navStore.navigating) {
            mockCancelNav()
          }
          mockNavigateTo(pt.x, pt.z)
        } else if (rosStore.connected) {
          publishNavGoal(pt.x, pt.z)
          useNavTargetStore.getState().setTarget(pt)
        }
      } else if (mode === 'mapedit') {
        const isMock = useRosStore.getState().isMock
        if (!isMock) return
        const editStore = useMapEditorStore.getState()
        const tool = editStore.tool

        if (tool === 'rect') {
          const col = Math.floor(pt.x / 0.02)
          const row = Math.floor(pt.z / 0.02)
          editStore.setRectStart({ col, row })
        } else if (tool === 'robot') {
          mockPlaceRobot(pt.x, pt.z)
        } else {
          isDrawingMap.current = true
          const occupied = tool === 'wall'
          mockPaintBrush(pt.x, pt.z, editStore.brushSize, occupied)
        }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (mode === 'hrp') {
        const store = useHrpStore.getState()
        if (!store.isDrawing) return
        if (e.buttons !== 1) return
        const pt = getScenePoint(e)
        if (!pt) return
        if (lastPathPoint.current && dist(pt, lastPathPoint.current) < 0.1) return
        store.addPoint(pt)
        lastPathPoint.current = pt
        return
      }

      if (mode === 'mapedit' && isDrawingMap.current) {
        const pt = getScenePoint(e)
        if (!pt) return
        const editStore = useMapEditorStore.getState()
        const occupied = editStore.tool === 'wall'
        mockPaintBrush(pt.x, pt.z, editStore.brushSize, occupied)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return

      if (mode === 'hrp') {
        const store = useHrpStore.getState()
        if (store.isDrawing) store.finishDrawing()
      }

      if (mode === 'mapedit') {
        const editStore = useMapEditorStore.getState()
        if (editStore.tool === 'rect' && editStore.rectStart) {
          const pt = getScenePoint(e)
          if (pt) {
            const start = editStore.rectStart
            const sx = (start.col + 0.5) * 0.02
            const sz = (start.row + 0.5) * 0.02
            mockPaintRect(sx, sz, pt.x, pt.z, true)
            editStore.setRectStart(null)
          }
        }
        isDrawingMap.current = false
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
  }, [mode, getScenePoint, gl])

  return null
}

export function NavTargetMarker({ x, z }: { x: number; z: number }) {
  const poleLine = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.22, 0),
    ])
    const mat = new THREE.LineBasicMaterial({ color: '#ff4081' })
    return new THREE.Line(geo, mat)
  }, [])

  return (
    <group position={[x, 0.02, z]}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ff4081" />
      </mesh>
      <primitive object={poleLine} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.12, 0.18, 24]} />
        <meshBasicMaterial color="#ff4081" side={2} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export type { AppMode }

export default function Scene3D({ mode }: { mode: AppMode }) {
  const robotPose = useRobotPoseStore((s) => s.pose)
  const navTarget = useNavTargetStore((s) => s.target)
  const plannedPath = useNavTargetStore((s) => s.plannedPath)
  const navigating = useNavTargetStore((s) => s.navigating)

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <MapFloor />
      <RobotModel x={robotPose.x} z={robotPose.z} yaw={robotPose.yaw} />
      <SceneEvents mode={mode} />
      {(mode === 'hrz') && <HRZEditor3D />}
      {(mode === 'hrp') && (
        <>
          <HRZEditor3D />
          <HRPEditor3D robotX={robotPose.x} robotZ={robotPose.z} />
        </>
      )}
      {mode === 'mapedit' && <MapEditPreview />}
      {navTarget && <NavTargetMarker x={navTarget.x} z={navTarget.z} />}
      {plannedPath.length >= 2 && navigating && (
        <NavPathVisual path={plannedPath} color="#ff4081" />
      )}
      <CameraControls mode={mode} />
      <gridHelper args={[50, 50, '#555', '#333']} position={[5, 0, 5]} />
    </>
  )
}
