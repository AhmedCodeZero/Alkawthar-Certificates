import { createBrowserClient } from '@supabase/ssr'
import { supabaseConfig, validateSupabaseConfig } from './supabase-config'

export function createClient() {
  // التحقق من صحة الإعدادات
  const isValid = validateSupabaseConfig()
  
  if (!isValid) {
    console.error('❌ لا يمكن الاتصال بـ Supabase - إعدادات غير صحيحة')
    console.error('يرجى إنشاء ملف .env.local مع إعدادات Supabase الصحيحة')
    console.error('راجع ملف ENV_SETUP_GUIDE.md للتعليمات')
    console.error('')
    console.error('🔧 الحل السريع:')
    console.error('1. أنشئ ملف .env.local في المجلد الرئيسي')
    console.error('2. أضف الإعدادات التالية:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL=your-project-url')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
    console.error('3. أعد تشغيل الخادم')
    
    // إرجاع عميل وهمي لتجنب توقف التطبيق
    return {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
        insert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        upsert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) })
      })
    } as any
  }

  return createBrowserClient(
    supabaseConfig.url,
    supabaseConfig.anonKey
  )
}


