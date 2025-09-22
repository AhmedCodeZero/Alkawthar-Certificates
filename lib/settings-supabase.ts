import { createClient } from './supabase-client'
import type { AppSetting, AppSettingInsert } from './supabase'

export type AppSettings = {
  whatsappCommunityUrl?: string
  xUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  websiteUrl?: string
}

// Fallback to localStorage for development/offline mode
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
  async get(): Promise<AppSettings> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')

      if (error) {
        console.error('Error fetching settings:', error)
        // Fallback to localStorage
        return read()
      }

      // Convert database records to settings object
      const settings: AppSettings = {}
      data.forEach((setting: AppSetting) => {
        if (setting.key in settings) {
          (settings as any)[setting.key] = setting.value
        }
      })

      return settings
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      return read()
    }
  },

  async set(partial: Partial<AppSettings>): Promise<void> {
    try {
      const supabase = createClient()
      
      // Update each setting individually
      const promises = Object.entries(partial).map(async ([key, value]) => {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key,
            value,
          }, {
            onConflict: 'key',
            ignoreDuplicates: false
          })

      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        throw new Error(`Failed to update setting ${key}: ${error.message}`)
      }
      })

      await Promise.all(promises)

      // Also update localStorage as backup
      const current = read()
      write({ ...current, ...partial })
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      const current = read()
      write({ ...current, ...partial })
    }
  },

  async clear(): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('app_settings')
        .delete()
        .neq('key', '') // Delete all settings

      if (error) {
        console.error('Error clearing settings:', error)
        // Fallback to localStorage
        write({})
        return
      }

      // Also clear localStorage as backup
      write({})
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      write({})
    }
  },

  // Helper to notify listeners in the same tab
  notifyUpdate() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ak-settings-updated"))
    }
  },
}




