"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UnifiedAuth } from "@/lib/unified-auth"
import { Loader2, Lock, User, Mail, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

interface UnifiedAdminAuthProps {
  children: React.ReactNode
}

export default function UnifiedAdminAuth({ children }: UnifiedAdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // التحقق من حالة المصادقة
    const checkAuth = () => {
      try {
        const isAuth = UnifiedAuth.isAuthenticated()
        console.log('حالة المصادقة:', isAuth)
        setIsAuthenticated(isAuth)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // تحديث الجلسة كل 5 دقائق
    const refreshInterval = setInterval(() => {
      if (UnifiedAuth.isAuthenticated()) {
        UnifiedAuth.refreshSession()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(refreshInterval)
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
    setLoginAttempts(prev => prev + 1)
    
    try {
      console.log('محاولة تسجيل الدخول:', { email: trimmedEmail, attempt: loginAttempts + 1 })
      
      const result = await UnifiedAuth.login(trimmedEmail, trimmedPassword)
      
      if (result.success && result.user) {
        setIsAuthenticated(true)
        setLoginAttempts(0)
        toast({
          title: "تم تسجيل الدخول بنجاح! 🎉",
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
    UnifiedAuth.logout()
    setIsAuthenticated(false)
    setEmail("")
    setPassword("")
    setLoginAttempts(0)
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
                    disabled={isLoggingIn}
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
                    disabled={isLoggingIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    disabled={isLoggingIn}
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
                className="w-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
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
            
            {/* معلومات تسجيل الدخول */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                حسابات الاختبار:
              </h4>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span>admin@alkawthar.org.sa</span>
                  <span className="text-green-400">admin123</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>qeahmedalkawthar@gmail.com</span>
                  <span className="text-green-400">qe203582</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>dg@alkawthar.org.sa</span>
                  <span className="text-green-400">dg206582</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dm@alkawthar.org.sa</span>
                  <span className="text-green-400">dm206582</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>test@example.com</span>
                  <span className="text-green-400">test123</span>
                </div>
              </div>
            </div>

            {/* معلومات التصحيح */}
            {loginAttempts > 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center text-yellow-400 text-xs">
                  <XCircle className="h-4 w-4 mr-2" />
                  محاولة رقم {loginAttempts}
                </div>
                <p className="text-xs text-yellow-300 mt-1">
                  تأكد من صحة البيانات أو تحقق من وحدة التحكم
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {children}
      {/* زر تسجيل الخروج */}
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







