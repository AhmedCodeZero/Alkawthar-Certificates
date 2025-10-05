// نظام مصادقة موحد وبسيط
import { createClient } from './supabase-client'

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

export class UnifiedAuth {
  private static readonly STORAGE_KEY = 'admin_session'
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 ساعة

  // تسجيل الدخول
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('محاولة تسجيل الدخول:', { email })
      
      const supabase = createClient()
      
      // البحث عن المستخدم في قاعدة البيانات
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      console.log('نتيجة الاستعلام:', { user, error })

      if (error || !user) {
        console.log('خطأ في العثور على المستخدم:', error)
        return { success: false, error: 'المستخدم غير موجود أو غير نشط' }
      }

      // التحقق من كلمة المرور (بسيط)
      if (user.password !== password) {
        console.log('كلمة المرور غير صحيحة')
        return { success: false, error: 'كلمة المرور غير صحيحة' }
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
          isActive: user.is_active,
          createdAt: new Date(user.created_at)
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




