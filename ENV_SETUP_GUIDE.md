# دليل إعداد متغيرات البيئة

## 🚨 المشكلة المكتشفة
الموقع لا يعمل لأن **ملف `.env.local` مفقود** مع إعدادات Supabase الصحيحة.

## 🔧 الحل السريع

### 1. إنشاء ملف `.env.local` في المجلد الرئيسي:

```env
# إعدادات Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. الحصول على إعدادات Supabase:

1. **اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)**
2. **اختر مشروعك**
3. **اذهب إلى Settings > API**
4. **انسخ:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. مثال على الملف الصحيح:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key-here
```

### 4. إعداد قاعدة البيانات:

1. **اذهب إلى SQL Editor في Supabase**
2. **انسخ والصق محتوى ملف `supabase-schema.sql`**
3. **اضغط Run لتنفيذ السكريبت**

### 5. بعد إنشاء الملف:

1. **أعد تشغيل الخادم:** `npm run dev`
2. **أعد نشر الموقع**
3. **اختبر النظام**

## 🔍 التحقق من الإعداد

### في وحدة التحكم (Console):
ستظهر رسائل مثل:
```
✅ Supabase configured successfully
```

### في الصفحة الرئيسية:
1. **اضغط على زر Debug في أسفل الصفحة اليمنى**
2. **تأكد من أن الحالة تظهر "صحيح"**

## 📋 قائمة التحقق

- [ ] ملف `.env.local` موجود في المجلد الرئيسي
- [ ] إعدادات Supabase صحيحة
- [ ] قاعدة البيانات مُعدة
- [ ] الخادم يعمل بدون أخطاء
- [ ] البحث عن الشهادات يعمل
- [ ] صفحة الإدارة تعمل

## 🚨 إذا استمرت المشكلة

### تحقق من:

1. **ملف `.env.local` في المكان الصحيح**
2. **إعدادات Supabase صحيحة**
3. **قاعدة البيانات موجودة**
4. **إعادة تشغيل الخادم**

### رسائل الخطأ الشائعة:

- **"Supabase not configured"** → ملف `.env.local` مفقود أو غير صحيح
- **"Network error"** → مشكلة في الاتصال بـ Supabase
- **"Table not found"** → قاعدة البيانات غير مُعدة

## 📞 الدعم

راجع ملف `FINAL_LIVE_SETUP_GUIDE.md` للحصول على دليل شامل.

---

## ملاحظات مهمة:

- **لا تشارك ملف `.env.local` مع أحد** - يحتوي على مفاتيح سرية
- تأكد من أن الملف في المجلد الرئيسي للمشروع
- أعد تشغيل الخادم بعد كل تغيير
