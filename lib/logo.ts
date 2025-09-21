export type LogoAsset = {
  dataUrl: string
  fileName: string
  mimeType: string
  uploadedAt: number
}

const KEY = "akawthar-logo-v1"
const KEY_SIZE = "akawthar-logo-height-px"

function isValid(v: any): v is LogoAsset {
  return (
    v &&
    typeof v.dataUrl === "string" &&
    typeof v.fileName === "string" &&
    typeof v.mimeType === "string" &&
    typeof v.uploadedAt === "number"
  )
}

function read(): LogoAsset | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const obj = JSON.parse(raw)
    return isValid(obj) ? obj : null
  } catch {
    return null
  }
}

function write(asset: LogoAsset | null) {
  if (typeof window === "undefined") return
  if (asset) localStorage.setItem(KEY, JSON.stringify(asset))
  else localStorage.removeItem(KEY)
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function readHeightPx(): number {
  if (typeof window === "undefined") return 160
  const raw = localStorage.getItem(KEY_SIZE)
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  if (Number.isFinite(parsed)) return clamp(parsed, 64, 320)
  return 160
}

function writeHeightPx(px: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY_SIZE, String(clamp(px, 64, 320)))
}

export const Logo = {
  get(): LogoAsset | null {
    return read()
  },
  set(asset: LogoAsset) {
    write(asset)
  },
  clear() {
    write(null)
  },
  getHeightPx(): number {
    return readHeightPx()
  },
  setHeightPx(px: number) {
    writeHeightPx(px)
  },
}
