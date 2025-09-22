// إعدادات Supabase
// قم بتحديث هذه القيم من Supabase Dashboard

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gdcpzppiafhhzdxchxid.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkY3B6cHBpYWZoaHpkeGNoeGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTA5MzIsImV4cCI6MjA3NDAyNjkzMn0.QlYO5hfM_09qVOGcntFE3_4aC7P-jj6qARH58OEbUd0'
}

// التحقق من صحة الإعدادات
export function validateSupabaseConfig() {
  const isValid = supabaseConfig.url !== 'https://your-project.supabase.co' && 
                  supabaseConfig.anonKey !== 'your-anon-key-here' &&
                  supabaseConfig.url.startsWith('https://') &&
                  supabaseConfig.anonKey.length > 50
  
  if (!isValid) {
    console.error('❌ إعدادات Supabase غير صحيحة!')
    console.error('يرجى تحديث ملف .env.local مع إعدادات Supabase الصحيحة')
    console.error('URL:', supabaseConfig.url)
    console.error('Anon Key:', supabaseConfig.anonKey ? 'موجود' : 'مفقود')
    console.error('')
    console.error('📋 خطوات الحل:')
    console.error('1. اذهب إلى https://supabase.com/dashboard')
    console.error('2. اختر مشروعك')
    console.error('3. اذهب إلى Settings > API')
    console.error('4. انسخ Project URL و anon public key')
    console.error('5. أنشئ ملف .env.local في المجلد الرئيسي')
    console.error('6. أضف الإعدادات:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL=your-project-url')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
    console.error('7. أعد تشغيل الخادم: npm run dev')
  }
  
  return isValid
}


