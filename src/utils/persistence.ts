import type { HRZone, Point2D } from '../stores/hrzStore'

const STORAGE_KEY = 'mrrep-web-persistence'

interface PersistedData {
  hrzZones: { id: string; points: Point2D[] }[]
  hrpPath: Point2D[]
}

export function save(hrzZones: HRZone[], hrpPath: Point2D[]): void {
  try {
    const data: PersistedData = { hrzZones, hrpPath }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function load(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedData
  } catch {
    return null
  }
}

// Legacy keys for backward compatibility
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
