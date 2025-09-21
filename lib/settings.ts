export type AppSettings = {
  whatsappCommunityUrl?: string
  xUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  websiteUrl?: string
}

const KEY = "akawthar-settings-v1"

function isObject(v: any): v is Record<string, unknown> {
  return v && typeof v === "object"
}

function read(): AppSettings {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw)
    return isObject(obj) ? (obj as AppSettings) : {}
  } catch {
    return {}
  }
}

function write(next: AppSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(next))
}

export const Settings = {
  get(): AppSettings {
    return read()
  },
  set(partial: Partial<AppSettings>) {
    const cur = read()
    write({ ...cur, ...partial })
  },
  clear() {
    write({})
  },
  // Helper to notify listeners in the same tab
  notifyUpdate() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ak-settings-updated"))
    }
  },
}
