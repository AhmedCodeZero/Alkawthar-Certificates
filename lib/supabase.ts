import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      certificates: {
        Row: {
          id: string
          student_id: string
          file_name: string
          mime_type: string
          file_data: string
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          file_name: string
          mime_type: string
          file_data: string
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          file_name?: string
          mime_type?: string
          file_data?: string
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      app_logo: {
        Row: {
          id: string
          data_url: string
          file_name: string
          mime_type: string
          height_px: number
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          data_url: string
          file_name: string
          mime_type: string
          height_px?: number
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          data_url?: string
          file_name?: string
          mime_type?: string
          height_px?: number
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Certificate = Database['public']['Tables']['certificates']['Row']
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert']
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update']

export type AppSetting = Database['public']['Tables']['app_settings']['Row']
export type AppSettingInsert = Database['public']['Tables']['app_settings']['Insert']
export type AppSettingUpdate = Database['public']['Tables']['app_settings']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update']

export type AppLogo = Database['public']['Tables']['app_logo']['Row']
export type AppLogoInsert = Database['public']['Tables']['app_logo']['Insert']
export type AppLogoUpdate = Database['public']['Tables']['app_logo']['Update']
