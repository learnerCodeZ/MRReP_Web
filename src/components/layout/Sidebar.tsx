import { useHrzStore } from '../../stores/hrzStore'
import ROSConnection from '../ros/ROSConnection'
import ModeSelector from '../ui/ModeSelector'
import ActionPanel from '../ui/ActionPanel'

export default function Sidebar() {
  const { zones, removeZone } = useHrzStore()

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col p-3 gap-4 overflow-y-auto">
      <h1 className="text-white font-bold text-sm tracking-wide">MRReP Web</h1>

      <ROSConnection />

      <div className="border-t border-gray-700 pt-3">
        <p className="text-xs text-gray-400 font-medium mb-2">Edit Mode</p>
        <ModeSelector />
      </div>

      <div className="border-t border-gray-700 pt-3">
        <ActionPanel />
      </div>

      {zones.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-400 font-medium mb-1">HRZ Zones</p>
          <ul className="space-y-1">
            {zones.map((z, i) => (
              <li key={z.id} className="flex items-center justify-between text-xs text-gray-300 bg-gray-700 rounded px-2 py-1">
                <span>Zone {i + 1} ({z.points.length} pts)</span>
                <button
                  onClick={() => removeZone(z.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto border-t border-gray-700 pt-3">
        <p className="text-[10px] text-gray-500">
          Right-click: rotate | Middle: pan | Scroll: zoom
          <br />
          HRZ: Left-click vertices, click start to close
          <br />
          HRP: Left-drag to draw path
        </p>
      </div>
    </div>
  )
}
