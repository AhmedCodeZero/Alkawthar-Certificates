import type { Metadata } from "next"
import AdminPageClient from "./AdminPageClient"
import LocalAdminAuth from "@/components/local-admin-auth"

export const metadata: Metadata = {
  title: "تسجيل الدخول - جمعية الكوثر الصحية",
  description: "نظام إدارة شهادات التهنئة للخريجين",
}

export default function AdminPage() {
  return (
    <LocalAdminAuth>
      <AdminPageClient />
    </LocalAdminAuth>
  )
}
