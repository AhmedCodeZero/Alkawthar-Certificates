"use client"

import { useEffect, useState } from "react"
import { supabaseConfig, validateSupabaseConfig } from "@/lib/supabase-config"

export default function DebugInfo() {
  const [isValid, setIsValid] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    setIsValid(validateSupabaseConfig())
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">تشخيص النظام</span>
        <button
          onClick={() => setShowDebug(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Supabase URL:</span>
          <div className="text-xs break-all">
            {supabaseConfig.url}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">Anon Key:</span>
          <div className="text-xs">
            {supabaseConfig.anonKey ? 'موجود' : 'مفقود'}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">الحالة:</span>
          <span className={isValid ? 'text-green-400' : 'text-red-400'}>
            {isValid ? 'صحيح' : 'خطأ'}
          </span>
        </div>
        
        {!isValid && (
          <div className="text-red-400 text-xs space-y-1">
            <div>❌ ملف .env.local مفقود</div>
            <div>📋 راجع FINAL_LIVE_SETUP_GUIDE.md</div>
          </div>
        )}
      </div>
    </div>
  )
}
