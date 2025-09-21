"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AdminAuthService } from "@/lib/admin-auth"
import { Loader2, Lock, User, Mail, Eye, EyeOff } from "lucide-react"

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      try {
        const isAuth = AdminAuthService.isAuthenticated()
        setIsAuthenticated(isAuth)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    
    if (!trimmedEmail) {
      toast({
        title: "البريد الإلكتروني مطلوب",
        description: "يرجى إدخال البريد الإلكتروني.",
        variant: "destructive"
      })
      return
    }

    if (!trimmedPassword) {
      toast({
        title: "كلمة المرور مطلوبة",
        description: "يرجى إدخال كلمة المرور.",
        variant: "destructive"
      })
      return
    }

    setIsLoggingIn(true)
    try {
      console.log('محاولة تسجيل الدخول:', { email: trimmedEmail })
      
      // استخدام نظام المصادقة الجديد
      const result = await AdminAuthService.login({
        email: trimmedEmail,
        password: trimmedPassword
      })
      
      if (result.success && result.user) {
        setIsAuthenticated(true)
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${result.user.name} في لوحة الإدارة.`
        })
      } else {
        toast({
          title: "بيانات الدخول غير صحيحة",
          description: result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء التحقق من الصلاحيات.",
        variant: "destructive"
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    AdminAuthService.logout()
    setIsAuthenticated(false)
    setEmail("")
    setPassword("")
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك من لوحة الإدارة."
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-white">لوحة الإدارة</CardTitle>
            <CardDescription className="text-gray-400">
              أدخل البريد الإلكتروني وكلمة المرور للوصول إلى إعدادات التطبيق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                    className="pl-10 bg-gray-800 border-gray-700 text-white focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  أدخل كلمة المرور المسجلة في النظام
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {children}
      {/* Logout button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
