// بيانات المستخدمين المصرح لهم
const AUTHORIZED_USERS = [
  {
    email: "qeahmedalkawthar@gmail.com",
    password: "qe203582"
  },
  {
    email: "dg@alkawthar.org.sa", 
    password: "dg206582"
  },
  {
    email: "Dm@alkawthar.org.sa",
    password: "dm206582"
  },
  {
    email: "admin@alkawthar.org.sa",
    password: "admin123"
  },
  {
    email: "admin@example.com",
    password: "admin123"
  }
]

export interface User {
  email: string
  password: string
}

export class AuthService {
  private static readonly STORAGE_KEY = 'alkawthar_admin_auth'
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 ساعة

  // التحقق من صحة بيانات تسجيل الدخول
  static validateCredentials(email: string, password: string): boolean {
    return AUTHORIZED_USERS.some(
      user => user.email === email && user.password === password
    )
  }

  // تسجيل الدخول
  static login(email: string, password: string): boolean {
    if (this.validateCredentials(email, password)) {
      const sessionData = {
        email,
        loginTime: Date.now(),
        isAuthenticated: true
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData))
      }
      
      return true
    }
    return false
  }

  // تسجيل الخروج
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
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
      console.error('خطأ في التحقق من المصادقة:', error)
      this.logout()
      return false
    }
  }

  // الحصول على بيانات المستخدم الحالي
  static getCurrentUser(): { email: string } | null {
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

      return { email: session.email }
    } catch (error) {
      console.error('خطأ في الحصول على بيانات المستخدم:', error)
      return null
    }
  }

  // تحديث الجلسة (تمديد الصلاحية)
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
      console.error('خطأ في تحديث الجلسة:', error)
    }
  }
}


