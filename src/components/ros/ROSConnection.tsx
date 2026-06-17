import { useRosStore } from '../../stores/rosStore'
import { connect, disconnect } from '../../ros/connection'

export default function ROSConnection() {
  const { url, connected, connecting, error, setUrl } = useRosStore()

  const handleConnect = () => {
    if (connected) {
      disconnect()
    } else {
      connect()
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-400">Rosbridge URL</label>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={connected}
        className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:border-blue-500 outline-none disabled:opacity-50"
      />
      <button
        onClick={handleConnect}
        disabled={connecting}
        className={`w-full py-1.5 rounded text-sm font-medium ${
          connected
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } disabled:opacity-50`}
      >
        {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {connected && <p className="text-xs text-green-400">Connected</p>}
    </div>
  )
}
