"use client"

import { useEffect, useState } from "react"
import { Globe, Instagram, Youtube, XIcon } from "lucide-react"
import { Settings } from "@/lib/settings-supabase"

type Links = {
  xUrl?: string
  instagramUrl?: string
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
          instagramUrl: s.instagramUrl,
          youtubeUrl: s.youtubeUrl,
          websiteUrl: s.websiteUrl ?? "/",
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        // Fallback to localStorage
        const s = Settings.get()
        setLinks({
          xUrl: s.xUrl,
          instagramUrl: s.instagramUrl,
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
    { href: links.instagramUrl, label: "Instagram", Icon: Instagram },
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
