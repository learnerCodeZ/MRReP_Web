import { useRosStore } from '../../stores/rosStore'
import { useHrzStore } from '../../stores/hrzStore'
import { useHrpStore } from '../../stores/hrpStore'

export default function StatusBar() {
  const connected = useRosStore((s) => s.connected)
  const isMock = useRosStore((s) => s.isMock)
  const editMode = useRosStore((s) => s.editMode)
  const zoneCount = useHrzStore((s) => s.zones.length)
  const pathPts = useHrpStore((s) => s.path.length)

  return (
    <div className="h-7 bg-gray-900 border-t border-gray-700 flex items-center px-3 text-xs text-gray-400 gap-4">
      <span>
        ROS:{' '}
        <span
          className={
            connected
              ? isMock ? 'text-purple-400' : 'text-green-400'
              : 'text-red-400'
          }
        >
          {connected ? 'Connected' : 'Disconnected'}{isMock ? ' (mock)' : ''}
        </span>
      </span>
      <span className="text-gray-500">|</span>
      <span>Mode: {editMode.toUpperCase()}</span>
      <span>Zones: {zoneCount}</span>
      <span>Path pts: {pathPts}</span>
    </div>
  )
}
