import { useHrzStore } from '../../stores/hrzStore'
import { useHrpStore } from '../../stores/hrpStore'
import { publishHrzZones, publishHrpPath } from '../../ros/connection'
import { sceneToRos } from '../../utils/coordinate'

export default function ActionPanel() {
  const { zones, clearAll: clearHrz } = useHrzStore()
  const { path, robotPos, clearPath } = useHrpStore()

  const handleSendZones = () => {
    const rosZones = zones.map((z) => ({
      ...z,
      points: z.points.map((p) => sceneToRos(p.x, p.z)),
    }))
    publishHrzZones(JSON.stringify(rosZones))
  }

  const handleSendPath = () => {
    if (path.length < 2) return
    const now = Math.floor(Date.now() / 1000)
    const pathMsg = {
      header: { seq: 0, stamp: { secs: now, nsecs: 0 }, frame_id: 'map' },
      poses: path.map((p, i) => {
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

  const robotPathDist =
    robotPos && path.length > 0
      ? Math.sqrt((robotPos.x - path[0].x) ** 2 + (robotPos.z - path[0].z) ** 2)
      : null

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 font-medium">Actions</p>

      <button
        onClick={handleSendZones}
        disabled={zones.length === 0}
        className="w-full py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs rounded disabled:opacity-30"
      >
        Send HRZ Zones ({zones.length})
      </button>

      <button
        onClick={handleSendPath}
        disabled={path.length < 2}
        className="w-full py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded disabled:opacity-30"
      >
        Send HRP Path ({path.length} pts)
      </button>

      <div className="flex gap-1">
        <button
          onClick={clearHrz}
          className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded"
        >
          Clear HRZ
        </button>
        <button
          onClick={clearPath}
          className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded"
        >
          Clear HRP
        </button>
      </div>

      {robotPathDist !== null && robotPathDist > 1 && (
        <div className="bg-yellow-900/50 border border-yellow-600 rounded p-2 text-xs text-yellow-300">
          Robot is {robotPathDist.toFixed(1)}m from path start (&gt;1m)
        </div>
      )}
    </div>
  )
}
