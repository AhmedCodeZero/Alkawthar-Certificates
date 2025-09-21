-- سكريبت إصلاح قاعدة البيانات
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor

-- 1. إضافة عمود password_hash إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. إضافة عمود name إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- 3. إضافة عمود role إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';

-- 4. إضافة عمود is_active إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. إضافة عمود last_login إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 6. إضافة عمود created_at إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. إضافة عمود updated_at إذا لم يكن موجوداً
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. التحقق من بنية الجدول
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;


