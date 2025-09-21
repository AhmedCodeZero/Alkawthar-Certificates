"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import LoginForm from "@/components/login-form"
import AmbientBackground from "@/components/ambient-background"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // التحقق من حالة المصادقة عند تحميل المكون
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()

    // تحديث الجلسة كل 5 دقائق
    const refreshInterval = setInterval(() => {
      if (AuthService.isAuthenticated()) {
        AuthService.refreshSession()
      }
    }, 5 * 60 * 1000)

    // مراقبة تغييرات localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alkawthar_admin_auth') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogin = (email: string, password: string): boolean => {
    const success = AuthService.login(email, password)
    if (success) {
      setIsAuthenticated(true)
    }
    return success
  }

  const handleLogout = () => {
    AuthService.logout()
    setIsAuthenticated(false)
  }

  // عرض شاشة التحميل
  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <AmbientBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">جاري التحقق من الصلاحيات...</p>
          </div>
        </div>
      </main>
    )
  }

  // عرض صفحة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <AmbientBackground />
        <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-8 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-xs text-gray-300 transition hover:bg-gray-700 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              العودة
            </Link>
            <div className="text-sm text-gray-400">تسجيل الدخول - جمعية الكوثر الصحية</div>
          </div>

          <div className="flex min-h-[60vh] items-center justify-center">
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      </main>
    )
  }

  // عرض المحتوى المحمي مع زر تسجيل الخروج
  return (
    <div className="relative">
      {/* شريط التحكم العلوي */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              تسجيل الدخول - جمعية الكوثر الصحية
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-white transition-colors underline"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
      
      {/* المحتوى المحمي */}
      {children}
    </div>
  )
}




