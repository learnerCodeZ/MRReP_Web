import { Ros, Topic } from 'roslib'
import { useRosStore } from '../stores/rosStore'
import { useMapStore } from '../stores/mapStore'
import { useRobotPoseStore } from '../stores/robotPoseStore'
import { rosToScene, quaternionToYaw } from '../utils/coordinate'
import type { OccupancyGridMsg, OdometryMsg } from './types'

let rosInstance: Ros | null = null
const subscriptions: Topic[] = []

export function connect(url?: string) {
  const store = useRosStore.getState()
  const rosUrl = url ?? store.url

  if (rosInstance) {
    rosInstance.close()
    rosInstance = null
  }

  store.setConnecting(true)
  store.setError(null)

  const ros = new Ros({ url: rosUrl })
  rosInstance = ros

  ros.on('connection', () => {
    useRosStore.getState().setConnected(true)
    subscribeTopics()
  })

  ros.on('error', () => {
    useRosStore.getState().setError('Connection error')
  })

  ros.on('close', () => {
    const s = useRosStore.getState()
    if (!s.error) {
      s.setConnected(false)
    }
  })
}

export function disconnect() {
  subscriptions.forEach((t) => t.unsubscribe())
  subscriptions.length = 0
  if (rosInstance) {
    rosInstance.close()
    rosInstance = null
  }
  useRosStore.getState().setConnected(false)
  useMapStore.getState().setMap({
    originX: 0, originY: 0, resolution: 0.05,
    width: 0, height: 0, data: null,
  })
  useRobotPoseStore.getState().setPose({ x: 2, z: 2, yaw: 0 })
}

function subscribeTopics() {
  if (!rosInstance) return

  const mapTopic = new Topic({
    ros: rosInstance,
    name: '/map',
    messageType: 'nav_msgs/OccupancyGrid',
    throttle_rate: 500,
  })

  mapTopic.subscribe((msg: unknown) => {
    const m = msg as OccupancyGridMsg
    useMapStore.getState().setMap({
      originX: m.info.origin.position.x,
      originY: m.info.origin.position.y,
      resolution: m.info.resolution,
      width: m.info.width,
      height: m.info.height,
      data: m.data,
    })
  })
  subscriptions.push(mapTopic)

  const odomTopic = new Topic({
    ros: rosInstance,
    name: '/odom',
    messageType: 'nav_msgs/Odometry',
    throttle_rate: 100,
  })

  odomTopic.subscribe((msg: unknown) => {
    const m = msg as OdometryMsg
    const pos = m.pose.pose.position
    const q = m.pose.pose.orientation
    const scenePos = rosToScene(pos.x, pos.y)
    useRobotPoseStore.getState().setPose({
      x: scenePos.x,
      z: scenePos.z,
      yaw: quaternionToYaw(q.x, q.y, q.z, q.w),
    })
  })
  subscriptions.push(odomTopic)
}

export function publishNavGoal(x: number, z: number, yaw: number = 0): void {
  if (!rosInstance) return
  const topic = new Topic({
    ros: rosInstance,
    name: '/move_base_simple/goal',
    messageType: 'geometry_msgs/PoseStamped',
  })
  const msg = {
    header: {
      frame_id: 'map',
      stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 },
    },
    pose: {
      position: { x, y: 0, z },
      orientation: { x: 0, y: 0, z: Math.sin(yaw / 2), w: Math.cos(yaw / 2) },
    },
  }
  topic.publish(msg as never)
}

export function publishHrzZones(zonesJson: string) {
  if (!rosInstance) return
  const topic = new Topic({
    ros: rosInstance,
    name: '/hrz_zones',
    messageType: 'std_msgs/String',
  })
  topic.publish({ data: zonesJson } as never)
}

export function publishHrpPath(poses: { x: number; z: number }[]) {
  if (!rosInstance) return
  const topic = new Topic({
    ros: rosInstance,
    name: '/hrp_path',
    messageType: 'nav_msgs/Path',
  })
  const pathMsg = {
    header: { frame_id: 'map' },
    poses: poses.map((p) => ({
      pose: {
        position: { x: p.x, y: 0, z: p.z },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
    })),
  }
  topic.publish(pathMsg as never)
}

export function getRosInstance(): Ros | null {
  return rosInstance
}
