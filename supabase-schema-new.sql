-- قاعدة بيانات جديدة بسيطة وفعالة
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor

-- 1. حذف الجداول القديمة إذا كانت موجودة
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS app_logo CASCADE;

-- 2. إنشاء جدول المستخدمين الإداريين
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول الشهادات
CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_data TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء جدول الإعدادات
CREATE TABLE app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إنشاء جدول الشعار
CREATE TABLE app_logo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  height_px INTEGER DEFAULT 160,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. إنشاء الفهارس
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_certificates_student_id ON certificates(student_id);
CREATE INDEX idx_settings_key ON app_settings(key);

-- 7. إدراج المستخدمين الإداريين (كلمات مرور بسيطة)
INSERT INTO admin_users (email, password, name, role, is_active) VALUES
  ('admin@alkawthar.org.sa', 'admin123', 'مدير النظام', 'admin', true),
  ('qeahmedalkawthar@gmail.com', 'qe203582', 'أحمد القحطاني', 'admin', true),
  ('dg@alkawthar.org.sa', 'dg206582', 'مدير عام', 'admin', true),
  ('Dm@alkawthar.org.sa', 'dm206582', 'مدير النظام', 'admin', true),
  ('test@example.com', 'test123', 'مستخدم تجريبي', 'admin', true);

-- 8. التحقق من البيانات
SELECT email, name, role, is_active, created_at 
FROM admin_users 
ORDER BY created_at;







