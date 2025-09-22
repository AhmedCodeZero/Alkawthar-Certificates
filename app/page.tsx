import type { Metadata } from "next"
import CertificateLookup from "@/components/certificate-lookup"
import AmbientBackground from "@/components/ambient-background"
import SocialIcons from "@/components/social-icons"
import HeroLogo from "@/components/hero-logo"

export const metadata: Metadata = {
  title: "تحميل التهنئة - جمعية الكوثر الصحية",
  description: "أدخل رقمك الجامعي لتحميل شهادة التهنئة الخاصة بتخرجك من كلية الطب من جمعية الكوثر الصحية.",
}

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-between px-4 py-8 sm:py-10 md:py-16 lg:py-20">
        <header className="flex w-full items-center justify-center">
          <div className="text-sm text-gray-400">{"جمعية الكوثر الصحية"}</div>
        </header>

        <section className="mt-8 md:mt-12 w-full">
          {/* Logo */}
          <HeroLogo />

          {/* Hero text with subtle glow */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="text-2xl font-medium leading-relaxed text-white md:text-3xl mb-4">
              {"جمعية الكوثر الصحية تهنئكم على تخرجكم من كلية الطب"}
            </h1>
            <p className="text-sm text-gray-400 md:text-base">{"لتحميل التهنئة أدخل رقمك الجامعي"}</p>
          </div>

          {/* Main search area with glow effect */}
          <div className="relative">
            {/* Glow effect behind the search */}
            <div className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl" />
            <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 blur-xl" />

            {/* Search component */}
            <div className="relative">
              <CertificateLookup />
            </div>
          </div>
        </section>

        <footer className="mt-12 md:mt-16 flex w-full items-center justify-center">
          <SocialIcons />
        </footer>
      </div>
    </main>
  )
}
