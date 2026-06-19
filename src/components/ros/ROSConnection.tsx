import { useState } from 'react'
import { useRosStore } from '../../stores/rosStore'
import { connect, disconnect } from '../../ros/connection'
import { startMock, stopMock } from '../../ros/mock'

export default function ROSConnection() {
  const { url, connected, connecting, error, setUrl, isMock, setMock } = useRosStore()
  const [inputUrl, setInputUrl] = useState(url)

  const handleConnect = () => {
    if (isMock) {
      stopMock()
      setMock(false)
    }
    setUrl(inputUrl)
    connect(inputUrl)
  }

  const handleDisconnect = () => {
    if (isMock) {
      stopMock()
      setMock(false)
    } else {
      disconnect()
    }
  }

  const handleMock = () => {
    if (!isMock) {
      disconnect()
    }
    setMock(true)
    startMock('default')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${
          connected ? (isMock ? 'bg-purple-500' : 'bg-green-500')
            : connecting ? 'bg-yellow-400'
            : error ? 'bg-red-500'
            : 'bg-gray-400'
        }`} />
        <input
          className="bg-gray-700 text-white text-xs px-2 py-1 rounded w-40 outline-none focus:ring-1 focus:ring-blue-400"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="ws://localhost:9090"
        />
        {connected && !isMock ? (
          <button
            onClick={handleDisconnect}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded disabled:opacity-50"
          >
            {connecting ? '...' : 'Connect'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isMock ? (
          <button
            onClick={handleDisconnect}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            Exit Mock
          </button>
        ) : (
          <button
            onClick={handleMock}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
          >
            Mock Mode
          </button>
        )}
        <span className="text-xs text-gray-400 capitalize">
          {connected ? 'connected' : 'disconnected'}{isMock ? ' (mock)' : ''}
        </span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
