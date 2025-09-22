import type { Metadata } from "next"
import AdminPageClient from "./AdminPageClient"
import LocalAdminAuth from "@/components/local-admin-auth"
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "جمعية الكوثر الصحية",
  description: "منصة شهادات التهنئة للخريجين",
}

// حماية إضافية - إخفاء الصفحة من محركات البحث
export const robots = {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
  noimageindex: true,
}

export default function AdminPage() {
  // في بيئة الإنتاج، يمكن إضافة فحص إضافي هنا
  if (process.env.NODE_ENV === 'production') {
    // يمكن إضافة فحص headers أو IP هنا
  }
  
  return (
    <LocalAdminAuth>
      <AdminPageClient />
    </LocalAdminAuth>
  )
}
