"use client"

import { useEffect, useState } from "react"
import { Logo, type LogoAsset } from "@/lib/logo-supabase"

export default function HeroLogo() {
  const [logo, setLogo] = useState<LogoAsset | null>(null)
  const [heightPx, setHeightPx] = useState<number>(160)

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logoData = await Logo.get()
        setLogo(logoData)
        setHeightPx(Logo.getHeightPx())
      } catch (error) {
        console.error('Error loading logo:', error)
        // Fallback to localStorage
        setLogo(Logo.get())
        setHeightPx(Logo.getHeightPx())
      }
    }

    loadLogo()

    function onStorage(e: StorageEvent) {
      if (!e.key) {
        loadLogo()
        return
      }
      // Refresh on either asset or size updates
      if (e.key === "akawthar-logo-v1" || e.key === "akawthar-logo-height-px") {
        loadLogo()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <div className="mb-6 flex w-full justify-center">
      {logo ? (
        // شعار مستطيل كبير في أعلى الصفحة بدون إطارات أو ظلال
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.dataUrl || "/placeholder.svg"}
          alt={"شعار جمعية الكوثر الصحية"}
          className="w-auto object-contain"
          style={{ height: `${heightPx}px`, maxWidth: "92vw" }}
        />
      ) : (
        // مسافة احتياطية إذا لم يُرفع شعار بعد
        <div className="h-16 w-full max-w-4xl md:h-24 lg:h-28" />
      )}
    </div>
  )
}
