-- سكريبت إعادة إنشاء جدول admin_users
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor

-- 1. حذف الجدول إذا كان موجوداً
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. إنشاء الجدول من جديد
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- 4. تفعيل RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. إنشاء سياسات RLS
DROP POLICY IF EXISTS "Allow all operations for admin users" ON admin_users;
CREATE POLICY "Allow all operations for admin users" ON admin_users
  FOR ALL USING (true);

-- 6. إدراج المستخدمين الإداريين
INSERT INTO admin_users (email, name, password_hash, role, is_active) VALUES
  ('qeahmedalkawthar@gmail.com', 'أحمد القحطاني', '689c4dec5ded8a10f583ce54f9ac5bda:3c1b12b79666be04000693d129a149325479d9b141e58658f2ede96aa5d51532fc661633ede8f35cbd57cde10c661db754c782fe06149b8dc31a311289ade967', 'admin', true),
  ('dg@alkawthar.org.sa', 'مدير عام', '5ddcd9f2681c17549c1c13d8d51585e2:7ee15bf315db456373fbda4e1813717b248d1068973e342c8902c67e1925295610715b3ab8435e7903eec7751f49a4df3725e0f4b410883aafa022bebd3a97a3', 'admin', true),
  ('Dm@alkawthar.org.sa', 'مدير النظام', '8886a4e179611c587b31e826220b47f1:707301ae909e479a3647dc96a29896737b54e136cb34eac890b669e69be2e89292aab45e0bc2cfa11af7c889e972ad717ab4d1551ffd5d98a78251a6139225cf', 'admin', true),
  ('admin@alkawthar.org.sa', 'مدير إضافي', '2852a7ea8a1f851ff9ae00b67cf2c622:58413e23a4e413e3584e4576305ae04734a0eb9c1a95da43039da5ad979df7d802cacb30fa4477c1825f98ac8e479dea0d59bd6cadcd12531e571c40b75b59da', 'admin', true),
  ('admin@example.com', 'مدير تجريبي', 'af35d21cfdd6e96ab73ed907708d7302:0fcf36cfcd184f61a7dfb9da117fbd834a77d5b0453dd858881e8003251174b91c24b7322d346b64c17d86ed7dd81901d7a95d01304d467b6d8e1f47c22e64d6', 'admin', true);

-- 7. التحقق من البيانات المضافة
SELECT id, email, name, role, is_active, created_at 
FROM admin_users 
ORDER BY created_at;

-- 8. عرض بنية الجدول
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;







