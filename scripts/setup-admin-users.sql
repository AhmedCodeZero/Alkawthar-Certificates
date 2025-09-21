-- سكريبت إعداد المستخدمين الإداريين
-- تشفير كلمات المرور باستخدام PBKDF2

-- إدراج المستخدمين الإداريين مع كلمات مرور مشفرة
INSERT INTO admin_users (email, name, password_hash, role, is_active) 
VALUES 
  ('qeahmedalkawthar@gmail.com', 'أحمد القحطاني', 'a1b2c3d4e5f6:hash1', 'admin', true),
  ('dg@alkawthar.org.sa', 'مدير عام', 'a1b2c3d4e5f6:hash2', 'admin', true),
  ('Dm@alkawthar.org.sa', 'مدير النظام', 'a1b2c3d4e5f6:hash3', 'admin', true),
  ('admin@alkawthar.org.sa', 'مدير إضافي', 'a1b2c3d4e5f6:hash4', 'admin', true),
  ('admin@example.com', 'مدير تجريبي', 'a1b2c3d4e5f6:hash5', 'admin', true)
ON CONFLICT (email) DO NOTHING;


