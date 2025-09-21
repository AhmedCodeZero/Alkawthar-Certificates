"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Download,
  FileText,
  Search,
  WheatIcon as WhatsApp,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Certificates, type CertificateRecord } from "@/lib/certificates-supabase"
import { Settings } from "@/lib/settings-supabase"

export default function CertificateLookup() {
  const { toast } = useToast()
  const [studentId, setStudentId] = useState("")
  const [result, setResult] = useState<CertificateRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await Settings.get()
        setWhatsappUrl(s.whatsappCommunityUrl ?? null)
      } catch (error) {
        console.error('Error loading settings:', error)
        // Fallback to localStorage
        const s = Settings.get()
        setWhatsappUrl(s.whatsappCommunityUrl ?? null)
      }
    }
    
    loadSettings()
  }, [])

  async function onLookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setShowJoin(false)
    setSearchAttempted(true)
    setDownloaded(false)

    try {
      const id = studentId.trim()
      if (!id) {
        toast({
          title: "الرقم الجامعي مطلوب",
          description: "يرجى إدخال رقمك الجامعي للبحث عن الشهادة.",
          variant: "destructive",
        })
        return
      }

      // التحقق من صحة الرقم الجامعي (يجب أن يكون أرقام فقط)
      if (!/^\d+$/.test(id)) {
        toast({
          title: "رقم جامعي غير صحيح",
          description: "الرقم الجامعي يجب أن يحتوي على أرقام فقط.",
          variant: "destructive",
        })
        return
      }

      await new Promise((r) => setTimeout(r, 800))
      const rec = await Certificates.find(id)

      if (!rec) {
        toast({
          title: "لم يتم العثور على الشهادة",
          description: "تأكد من صحة الرقم الجامعي أو تواصل مع إدارة الجمعية.",
          variant: "destructive",
        })
        setResult(null)
      } else {
        setResult(rec)
        toast({
          title: "تم العثور على الشهادة بنجاح! 🎉",
          description: "يمكنك الآن معاينة أو تحميل شهادة التهنئة.",
        })
      }
    } catch (error) {
      toast({
        title: "حدث خطأ أثناء البحث",
        description: "يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!result) return
    const a = document.createElement("a")
    a.href = result.dataUrl
    const ext = result.mimeType.includes("pdf") ? "pdf" : result.fileName.split(".").pop() || "bin"
    a.download = `akawthar-${result.id}.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setShowJoin(true)
    setDownloaded(true)

    toast({
      title: "تم تحميل الشهادة بنجاح! 🎊",
      description: "مبروك على التخرج! نتمنى لك مستقبلاً مشرقاً.",
    })
  }

  function handleNewSearch() {
    setStudentId("")
    setResult(null)
    setShowJoin(false)
    setSearchAttempted(false)
    setDownloaded(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onLookup} className="mx-auto flex max-w-xl items-center gap-3">
        <Input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="أدخل رقمك الجامعي (مثال: 441234567)"
          className="flex-1 text-right bg-white/10 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:border-amber-400/50 backdrop-blur-sm h-12 text-lg font-medium rounded-xl"
          inputMode="numeric"
          aria-label="الرقم الجامعي"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !studentId.trim()}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-0 h-12 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {"جاري البحث..."}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {"بحث"}
            </>
          )}
        </Button>
      </form>

      <div className="space-y-4">
        {result ? (
          <Card className="border-white/20 bg-white/5 backdrop-blur-md shadow-2xl">
            <CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div className="text-right">
                  <div className="text-sm text-white font-semibold">🎉 تم العثور على شهادة التهنئة!</div>
                  <div className="text-xs text-white/70">{`الرقم الجامعي: ${result.id} • ${result.fileName}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={result.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/20 backdrop-blur-sm"
                  aria-label="معاينة الشهادة في تبويب جديد"
                >
                  <FileText className="h-4 w-4" />
                  {"معاينة"}
                </a>
                <Button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  {"تحميل الشهادة"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : searchAttempted && !loading ? (
          <Card className="border-white/20 bg-white/5 backdrop-blur-md shadow-2xl">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-400" />
                <div className="text-white">
                  <div className="text-sm font-semibold">❌ لم يتم العثور على الشهادة</div>
                  <div className="text-xs text-white/70 mt-1">الرقم الجامعي: {studentId}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <p>• تأكد من صحة الرقم الجامعي المدخل</p>
                <p>• تواصل مع إدارة الجمعية إذا كان الرقم صحيحاً</p>
                <p>• تأكد من أن الشهادة تم رفعها من قبل الإدارة</p>
              </div>
              <Button
                onClick={handleNewSearch}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {"بحث عن رقم آخر"}
              </Button>
            </CardContent>
          </Card>
        ) : !searchAttempted && !loading ? (
          <div className="flex items-center justify-center gap-3 text-white/60 py-8">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm md:text-base">{"أدخل رقمك الجامعي واضغط بحث للعثور على شهادة التهنئة"}</span>
          </div>
        ) : null}

        {downloaded && (
          <Card className="border-white/20 bg-white/5 backdrop-blur-md shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-white font-semibold">✅ تم تحميل الشهادة بنجاح!</span>
                </div>
                <p className="text-white/80 text-sm">هل تريد البحث عن شهادة أخرى؟</p>
                <Button
                  onClick={handleNewSearch}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {"البحث عن شهادة أخرى"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showJoin && whatsappUrl && (
          <div className="mx-auto max-w-2xl rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 p-6 text-center text-white backdrop-blur-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <WhatsApp className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-bold">🤝 انضم إلى مجتمع الخريجين!</h3>
              </div>
              <div className="space-y-2">
                <p className="text-white/90 font-medium">🎉 مبروك على التخرج من كلية الطب!</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  انضم إلى مجتمع «الكوثر الصحي» على واتساب للتواصل مع زملائك الخريجين وتبادل الخبرات المهنية في المجال
                  الطبي
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 text-white font-semibold transition-all duration-300 shadow-lg"
                aria-label="الانضمام إلى مجتمع الكوثر الصحي على واتساب"
              >
                <WhatsApp className="h-5 w-5" />
                {"انضم الآن إلى المجتمع"}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
