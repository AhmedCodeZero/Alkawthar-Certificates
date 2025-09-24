import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// قائمة بالمسارات المحمية
const protectedPaths = ['/admin']

// قائمة بعناوين IP المسموحة (اختيارية - يمكن إزالتها للسماح للجميع)
const allowedIPs = [
  // يمكن إضافة عناوين IP محددة هنا
  // '192.168.1.100',
  // '10.0.0.50'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // التحقق من المسارات المحمية
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // في بيئة التطوير، السماح بالوصول
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }
    
    // في بيئة الإنتاج، يمكن إضافة فحص IP
    if (process.env.NODE_ENV === 'production') {
      const clientIP = request.ip || 
        request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown'
      
      // إذا كانت هناك قائمة IP محددة ولم يكن IP العميل مسموحاً
      if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
        return new NextResponse('Access Denied', { status: 403 })
      }
    }
    
    // إضافة headers أمان إضافية
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ]
}
