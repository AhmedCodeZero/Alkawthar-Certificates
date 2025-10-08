-- سكريبت تحديث قاعدة البيانات لحل مشاكل تسجيل الدخول
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor

-- 1. إزالة password_hash من جدول admin_users
ALTER TABLE admin_users DROP COLUMN IF EXISTS password_hash;

-- 2. تحديث RLS policies للسماح بالوصول بدون JWT
DROP POLICY IF EXISTS "Allow admin write access to settings" ON app_settings;
CREATE POLICY "Allow admin write access to settings" ON app_settings
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin access to users" ON admin_users;
CREATE POLICY "Allow admin access to users" ON admin_users
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin write access to logo" ON app_logo;
CREATE POLICY "Allow admin write access to logo" ON app_logo
  FOR ALL USING (true);

-- 3. إضافة المستخدمين الإداريين الافتراضيين
INSERT INTO admin_users (email, name, role, is_active) 
VALUES 
  ('Dm@alkawthar.org.sa', 'مدير النظام', 'admin', true),
  ('admin@alkawthar.org.sa', 'مدير إضافي', 'admin', true),
  ('admin@example.com', 'مدير تجريبي', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- 4. التحقق من البيانات المضافة
SELECT email, name, role, is_active, created_at 
FROM admin_users 
ORDER BY created_at;







