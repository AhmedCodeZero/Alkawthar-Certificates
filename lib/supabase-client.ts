import { createBrowserClient } from '@supabase/ssr'
import { supabaseConfig, validateSupabaseConfig } from './supabase-config'

export function createClient() {
  // التحقق من صحة الإعدادات
  const isValid = validateSupabaseConfig()
  
  if (!isValid) {
    console.error('❌ لا يمكن الاتصال بـ Supabase - إعدادات غير صحيحة')
    throw new Error('Supabase configuration is invalid')
  }

  return createBrowserClient(
    supabaseConfig.url,
    supabaseConfig.anonKey
  )
}


