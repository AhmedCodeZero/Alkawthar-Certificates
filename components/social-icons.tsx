"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { Globe, Youtube, XIcon } from "lucide-react"
import { Settings } from "@/lib/settings-supabase"

type Links = {
  xUrl?: string
  whatsappCommunityUrl?: string
  youtubeUrl?: string
  websiteUrl?: string
}

export default function SocialIcons() {
  const [links, setLinks] = useState<Links>({})

  useEffect(() => {
    async function refresh() {
      try {
        const s = await Settings.get()
        setLinks({
          xUrl: s.xUrl,
          whatsappCommunityUrl: s.whatsappCommunityUrl,
          youtubeUrl: s.youtubeUrl,
          websiteUrl: s.websiteUrl ?? "/",
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        // Fallback to localStorage
        const s = await Settings.get()
        setLinks({
          xUrl: s.xUrl,
          whatsappCommunityUrl: s.whatsappCommunityUrl,
          youtubeUrl: s.youtubeUrl,
          websiteUrl: s.websiteUrl ?? "/",
        })
      }
    }

    refresh()

    function onStorage(e: StorageEvent) {
      if (e.key === "akawthar-settings-v1" || !e.key) {
        refresh()
      }
    }
    function onCustom() {
      refresh()
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("ak-settings-updated", onCustom as EventListener)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("ak-settings-updated", onCustom as EventListener)
    }
  }, [])

  const items = [
    { href: links.xUrl, label: "X", Icon: XIcon },
    { href: links.whatsappCommunityUrl, label: "WhatsApp", Icon: WhatsAppIcon },
    { href: links.youtubeUrl, label: "YouTube", Icon: Youtube },
    { href: links.websiteUrl ?? "/", label: "الموقع الإلكتروني", Icon: Globe },
  ] as const

  return (
    <nav aria-label={"حسابات الجمعية على الشبكات الاجتماعية"}>
      <ul className="flex items-center gap-6">
        {items.map(({ href, label, Icon }, idx) => {
          const isActive = Boolean(href && href.trim() !== "")
          const isExternal = isActive && /^https?:\/\//i.test(href as string)
          const anchorProps = isActive
            ? {
                href: href as string,
                target: isExternal ? "_blank" : undefined,
                rel: isExternal ? "noopener noreferrer" : undefined,
              }
            : {
                href: "#",
                "aria-disabled": true,
                tabIndex: -1,
              }
          return (
            <li key={label}>
              <a
                {...anchorProps}
                aria-label={label}
                className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors pointer-events-auto hover:text-white ${
                  isActive ? "" : "pointer-events-none opacity-40"
                }`}
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.62-6.01C.122 5.281 5.403 0 12.057 0c3.186 0 6.167 1.24 8.413 3.488a11.82 11.82 0 013.5 8.394c-.003 6.653-5.284 12.035-11.938 12.035a11.95 11.95 0 01-6.012-1.616L.057 24zm6.597-3.807a9.798 9.798 0 005.403 1.58c5.448 0 9.886-4.434 9.889-9.877.002-5.462-4.415-9.89-9.881-9.893-5.452 0-9.885 4.43-9.888 9.872a9.8 9.8 0 001.596 5.22l-.999 3.648 3.88-.95zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.03-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}
