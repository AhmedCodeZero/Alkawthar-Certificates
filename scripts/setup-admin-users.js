const crypto = require('crypto');

// دالة لتشفير كلمة المرور
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// بيانات المستخدمين
const users = [
  { email: 'qeahmedalkawthar@gmail.com', name: 'أحمد القحطاني', password: 'qe203582' },
  { email: 'dg@alkawthar.org.sa', name: 'مدير عام', password: 'dg206582' },
  { email: 'Dm@alkawthar.org.sa', name: 'مدير النظام', password: 'dm206582' },
  { email: 'admin@alkawthar.org.sa', name: 'مدير إضافي', password: 'admin123' },
  { email: 'admin@example.com', name: 'مدير تجريبي', password: 'admin123' }
];

console.log('-- سكريبت إعداد المستخدمين الإداريين');
console.log('-- انسخ والصق هذا الكود في Supabase SQL Editor\n');

users.forEach((user, index) => {
  const passwordHash = hashPassword(user.password);
  console.log(`INSERT INTO admin_users (email, name, password_hash, role, is_active) VALUES ('${user.email}', '${user.name}', '${passwordHash}', 'admin', true)${index < users.length - 1 ? ';' : ';'}`);
});

console.log('\n-- أو استخدم هذا الكود مع ON CONFLICT:');
console.log('INSERT INTO admin_users (email, name, password_hash, role, is_active) VALUES');

users.forEach((user, index) => {
  const passwordHash = hashPassword(user.password);
  console.log(`  ('${user.email}', '${user.name}', '${passwordHash}', 'admin', true)${index < users.length - 1 ? ',' : ''}`);
});

console.log('ON CONFLICT (email) DO NOTHING;');


