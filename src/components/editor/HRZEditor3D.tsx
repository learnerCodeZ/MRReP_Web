import { useHrzStore } from '../../stores/hrzStore'
import HRZPolygon from './HRZPolygon'

export default function HRZEditor3D() {
  const zones = useHrzStore((s) => s.zones)
  const currentPoints = useHrzStore((s) => s.currentPoints)

  return (
    <group>
      {zones.map((zone) => (
        <HRZPolygon key={zone.id} points={zone.points} closed={true} />
      ))}
      {currentPoints.length > 0 && (
        <HRZPolygon
          points={currentPoints}
          color="#ff9800"
          opacity={0.2}
          closed={false}
        />
      )}
    </group>
  )
}
