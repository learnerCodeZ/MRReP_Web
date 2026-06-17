import { useRosStore, type EditMode } from '../../stores/rosStore'

const MODES: { key: EditMode; label: string }[] = [
  { key: 'navigate', label: 'Navigate' },
  { key: 'hrz', label: 'HRZ Edit' },
  { key: 'hrp', label: 'HRP Edit' },
]

export default function ModeSelector() {
  const { editMode, setEditMode } = useRosStore()

  return (
    <div className="flex gap-1">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => setEditMode(m.key)}
          className={`flex-1 py-1.5 text-xs font-medium rounded ${
            editMode === m.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
