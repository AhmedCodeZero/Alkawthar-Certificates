// إعدادات Supabase
// قم بتحديث هذه القيم من Supabase Dashboard

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'
}

// التحقق من صحة الإعدادات
export function validateSupabaseConfig() {
  const isValid = supabaseConfig.url !== 'https://your-project.supabase.co' && 
                  supabaseConfig.anonKey !== 'your-anon-key-here'
  
  if (!isValid) {
    console.error('❌ إعدادات Supabase غير صحيحة!')
    console.error('يرجى تحديث ملف .env.local أو lib/supabase-config.ts')
    console.error('URL:', supabaseConfig.url)
    console.error('Anon Key:', supabaseConfig.anonKey ? 'موجود' : 'مفقود')
  }
  
  return isValid
}


