import { createClient } from './supabase-client'
import type { AppLogo, AppLogoInsert } from './supabase'

export type LogoAsset = {
  dataUrl: string
  fileName: string
  mimeType: string
  uploadedAt: number
}

// Fallback to localStorage for development/offline mode
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

// Convert Supabase logo to local format
function convertFromSupabase(logo: AppLogo): LogoAsset {
  return {
    dataUrl: logo.data_url,
    fileName: logo.file_name,
    mimeType: logo.mime_type,
    uploadedAt: new Date(logo.uploaded_at).getTime(),
  }
}

// Convert local logo to Supabase format
function convertToSupabase(asset: LogoAsset, heightPx: number): AppLogoInsert {
  return {
    data_url: asset.dataUrl,
    file_name: asset.fileName,
    mime_type: asset.mimeType,
    height_px: heightPx,
    uploaded_at: new Date(asset.uploadedAt).toISOString(),
  }
}

export const Logo = {
  async get(): Promise<LogoAsset | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('app_logo')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching logo:', error)
        // Fallback to localStorage
        return read()
      }

      return data ? convertFromSupabase(data) : null
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      return read()
    }
  },

  async set(asset: LogoAsset): Promise<void> {
    try {
      const supabase = createClient()
      const currentHeight = this.getHeightPx()
      const supabaseLogo = convertToSupabase(asset, currentHeight)
      
      const { error } = await supabase
        .from('app_logo')
        .upsert(supabaseLogo, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error saving logo:', error)
        throw new Error(`Failed to save logo: ${error.message}`)
      }

      // Also update localStorage as backup
      write(asset)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      throw new Error(`Failed to save logo: ${error}`)
    }
  },

  async clear(): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('app_logo')
        .delete()
        .neq('id', '') // Delete all logos

      if (error) {
        console.error('Error clearing logo:', error)
        // Fallback to localStorage
        write(null)
        return
      }

      // Also clear localStorage as backup
      write(null)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      write(null)
    }
  },

  getHeightPx(): number {
    return readHeightPx()
  },

  async setHeightPx(px: number): Promise<void> {
    try {
      const supabase = createClient()
      const clampedPx = clamp(px, 64, 320)
      
      // Update height in database if logo exists
      const { data: existingLogo } = await supabase
        .from('app_logo')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (existingLogo) {
        const { error } = await supabase
          .from('app_logo')
          .update({ height_px: clampedPx })
          .eq('id', existingLogo.id)

        if (error) {
          console.error('Error updating logo height:', error)
        }
      }

      // Also update localStorage as backup
      writeHeightPx(clampedPx)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      writeHeightPx(px)
    }
  },
}




