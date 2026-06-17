import { Ros, Topic } from 'roslib'
import { useRosStore } from '../stores/rosStore'
import { useMapStore } from '../stores/mapStore'
import { useHrpStore } from '../stores/hrpStore'
import { rosToScene } from '../utils/coordinate'
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
}

function subscribeTopics() {
  if (!rosInstance) return

  const mapTopic = new Topic({
    ros: rosInstance,
    name: '/map',
    messageType: 'nav_msgs/OccupancyGrid',
    throttle_rate: 200,
  })

  mapTopic.subscribe((msg: unknown) => {
    const m = msg as OccupancyGridMsg
    useMapStore.getState().setMap({
      originX: m.info.origin.position.x,
      originY: m.info.origin.position.y,
      resolution: m.info.resolution,
      width: m.info.width,
      height: m.info.height,
      data: new Int8Array(m.data),
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
    useHrpStore.getState().setRobotPos(rosToScene(pos.x, pos.y))
  })
  subscriptions.push(odomTopic)
}

export function publishHrzZones(zonesJson: string) {
  if (!rosInstance) return
  const topic = new Topic({
    ros: rosInstance,
    name: '/hrz_zones',
    messageType: 'std_msgs/String',
  })
  topic.publish({ data: zonesJson })
}

export function publishHrpPath(pathMsg: object) {
  if (!rosInstance) return
  const topic = new Topic({
    ros: rosInstance,
    name: '/hrp_path',
    messageType: 'nav_msgs/Path',
  })
  topic.publish(pathMsg)
}

export function getRosInstance(): Ros | null {
  return rosInstance
}
