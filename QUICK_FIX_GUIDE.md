# دليل الإصلاح السريع

## المشكلة
```
ERROR: 42703: column "password_hash" of relation "admin_users" does not exist
```

## الحل

### الطريقة الأولى: إصلاح الجدول الموجود
انسخ والصق هذا الكود في Supabase SQL Editor:

```sql
-- إضافة الأعمدة المفقودة
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

ثم أضف المستخدمين:

```sql
INSERT INTO admin_users (email, name, password_hash, role, is_active) VALUES
  ('qeahmedalkawthar@gmail.com', 'أحمد القحطاني', '689c4dec5ded8a10f583ce54f9ac5bda:3c1b12b79666be04000693d129a149325479d9b141e58658f2ede96aa5d51532fc661633ede8f35cbd57cde10c661db754c782fe06149b8dc31a311289ade967', 'admin', true),
  ('dg@alkawthar.org.sa', 'مدير عام', '5ddcd9f2681c17549c1c13d8d51585e2:7ee15bf315db456373fbda4e1813717b248d1068973e342c8902c67e1925295610715b3ab8435e7903eec7751f49a4df3725e0f4b410883aafa022bebd3a97a3', 'admin', true),
  ('Dm@alkawthar.org.sa', 'مدير النظام', '8886a4e179611c587b31e826220b47f1:707301ae909e479a3647dc96a29896737b54e136cb34eac890b669e69be2e89292aab45e0bc2cfa11af7c889e972ad717ab4d1551ffd5d98a78251a6139225cf', 'admin', true),
  ('admin@alkawthar.org.sa', 'مدير إضافي', '2852a7ea8a1f851ff9ae00b67cf2c622:58413e23a4e413e3584e4576305ae04734a0eb9c1a95da43039da5ad979df7d802cacb30fa4477c1825f98ac8e479dea0d59bd6cadcd12531e571c40b75b59da', 'admin', true),
  ('admin@example.com', 'مدير تجريبي', 'af35d21cfdd6e96ab73ed907708d7302:0fcf36cfcd184f61a7dfb9da117fbd834a77d5b0453dd858881e8003251174b91c24b7322d346b64c17d86ed7dd81901d7a95d01304d467b6d8e1f47c22e64d6', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

### الطريقة الثانية: إعادة إنشاء الجدول (الأفضل)
انسخ والصق محتوى ملف `scripts/recreate-admin-table.sql` في Supabase SQL Editor.

## بعد الإصلاح

1. **أعد تشغيل التطبيق**:
   ```bash
   npm run dev
   ```

2. **اختبر تسجيل الدخول**:
   - اذهب إلى `/admin`
   - استخدم أي من الحسابات:
     - `qeahmedalkawthar@gmail.com` / `qe203582`
     - `dg@alkawthar.org.sa` / `dg206582`
     - `Dm@alkawthar.org.sa` / `dm206582`
     - `admin@alkawthar.org.sa` / `admin123`
     - `admin@example.com` / `admin123`

## التحقق من النجاح

بعد تشغيل السكريبت، يجب أن ترى:
- جدول `admin_users` مع جميع الأعمدة المطلوبة
- 5 مستخدمين إداريين
- رسالة "Success" في Supabase

**المشكلة محلولة!** ✅


