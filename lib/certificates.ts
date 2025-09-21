export type CertificateRecord = {
  id: string
  fileName: string
  mimeType: string
  dataUrl: string
  uploadedAt: number
}

const STORAGE_KEY = "akawthar-certificates-v1"

function safeParse(json: string): CertificateRecord[] {
  try {
    const data = JSON.parse(json)
    if (!Array.isArray(data)) return []
    return data.filter(validRecord)
  } catch {
    return []
  }
}

function validRecord(r: any): r is CertificateRecord {
  return (
    r &&
    typeof r.id === "string" &&
    typeof r.fileName === "string" &&
    typeof r.mimeType === "string" &&
    typeof r.dataUrl === "string" &&
    typeof r.uploadedAt === "number"
  )
}

function read(): CertificateRecord[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? safeParse(raw) : []
}

function write(data: CertificateRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const Certificates = {
  getAll(): CertificateRecord[] {
    return read().sort((a, b) => b.uploadedAt - a.uploadedAt)
  },
  find(id: string): CertificateRecord | null {
    const all = read()
    return all.find((r) => r.id === id) ?? null
  },
  upsert(record: CertificateRecord) {
    const all = read()
    const idx = all.findIndex((r) => r.id === record.id)
    if (idx >= 0) {
      all[idx] = record
    } else {
      all.push(record)
    }
    write(all)
  },
  remove(id: string) {
    const all = read().filter((r) => r.id !== id)
    write(all)
  },
  clearAll() {
    write([])
  },
  replaceAll(list: CertificateRecord[]) {
    const filtered = Array.isArray(list) ? list.filter(validRecord) : []
    write(filtered)
  },
}
