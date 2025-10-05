// نظام مصادقة محلي مؤقت
// يعمل بدون Supabase لحل مشكلة الاتصال

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: Date
}

export interface LoginResult {
  success: boolean
  user?: AdminUser
  error?: string
}

// بيانات المستخدمين المحلية
const LOCAL_USERS = [
  {
    id: '1',
    email: 'admin@alkawthar.org.sa',
    password: 'admin123',
    name: 'مدير النظام',
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '2',
    email: 'qeahmedalkawthar@gmail.com',
    password: 'qe203582',
    name: 'أحمد القحطاني',
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '3',
    email: 'dg@alkawthar.org.sa',
    password: 'dg206582',
    name: 'مدير عام',
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '4',
    email: 'Dm@alkawthar.org.sa',
    password: 'dm206582',
    name: 'مدير النظام',
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '5',
    email: 'test@example.com',
    password: 'test123',
    name: 'مستخدم تجريبي',
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  }
]

export class LocalAuth {
  private static readonly STORAGE_KEY = 'local_admin_session'
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 ساعة

  // تسجيل الدخول
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('محاولة تسجيل الدخول محلياً:', { email })
      
      // البحث عن المستخدم
      const user = LOCAL_USERS.find(u => 
        u.email === email && 
        u.password === password && 
        u.isActive
      )

      if (!user) {
        console.log('المستخدم غير موجود أو كلمة المرور غير صحيحة')
        return { success: false, error: 'المستخدم غير موجود أو كلمة المرور غير صحيحة' }
      }

      // حفظ الجلسة محلياً
      const sessionData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        loginTime: Date.now(),
        isAuthenticated: true
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData))
        console.log('تم حفظ الجلسة محلياً')
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }
    }
  }

  // تسجيل الخروج
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('تم تسجيل الخروج')
    }
  }

  // التحقق من حالة المصادقة
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return false

      const session = JSON.parse(sessionData)
      
      // التحقق من انتهاء صلاحية الجلسة
      if (Date.now() - session.loginTime > this.SESSION_TIMEOUT) {
        this.logout()
        return false
      }

      return session.isAuthenticated === true
    } catch (error) {
      console.error('Error checking authentication:', error)
      this.logout()
      return false
    }
  }

  // الحصول على بيانات المستخدم الحالي
  static getCurrentUser(): { id: string; email: string; name: string; role: string } | null {
    if (typeof window === 'undefined') return null

    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      
      // التحقق من انتهاء صلاحية الجلسة
      if (Date.now() - session.loginTime > this.SESSION_TIMEOUT) {
        this.logout()
        return null
      }

      return session.user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // تحديث الجلسة
  static refreshSession(): void {
    if (typeof window === 'undefined') return

    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        session.loginTime = Date.now()
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }
}




