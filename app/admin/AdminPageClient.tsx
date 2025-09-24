"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AmbientBackground from "@/components/ambient-background"
import { useToast } from "@/hooks/use-toast"
import { type CertificateRecord, Certificates } from "@/lib/certificates-supabase"
import SocialIcons from "@/components/social-icons"
import Link from "next/link"
import { fileToDataUrl } from "@/lib/utils"
import { Logo, type LogoAsset } from "@/lib/logo-supabase"
import { Settings } from "@/lib/settings-supabase"
import { ImageIcon, Loader2, Plus, X, Trash2, FileText, Calendar, Upload, CheckCircle, AlertCircle, FolderOpen, Download, Folder, RotateCcw } from "lucide-react"

export default function AdminPageClient() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [records, setRecords] = useState<CertificateRecord[]>([])

  // Batch upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [batchUploading, setBatchUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 })
  const [uploadResults, setUploadResults] = useState<{ success: string[]; errors: string[] }>({ success: [], errors: [] })
  const [failedFiles, setFailedFiles] = useState<File[]>([])

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logo, setLogo] = useState<LogoAsset | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)
  const [logoHeight, setLogoHeight] = useState<number>(160)

  // Links/Settings
  const [whatsappUrl, setWhatsappUrl] = useState<string>("")
  const [xUrl, setXUrl] = useState<string>("")
  const [instagramUrl, setInstagramUrl] = useState<string>("")
  const [youtubeUrl, setYoutubeUrl] = useState<string>("")
  const [websiteUrl, setWebsiteUrl] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [certificates, logo, settings] = await Promise.all([
          Certificates.getAll(),
          Logo.get(),
          Settings.get()
        ])
        
        setRecords(certificates)
        setLogo(logo)
        setLogoHeight(Logo.getHeightPx())
        setWhatsappUrl(settings.whatsappCommunityUrl ?? "")
        setXUrl(settings.xUrl ?? "")
        setInstagramUrl(settings.instagramUrl ?? "")
        setYoutubeUrl(settings.youtubeUrl ?? "")
        setWebsiteUrl(settings.websiteUrl ?? "")
      } catch (error) {
        console.error('Error loading data:', error)
        setRecords([])
        // Fallback to localStorage
        setLogo(Logo.get())
        setLogoHeight(Logo.getHeightPx())
        const s = Settings.get()
        setWhatsappUrl(s.whatsappCommunityUrl ?? "")
        setXUrl(s.xUrl ?? "")
        setInstagramUrl(s.instagramUrl ?? "")
        setYoutubeUrl(s.youtubeUrl ?? "")
        setWebsiteUrl(s.websiteUrl ?? "")
      }
    }
    
    loadData()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast({ title: "الملف مطلوب", description: "يرجى اختيار ملف الشهادة.", variant: "destructive" })
      return
    }

    // استخراج الرقم الجامعي من اسم الملف
    const fileName = file.name
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "") // إزالة امتداد الملف
    const extractedId = fileNameWithoutExt.trim()

    if (!extractedId) {
      toast({
        title: "اسم الملف غير صالح",
        description: "يجب أن يكون اسم الملف هو الرقم الجامعي.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      const rec: CertificateRecord = {
        id: extractedId,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        dataUrl,
        uploadedAt: Date.now(),
      }
      const existed = Boolean(await Certificates.find(extractedId))
      await Certificates.upsert(rec)
      const updatedRecords = await Certificates.getAll()
      setRecords(updatedRecords)
      setFile(null)
      ;(document.getElementById("file-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("file-input") as HTMLInputElement).value = "")
      toast({
        title: existed ? "تم التحديث" : "تمت الإضافة",
        description: existed
          ? `تم تحديث الشهادة للرقم الجامعي: ${extractedId}`
          : `تمت إضافة الشهادة للرقم الجامعي: ${extractedId}`,
      })
    } catch {
      toast({ title: "خطأ أثناء الحفظ", description: "يرجى المحاولة مرة أخرى.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle batch file selection
  function handleBatchFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setUploadResults({ success: [], errors: [] })
  }

  // Handle drag and drop for batch upload
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      setSelectedFiles(files)
      setUploadResults({ success: [], errors: [] })
    }
  }

  // Handle batch upload
  async function handleBatchUpload(e: React.FormEvent) {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      toast({ title: "لا توجد ملفات", description: "يرجى اختيار ملفات للرفع.", variant: "destructive" })
      return
    }

    console.log(`Starting batch upload of ${selectedFiles.length} files`)
    
    setBatchUploading(true)
    setUploadProgress({ current: 0, total: selectedFiles.length })
    setUploadResults({ success: [], errors: [] })
    setFailedFiles([])

    const successIds: string[] = []
    const errorIds: string[] = []
    const failedFilesList: File[] = []

    try {

    // Process files in batches to avoid overwhelming the system
    const BATCH_SIZE = 3
    const batches = []
    for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
      batches.push(selectedFiles.slice(i, i + BATCH_SIZE))
    }
    
    console.log(`Created ${batches.length} batches for ${selectedFiles.length} files`)

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      
      // Process batch in parallel
      const batchPromises = batch.map(async (file, fileIndex) => {
        const globalIndex = batchIndex * BATCH_SIZE + fileIndex
        
        try {
          // استخراج الرقم الجامعي من اسم الملف
          const fileName = file.name
          const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
          const extractedId = fileNameWithoutExt.trim()

          if (!extractedId) {
            return { success: false, id: file.name, error: "اسم الملف غير صالح" }
          }

          // Skip duplicate check for batch upload to avoid false positives
          // The upsert function will handle duplicates properly
          console.log(`Processing file: ${file.name} with extracted ID: ${extractedId}`)
          console.log(`File size: ${file.size} bytes, MIME type: ${file.type}`)
          
          const dataUrl = await fileToDataUrl(file)
          console.log(`File ${file.name} converted to data URL successfully`)
          
          const rec: CertificateRecord = {
            id: extractedId,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            dataUrl,
            uploadedAt: Date.now(),
          }

          console.log(`Uploading certificate for ${extractedId}...`)
          await Certificates.upsert(rec)
          console.log(`Certificate for ${extractedId} uploaded successfully`)
          return { success: true, id: extractedId, error: null }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف"
          console.log(`File ${file.name} failed with error: ${errorMessage}`)
          
          // Check if it's a localStorage quota error
          if (errorMessage.includes('quota exceeded') || errorMessage.includes('setItem')) {
            return { 
              success: false, 
              id: file.name, 
              error: "تم تجاوز حد التخزين المحلي. تم حفظ الشهادة في قاعدة البيانات فقط."
            }
          }
          
          return { 
            success: false, 
            id: file.name, 
            error: errorMessage
          }
        }
      })

      // Wait for batch to complete
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} files`)
      const batchResults = await Promise.all(batchPromises)
      console.log(`Batch ${batchIndex + 1} completed with results:`, batchResults)
      
      // Update progress
      const currentProgress = Math.min((batchIndex + 1) * BATCH_SIZE, selectedFiles.length)
      setUploadProgress({ current: currentProgress, total: selectedFiles.length })
      
      // Process results
      batchResults.forEach((result, index) => {
        if (result.success) {
          successIds.push(result.id)
        } else {
          errorIds.push(`${result.id} - ${result.error}`)
          // Find the corresponding file and add to failed files
          const correspondingFile = batch[index]
          if (correspondingFile) {
            failedFilesList.push(correspondingFile)
          }
        }
      })

      // Update results in real-time
      setUploadResults({ success: [...successIds], errors: [...errorIds] })
      
      // Small delay between batches to prevent overwhelming the system
      if (batchIndex < batches.length - 1) {
        console.log(`Waiting before next batch...`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // تحديث قائمة الشهادات
    console.log(`Upload completed. Updating records...`)
    const updatedRecords = await Certificates.getAll()
    setRecords(updatedRecords)
    console.log(`Records updated. Total: ${updatedRecords.length}`)

    // إظهار النتائج
    console.log(`Final results - Success: ${successIds.length}, Errors: ${errorIds.length}`)
    
    if (successIds.length > 0) {
      toast({
        title: "تم رفع الشهادات بنجاح",
        description: `تم رفع ${successIds.length} شهادة بنجاح`,
      })
    }

    if (errorIds.length > 0) {
      const quotaErrors = errorIds.filter(error => error.includes('حد التخزين المحلي'))
      const otherErrors = errorIds.filter(error => !error.includes('حد التخزين المحلي'))
      
      if (quotaErrors.length > 0) {
        toast({
          title: "تم تجاوز حد التخزين المحلي",
          description: `${quotaErrors.length} شهادة تم حفظها في قاعدة البيانات فقط. ${otherErrors.length} شهادة فشلت في الرفع.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "أخطاء في الرفع",
          description: `فشل في رفع ${errorIds.length} شهادة. يمكنك إعادة المحاولة للشهادات الفاشلة.`,
          variant: "destructive",
        })
      }
    }

    // Save failed files for retry
    setFailedFiles(failedFilesList)

    // مسح الملفات المحددة
    setSelectedFiles([])
    ;(document.getElementById("batch-file-input") as HTMLInputElement | null)?.value &&
      ((document.getElementById("batch-file-input") as HTMLInputElement).value = "")

    setBatchUploading(false)
    console.log(`Batch upload process completed`)
    } catch (error) {
      console.error('Error in batch upload:', error)
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ غير متوقع أثناء الرفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
      setBatchUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  // Clear selected files
  function clearSelectedFiles() {
    setSelectedFiles([])
    setUploadResults({ success: [], errors: [] })
    setFailedFiles([])
    ;(document.getElementById("batch-file-input") as HTMLInputElement | null)?.value &&
      ((document.getElementById("batch-file-input") as HTMLInputElement).value = "")
  }

  // Retry failed uploads
  function retryFailedUploads() {
    if (failedFiles.length > 0) {
      setSelectedFiles(failedFiles)
      setUploadResults({ success: [], errors: [] })
      setFailedFiles([])
      toast({
        title: "تم تحميل الملفات الفاشلة",
        description: `تم تحميل ${failedFiles.length} ملف لإعادة المحاولة`,
      })
    }
  }

  // Clear all certificates
  async function handleClearAllCertificates() {
    const ok = confirm("هل أنت متأكد من حذف جميع الشهادات؟ لا يمكن التراجع عن هذا الإجراء.")
    if (!ok) return

    try {
      await Certificates.clearAll()
      const updatedRecords = await Certificates.getAll()
      setRecords(updatedRecords)
      toast({
        title: "تم حذف جميع الشهادات",
        description: "تم حذف جميع الشهادات بنجاح",
      })
    } catch (error) {
      console.error('Error clearing certificates:', error)
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الشهادات. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      })
    }
  }

  // Export certificates list
  function handleExportCertificates() {
    if (records.length === 0) {
      toast({
        title: "لا توجد شهادات",
        description: "لا توجد شهادات للتصدير",
        variant: "destructive"
      })
      return
    }

    const csvContent = [
      "الرقم الجامعي,اسم الملف,نوع الملف,تاريخ الرفع",
      ...records.map(record => 
        `${record.id},"${record.fileName}","${record.mimeType}","${formatDate(record.uploadedAt)}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `certificates-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "تم تصدير القائمة",
      description: `تم تصدير ${records.length} شهادة بنجاح`,
    })
  }

  // Handle folder upload
  function handleFolderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    )
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles)
      setUploadResults({ success: [], errors: [] })
      toast({
        title: "تم تحديد الملفات",
        description: `تم تحديد ${validFiles.length} ملف صالح للرفع`,
      })
    } else {
      toast({
        title: "لا توجد ملفات صالحة",
        description: "يرجى اختيار ملفات PDF أو صور",
        variant: "destructive"
      })
    }
  }

  async function handleDeleteCertificate(id: string) {
    try {
      await Certificates.remove(id)
      const updatedRecords = await Certificates.getAll()
      setRecords(updatedRecords)
      toast({
        title: "تم الحذف",
        description: `تم حذف الشهادة للرقم الجامعي: ${id}`,
      })
    } catch (error) {
      console.error('Error deleting certificate:', error)
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الشهادة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      })
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  async function handleSaveLogo(e: React.FormEvent) {
    e.preventDefault()
    if (!logoFile) {
      toast({ title: "الملف مطلوب", description: "يرجى اختيار صورة للشعار.", variant: "destructive" })
      return
    }
    setSavingLogo(true)
    try {
      const dataUrl = await fileToDataUrl(logoFile)
      const asset: LogoAsset = {
        dataUrl,
        fileName: logoFile.name,
        mimeType: logoFile.type || "image/png",
        uploadedAt: Date.now(),
      }
      await Logo.set(asset, logoHeight)
      setLogo(asset)
      setLogoFile(null)
      ;(document.getElementById("logo-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("logo-input") as HTMLInputElement).value = "")
      toast({ title: "تم حفظ الشعار", description: "سيظهر الشعار في الصفحة الرئيسية." })
    } catch {
      toast({ title: "خطأ أثناء الحفظ", description: "يرجى المحاولة مرة أخرى.", variant: "destructive" })
    } finally {
      setSavingLogo(false)
    }
  }

  async function handleRemoveLogo() {
    const ok = confirm("هل تريد إزالة الشعار؟")
    if (!ok) return
    try {
      await Logo.clear()
      setLogo(null)
      toast({ title: "تمت إزالة الشعار" })
    } catch (error) {
      console.error('Error removing logo:', error)
      toast({ title: "خطأ في إزالة الشعار", description: "يرجى المحاولة مرة أخرى.", variant: "destructive" })
    }
  }

  async function handleLogoHeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    const clamped = Math.max(64, Math.min(320, Math.floor(val)))
    setLogoHeight(clamped)
    try {
      await Logo.setHeightPx(clamped)
    } catch (error) {
      console.error('Error updating logo height:', error)
    }
  }

  function normalizeUrl(value: string | undefined) {
    if (value == null) return ""
    const s = value.trim()
    if (s === "") return ""
    if (s.startsWith("/")) return s
    try {
      const url = new URL(s)
      if (!/^https?:$/.test(url.protocol)) throw new Error("invalid")
      return url.toString()
    } catch {
      try {
        const patched = s.replace(/^\/*/, "")
        const url2 = new URL("https://" + patched)
        return url2.toString()
      } catch {
        return "__INVALID__"
      }
    }
  }

  async function handleSaveWhatsapp(e: React.FormEvent) {
    e.preventDefault()
    const normalized = normalizeUrl(whatsappUrl)
    if (normalized === "__INVALID__") {
      toast({ title: "رابط غير صالح", description: "يرجى إدخال رابط صحيح.", variant: "destructive" })
      return
    }
    try {
      await Settings.set({ whatsappCommunityUrl: normalized })
      setWhatsappUrl(normalized ?? "")
      Settings.notifyUpdate()
      toast({ title: "تم الحفظ", description: normalized ? "تم حفظ رابط مجتمع واتساب." : "تم مسح الرابط." })
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error)
      toast({ title: "خطأ في الحفظ", description: "يرجى المحاولة مرة أخرى.", variant: "destructive" })
    }
  }

  async function handleSaveSocial(e: React.FormEvent) {
    e.preventDefault()
    const nx = normalizeUrl(xUrl)
    const ni = normalizeUrl(instagramUrl)
    const ny = normalizeUrl(youtubeUrl)
    const nw = normalizeUrl(websiteUrl)

    if ([nx, ni, ny, nw].some((v) => v === "__INVALID__")) {
      toast({
        title: "روابط غير صالحة",
        description: "يرجى إدخال روابط صحيحة.",
        variant: "destructive",
      })
      return
    }

    try {
      await Settings.set({
        xUrl: nx || "",
        instagramUrl: ni || "",
        youtubeUrl: ny || "",
        websiteUrl: nw || "",
      })

      setXUrl(nx || "")
      setInstagramUrl(ni || "")
      setYoutubeUrl(ny || "")
      setWebsiteUrl(nw || "")

      Settings.notifyUpdate()
      toast({ title: "تم الحفظ", description: "تم تحديث روابط حسابات التواصل." })
    } catch (error) {
      console.error('Error saving social settings:', error)
      toast({ title: "خطأ في الحفظ", description: "يرجى المحاولة مرة أخرى.", variant: "destructive" })
    }
  }

  const total = useMemo(() => records.length, [records])

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AmbientBackground />
      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full bg-gray-800 px-4 py-2 text-xs text-gray-300 transition hover:bg-gray-700 hover:text-white"
          >
            {"العودة"}
          </Link>
          <div className="text-sm text-gray-400">{"إدارة الشهادات - جمعية الكوثر الصحية"}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Batch Upload Card */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {"رفع الشهادات بشكل مجمع"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {"ارفع عدة شهادات مرة واحدة. يجب أن يكون اسم كل ملف هو الرقم الجامعي (مثال: 441234567.pdf)."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Batch Upload Form */}
              <form onSubmit={handleBatchUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-file-input" className="text-gray-300">
                    {"ملفات الشهادات (متعددة)"}
                  </Label>
                  
                  {/* Drag and Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/30 p-6 text-center transition-colors hover:border-gray-500"
                  >
                    <FolderOpen className="mx-auto h-12 w-12 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">
                      {"اسحب الملفات هنا أو اضغط للاختيار"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {"أو استخدم زر 'اختيار مجلد' لرفع مجلد كامل"}
                    </p>
                    <Input
                      id="batch-file-input"
                      type="file"
                      accept="application/pdf,image/*"
                      multiple
                      onChange={handleBatchFileSelect}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {"يدعم PDF أو صور PNG/JPG. يمكن اختيار عدة ملفات مرة واحدة أو سحبها وإفلاتها أو اختيار مجلد كامل."}
                  </p>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">{"الملفات المحددة"}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedFiles}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50 p-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {batchUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>{"جاري الرفع..."}</span>
                      <span>{`${uploadProgress.current} / ${uploadProgress.total}`}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Results */}
                {uploadResults.success.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>{"تم رفع الشهادات بنجاح:"}</span>
                    </div>
                    <div className="max-h-20 space-y-1 overflow-y-auto rounded-lg border border-green-700 bg-green-900/20 p-2">
                      {uploadResults.success.map((id, index) => (
                        <div key={index} className="text-xs text-green-300">{id}</div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{"أخطاء في الرفع:"}</span>
                      </div>
                      {failedFiles.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={retryFailedUploads}
                          className="text-orange-400 border-orange-600 hover:bg-orange-900/20 hover:text-orange-300"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {"إعادة المحاولة"}
                        </Button>
                      )}
                    </div>
                    <div className="max-h-20 space-y-1 overflow-y-auto rounded-lg border border-red-700 bg-red-900/20 p-2">
                      {uploadResults.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-300">{error}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={batchUploading || selectedFiles.length === 0}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white"
                    title="رفع جميع الملفات المحددة"
                  >
                    {batchUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {batchUploading ? "جارٍ الرفع..." : `رفع ${selectedFiles.length} شهادة`}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('folder-input')?.click()}
                    className="text-blue-400 border-blue-600 hover:bg-blue-900/20 hover:text-blue-300"
                    title="اختيار مجلد كامل لرفع جميع الملفات الموجودة فيه"
                  >
                    <Folder className="h-4 w-4" />
                    {"اختيار مجلد"}
                  </Button>
                  
                  <input
                    id="folder-input"
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    onChange={handleFolderUpload}
                    className="hidden"
                    webkitdirectory=""
                    directory=""
                  />
                  
                  {selectedFiles.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearSelectedFiles}
                      className="text-gray-300 border-gray-600 hover:bg-gray-800"
                      title="مسح جميع الملفات المحددة"
                    >
                      <X className="h-4 w-4" />
                      {"مسح"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Single Upload Card */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">{"رفع شهادة واحدة"}</CardTitle>
              <CardDescription className="text-gray-400">
                {"ارفع ملف شهادة واحد. يجب أن يكون اسم الملف هو الرقم الجامعي (مثال: 441234567.pdf)."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Single Upload Form */}
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-input" className="text-gray-300">
                    {"ملف الشهادة"}
                  </Label>
                  <Input
                    id="file-input"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="bg-gray-800 border-gray-700 text-white file:text-white focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {"يدعم PDF أو صور PNG/JPG. سيتم حفظها محلياً في المتصفح لأغراض العرض."}
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {submitting ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </form>

              {/* Certificates List */}
              <div className="border-t border-gray-700 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">{"الشهادات المرفوعة"}</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                      {total}
                    </span>
                    {total > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportCertificates}
                          className="text-green-400 border-green-600 hover:bg-green-900/20 hover:text-green-300"
                          title="تصدير قائمة الشهادات كملف CSV"
                        >
                          <Download className="h-3 w-3" />
                          {"تصدير"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearAllCertificates}
                          className="text-red-400 border-red-600 hover:bg-red-900/20 hover:text-red-300"
                          title="حذف جميع الشهادات (لا يمكن التراجع)"
                        >
                          <Trash2 className="h-3 w-3" />
                          {"حذف الكل"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {records.length === 0 ? (
                  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">{"لا توجد شهادات مرفوعة"}</p>
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">{record.id}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(record.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCertificate(record.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logo Card */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">{"الشعار"}</CardTitle>
              <CardDescription className="text-gray-400">
                {"ارفع شعار الجمعية وتَحكّم في حجمه كما يظهر في الصفحة الرئيسية."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveLogo} className="space-y-5">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      logo?.dataUrl ||
                      "/placeholder.svg?height=80&width=200&query=brand%20logo%20placeholder%20rectangular" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={"معاينة الشعار"}
                    className="object-contain"
                    style={{ height: `${Math.max(60, Math.floor(logoHeight * 0.6))}px`, width: "auto" }}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="logo-input" className="text-gray-300">
                      {"ملف الشعار (PNG/SVG/JPG)"}
                    </Label>
                    <Input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                      className="bg-gray-800 border-gray-700 text-white file:text-white focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
                    />
                    <p className="text-xs text-gray-500">{"يفضل خلفية شفافة، ودقة لا تقل عن 512×256."}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-height" className="text-gray-300">
                    {"حجم ظهور الشعار في الصفحة الرئيسية"}
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="logo-height"
                      type="range"
                      min={64}
                      max={320}
                      step={4}
                      value={logoHeight}
                      onChange={handleLogoHeightChange}
                      className="w-full accent-blue-500"
                    />
                    <span className="w-14 text-right text-xs text-gray-400">{`${logoHeight}px`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={savingLogo}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    {savingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    {savingLogo ? "جارٍ الحفظ..." : "حفظ الشعار"}
                  </Button>
                  {logo && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleRemoveLogo}
                      className="inline-flex gap-2"
                    >
                      <X className="h-4 w-4" />
                      {"إزالة الشعار"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* spacing */}
        <div className="my-8" />

        {/* WhatsApp + Social Settings */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{"مجتمع واتساب"}</CardTitle>
            <CardDescription className="text-gray-400">
              {"أدخل رابط مجموعة واتساب الخاصة بـ «الكوثر الصحي». سيظهر تنبيه للانضمام بعد تنزيل الشهادة."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WhatsAppSettings whatsappUrl={whatsappUrl} setWhatsappUrl={setWhatsappUrl} onSave={handleSaveWhatsapp} />
          </CardContent>
        </Card>

        <div className="my-6" />
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">{"حسابات التواصل الاجتماعي"}</CardTitle>
            <CardDescription className="text-gray-400">
              {"أدخل روابط الحسابات ليتم ربط الأيقونات في الصفحة الرئيسية والتذييل."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialSettings
              xUrl={xUrl}
              setXUrl={setXUrl}
              instagramUrl={instagramUrl}
              setInstagramUrl={setInstagramUrl}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              websiteUrl={websiteUrl}
              setWebsiteUrl={setWebsiteUrl}
              onSave={handleSaveSocial}
            />
          </CardContent>
        </Card>

        <div className="mt-10 flex justify-center">
          <SocialIcons />
        </div>
      </div>
    </main>
  )
}

function WhatsAppSettings({
  whatsappUrl,
  setWhatsappUrl,
  onSave,
}: {
  whatsappUrl: string
  setWhatsappUrl: (v: string) => void
  onSave: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSave} className="space-y-3">
      <Label htmlFor="wa-url" className="text-gray-300">
        {"رابط مجتمع واتساب"}
      </Label>
      <Input
        id="wa-url"
        placeholder="https://chat.whatsapp.com/..."
        value={whatsappUrl}
        onChange={(e) => setWhatsappUrl(e.target.value)}
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
          {"حفظ الرابط"}
        </Button>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            {"فتح الرابط"}
          </a>
        )}
      </div>
      <p className="text-xs text-gray-500">{"اترك الحقل فارغًا لمسح الرابط وإخفاء التنبيه من الصفحة الرئيسية."}</p>
    </form>
  )
}

function SocialSettings(props: {
  xUrl: string
  setXUrl: (v: string) => void
  instagramUrl: string
  setInstagramUrl: (v: string) => void
  youtubeUrl: string
  setYoutubeUrl: (v: string) => void
  websiteUrl: string
  setWebsiteUrl: (v: string) => void
  onSave: (e: React.FormEvent) => void
}) {
  const { xUrl, setXUrl, instagramUrl, setInstagramUrl, youtubeUrl, setYoutubeUrl, websiteUrl, setWebsiteUrl, onSave } =
    props
  return (
    <form onSubmit={onSave} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="x-url" className="text-gray-300">
          {"رابط X (تويتر سابقًا)"}
        </Label>
        <Input
          id="x-url"
          placeholder="https://x.com/..."
          value={xUrl}
          onChange={(e) => setXUrl(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instagram-url" className="text-gray-300">
          {"رابط Instagram"}
        </Label>
        <Input
          id="instagram-url"
          placeholder="https://instagram.com/..."
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="youtube-url" className="text-gray-300">
          {"رابط YouTube"}
        </Label>
        <Input
          id="youtube-url"
          placeholder="https://youtube.com/@..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website-url" className="text-gray-300">
          {"رابط الموقع الإلكتروني"}
        </Label>
        <Input
          id="website-url"
          placeholder="https://example.org"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500/50"
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
          {"حفظ روابط الحسابات"}
        </Button>
      </div>
    </form>
  )
}
