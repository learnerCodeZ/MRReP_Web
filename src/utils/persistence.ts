import type { HRZone, Point2D } from '../stores/hrzStore'

const HRZ_KEY = 'mrrep_hrz_zones'
const HRP_KEY = 'mrrep_hrp_path'

export function saveHrzZones(zones: HRZone[]) {
  localStorage.setItem(HRZ_KEY, JSON.stringify(zones))
}

export function loadHrzZones(): HRZone[] {
  const raw = localStorage.getItem(HRZ_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveHrpPath(path: Point2D[]) {
  localStorage.setItem(HRP_KEY, JSON.stringify(path))
}

export function loadHrpPath(): Point2D[] {
  const raw = localStorage.getItem(HRP_KEY)
  return raw ? JSON.parse(raw) : []
}
