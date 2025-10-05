# إعداد المستخدمين المصرح لهم

## إضافة مستخدم جديد للوصول إلى لوحة الإدارة

### الطريقة الأولى: من خلال SQL Editor في Supabase

1. اذهب إلى SQL Editor في لوحة تحكم Supabase
2. انسخ والصق الكود التالي:

```sql
-- إضافة مستخدم جديد
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('admin@example.com', 'اسم المستخدم', 'admin', true);

-- أو إضافة عدة مستخدمين مرة واحدة
INSERT INTO admin_users (email, name, role, is_active) VALUES
('admin1@example.com', 'المدير الأول', 'admin', true),
('admin2@example.com', 'المدير الثاني', 'admin', true),
('moderator@example.com', 'المشرف', 'moderator', true);
```

### الطريقة الثانية: من خلال Table Editor

1. اذهب إلى Table Editor في Supabase
2. اختر جدول `admin_users`
3. اضغط على "Insert" > "Insert row"
4. أدخل البيانات:
   - **email**: البريد الإلكتروني للمستخدم
   - **name**: الاسم الكامل
   - **role**: الدور (admin, moderator, etc.)
   - **is_active**: true (مفعل) أو false (معطل)

### إدارة المستخدمين

#### تفعيل/إلغاء تفعيل مستخدم
```sql
-- تفعيل مستخدم
UPDATE admin_users 
SET is_active = true 
WHERE email = 'user@example.com';

-- إلغاء تفعيل مستخدم
UPDATE admin_users 
SET is_active = false 
WHERE email = 'user@example.com';
```

#### حذف مستخدم
```sql
DELETE FROM admin_users 
WHERE email = 'user@example.com';
```

#### عرض جميع المستخدمين
```sql
SELECT email, name, role, is_active, last_login, created_at
FROM admin_users
ORDER BY created_at DESC;
```

### الأمان

- جميع المستخدمين يحتاجون إلى البريد الإلكتروني للدخول
- يمكن إلغاء تفعيل المستخدمين دون حذفهم
- يتم تسجيل آخر وقت دخول تلقائياً
- يمكن إضافة أدوار مختلفة (admin, moderator, etc.)

### ملاحظات مهمة

1. **البريد الإلكتروني يجب أن يكون فريداً**
2. **يجب أن يكون `is_active = true` للسماح بالدخول**
3. **يمكن تعديل الأدوار حسب الحاجة**
4. **يتم حفظ نسخة احتياطية في localStorage**

### اختبار النظام

1. أضف مستخدم جديد
2. اذهب إلى `/admin`
3. أدخل البريد الإلكتروني
4. تأكد من نجاح تسجيل الدخول
5. جرب تسجيل الخروج والدخول مرة أخرى






