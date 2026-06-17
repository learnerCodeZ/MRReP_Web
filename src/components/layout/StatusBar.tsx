import { useRosStore } from '../../stores/rosStore'

export default function StatusBar() {
  const { connected, editMode } = useRosStore()

  return (
    <div className="h-7 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-4 text-xs">
      <span className={connected ? 'text-green-400' : 'text-red-400'}>
        {connected ? 'ROS Connected' : 'ROS Disconnected'}
      </span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-400">Mode: {editMode.toUpperCase()}</span>
    </div>
  )
}
