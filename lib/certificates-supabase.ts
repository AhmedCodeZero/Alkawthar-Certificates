import { createClient } from './supabase-client'
import type { Certificate, CertificateInsert } from './supabase'

export type CertificateRecord = {
  id: string
  fileName: string
  mimeType: string
  dataUrl: string
  uploadedAt: number
}

// Fallback to localStorage for development/offline mode
const STORAGE_KEY = "akawthar-certificates-v1"

function read(): CertificateRecord[] {
  try {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(validRecord) : []
  } catch {
    return []
  }
}

function validRecord(r: unknown): r is CertificateRecord {
  return (
    typeof r === "object" &&
    r !== null &&
    typeof (r as any).id === "string" &&
    typeof (r as any).fileName === "string" &&
    typeof (r as any).mimeType === "string" &&
    typeof (r as any).dataUrl === "string" &&
    typeof (r as any).uploadedAt === "number"
  )
}

function write(data: CertificateRecord[]) {
  if (typeof window === "undefined") return
  
  try {
    const jsonData = JSON.stringify(data)
    const dataSize = new Blob([jsonData]).size
    console.log(`Attempting to write ${data.length} certificates, data size: ${(dataSize / 1024 / 1024).toFixed(2)} MB`)
    
    // Check if data size exceeds localStorage limit (usually 5-10MB)
    if (dataSize > 4 * 1024 * 1024) { // 4MB limit
      console.warn('Data size exceeds localStorage limit, storing only metadata')
      // Store only metadata without dataUrl to save space
      const compressedData = data.map(record => ({
        id: record.id,
        fileName: record.fileName,
        mimeType: record.mimeType,
        uploadedAt: record.uploadedAt,
        dataUrl: '' // Remove dataUrl to save space
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compressedData))
    } else {
      localStorage.setItem(STORAGE_KEY, jsonData)
    }
  } catch (error) {
    console.error('Error writing to localStorage:', error)
    // If localStorage fails, try to store only essential data
    try {
      const essentialData = data.map(record => ({
        id: record.id,
        fileName: record.fileName,
        mimeType: record.mimeType,
        uploadedAt: record.uploadedAt,
        dataUrl: ''
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(essentialData))
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError)
    }
  }
}

// Convert Supabase certificate to local format
function convertFromSupabase(cert: Certificate): CertificateRecord {
  return {
    id: cert.student_id,
    fileName: cert.file_name,
    mimeType: cert.mime_type,
    dataUrl: cert.file_data,
    uploadedAt: new Date(cert.uploaded_at).getTime(),
  }
}

// Convert local certificate to Supabase format
function convertToSupabase(record: CertificateRecord): CertificateInsert {
  return {
    student_id: record.id,
    file_name: record.fileName,
    mime_type: record.mimeType,
    file_data: record.dataUrl,
    uploaded_at: new Date(record.uploadedAt).toISOString(),
  }
}

export const Certificates = {
  async getAll(): Promise<CertificateRecord[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error fetching certificates from Supabase:', error)
        // Fallback to localStorage
        try {
          return read().sort((a, b) => b.uploadedAt - a.uploadedAt)
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError)
          return []
        }
      }

      return data.map(convertFromSupabase)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      try {
        return read().sort((a, b) => b.uploadedAt - a.uploadedAt)
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError)
        return []
      }
    }
  },

  async find(id: string): Promise<CertificateRecord | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', id)
        .single()

      if (error) {
        console.error('Error finding certificate in Supabase:', error)
        // Fallback to localStorage
        try {
          const all = read()
          return all.find((r) => r.id === id) ?? null
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError)
          return null
        }
      }

      return data ? convertFromSupabase(data) : null
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      try {
        const all = read()
        return all.find((r) => r.id === id) ?? null
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError)
        return null
      }
    }
  },

  async upsert(record: CertificateRecord): Promise<void> {
    try {
      const supabase = createClient()
      const supabaseRecord = convertToSupabase(record)
      
      const { error } = await supabase
        .from('certificates')
        .upsert(supabaseRecord, { 
          onConflict: 'student_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error upserting certificate to Supabase:', error)
        throw new Error(`Failed to save certificate: ${error.message}`)
      }

      // Also update localStorage as backup (with error handling)
      try {
        const all = read()
        const idx = all.findIndex((r) => r.id === record.id)
        if (idx >= 0) {
          all[idx] = record
        } else {
          all.push(record)
        }
        write(all)
      } catch (localStorageError) {
        console.warn('Failed to update localStorage backup:', localStorageError)
        // Don't throw error here as Supabase save was successful
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      throw new Error(`Failed to save certificate: ${error}`)
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('student_id', id)

      if (error) {
        console.error('Error removing certificate from Supabase:', error)
        // Fallback to localStorage
        try {
          const all = read().filter((r) => r.id !== id)
          write(all)
        } catch (localStorageError) {
          console.error('Error writing to localStorage:', localStorageError)
          throw new Error('Failed to remove certificate: localStorage quota exceeded')
        }
        return
      }

      // Also update localStorage as backup
      try {
        const all = read().filter((r) => r.id !== id)
        write(all)
      } catch (localStorageError) {
        console.warn('Failed to update localStorage backup:', localStorageError)
        // Don't throw error here as Supabase delete was successful
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      try {
        const all = read().filter((r) => r.id !== id)
        write(all)
      } catch (localStorageError) {
        console.error('Error writing to localStorage:', localStorageError)
        throw new Error('Failed to remove certificate: localStorage quota exceeded')
      }
    }
  },

  async clearAll(): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('certificates')
        .delete()
        .neq('student_id', '') // Delete all records

      if (error) {
        console.error('Error clearing certificates from Supabase:', error)
        // Fallback to localStorage
        try {
          write([])
        } catch (localStorageError) {
          console.error('Error writing to localStorage:', localStorageError)
          throw new Error('Failed to clear certificates: localStorage quota exceeded')
        }
        return
      }

      // Also clear localStorage as backup
      try {
        write([])
      } catch (localStorageError) {
        console.warn('Failed to update localStorage backup:', localStorageError)
        // Don't throw error here as Supabase clear was successful
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      try {
        write([])
      } catch (localStorageError) {
        console.error('Error writing to localStorage:', localStorageError)
        throw new Error('Failed to clear certificates: localStorage quota exceeded')
      }
    }
  },

  async replaceAll(list: CertificateRecord[]): Promise<void> {
    try {
      const supabase = createClient()
      
      // Clear existing records
      await this.clearAll()
      
      // Insert new records
      if (list.length > 0) {
        const supabaseRecords = list.map(convertToSupabase)
        const { error } = await supabase
          .from('certificates')
          .insert(supabaseRecords)

        if (error) {
          console.error('Error replacing certificates in Supabase:', error)
          // Fallback to localStorage
          try {
            const filtered = Array.isArray(list) ? list.filter(validRecord) : []
            write(filtered)
          } catch (localStorageError) {
            console.error('Error writing to localStorage:', localStorageError)
            throw new Error('Failed to replace certificates: localStorage quota exceeded')
          }
          return
        }
      }

      // Also update localStorage as backup
      try {
        const filtered = Array.isArray(list) ? list.filter(validRecord) : []
        write(filtered)
      } catch (localStorageError) {
        console.warn('Failed to update localStorage backup:', localStorageError)
        // Don't throw error here as Supabase replace was successful
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Fallback to localStorage
      try {
        const filtered = Array.isArray(list) ? list.filter(validRecord) : []
        write(filtered)
      } catch (localStorageError) {
        console.error('Error writing to localStorage:', localStorageError)
        throw new Error('Failed to replace certificates: localStorage quota exceeded')
      }
    }
  },
}




