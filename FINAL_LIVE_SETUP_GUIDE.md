# دليل الإعداد النهائي للموقع المباشر

## 🚨 المشكلة المكتشفة

الموقع لا يعمل لأن **ملف `.env.local` مفقود** مع إعدادات Supabase الصحيحة.

## 🔧 الحل الشامل

### الخطوة 1: إنشاء ملف `.env.local`

أنشئ ملف `.env.local` في المجلد الرئيسي للمشروع وأضف المحتوى التالي:

```env
# إعدادات Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### الخطوة 2: الحصول على إعدادات Supabase

1. **اذهب إلى Supabase Dashboard**
   - https://supabase.com/dashboard

2. **اختر مشروعك**
   - أو أنشئ مشروع جديد إذا لم يكن موجوداً

3. **اذهب إلى Settings > API**
   - في الشريط الجانبي الأيسر

4. **انسخ الإعدادات**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### الخطوة 3: مثال على الملف الصحيح

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key-here
```

### الخطوة 4: إعداد قاعدة البيانات

1. **اذهب إلى SQL Editor في Supabase**
2. **انسخ والصق محتوى ملف `supabase-schema.sql`**
3. **اضغط Run لتنفيذ السكريبت**

### الخطوة 5: إعادة تشغيل الخادم

```bash
# توقف الخادم الحالي
Ctrl + C

# أعد تشغيل الخادم
npm run dev
```

### الخطوة 6: اختبار النظام

1. **اذهب إلى الصفحة الرئيسية**
2. **اضغط على زر Debug في أسفل الصفحة اليمنى**
3. **تأكد من أن الحالة تظهر "صحيح"**
4. **جرب البحث عن شهادة**

## 🔍 التحقق من الإعداد

### في وحدة التحكم (Console)

ستظهر رسائل مثل:
```
✅ Supabase configured successfully
```

### في صفحة الإدارة

1. **اذهب إلى `/admin`**
2. **سجل دخولك باستخدام:**
   - Email: `admin@alkawthar.org.sa`
   - Password: `admin123`

## 📋 قائمة التحقق

- [ ] ملف `.env.local` موجود
- [ ] إعدادات Supabase صحيحة
- [ ] قاعدة البيانات مُعدة
- [ ] الخادم يعمل بدون أخطاء
- [ ] البحث عن الشهادات يعمل
- [ ] صفحة الإدارة تعمل
- [ ] الشعار يظهر
- [ ] الإعدادات تحفظ

## 🚨 إذا استمرت المشكلة

### تحقق من:

1. **ملف `.env.local` في المكان الصحيح**
   - يجب أن يكون في المجلد الرئيسي للمشروع

2. **إعدادات Supabase صحيحة**
   - URL يبدأ بـ `https://`
   - Anon Key طويل (أكثر من 50 حرف)

3. **قاعدة البيانات موجودة**
   - الجداول موجودة في Supabase
   - الصلاحيات صحيحة

4. **إعادة تشغيل الخادم**
   - توقف الخادم تماماً
   - أعد تشغيله

### رسائل الخطأ الشائعة:

- **"Supabase not configured"** → ملف `.env.local` مفقود أو غير صحيح
- **"Network error"** → مشكلة في الاتصال بـ Supabase
- **"Table not found"** → قاعدة البيانات غير مُعدة

## 📞 الدعم

إذا استمرت المشكلة، تحقق من:
1. وحدة التحكم (Console) للرسائل
2. زر Debug في الصفحة الرئيسية
3. ملف `ENV_SETUP_GUIDE.md` للتفاصيل

---

**ملاحظة مهمة:** لا تشارك ملف `.env.local` مع أحد - يحتوي على مفاتيح سرية!
