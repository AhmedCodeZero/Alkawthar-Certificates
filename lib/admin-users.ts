import { createClient } from './supabase-client'
import type { AdminUser, AdminUserInsert, AdminUserUpdate } from './supabase'

export type AdminUserData = {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

// Convert Supabase user to local format
function convertFromSupabase(user: AdminUser): AdminUserData {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.is_active,
    lastLogin: user.last_login ? new Date(user.last_login) : null,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  }
}

// Convert local user to Supabase format
function convertToSupabase(user: Partial<AdminUserData>): AdminUserInsert {
  return {
    email: user.email!,
    name: user.name!,
    role: user.role || 'admin',
    is_active: user.isActive ?? true,
    last_login: user.lastLogin?.toISOString() || null,
  }
}

export const AdminUsers = {
  async getAll(): Promise<AdminUserData[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching admin users:', error)
        return []
      }

      return data.map(convertFromSupabase)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return []
    }
  },

  async findById(id: string): Promise<AdminUserData | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error finding admin user:', error)
        return null
      }

      return data ? convertFromSupabase(data) : null
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return null
    }
  },

  async findByEmail(email: string): Promise<AdminUserData | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        console.error('Error finding admin user by email:', error)
        return null
      }

      return data ? convertFromSupabase(data) : null
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return null
    }
  },

  async create(userData: Omit<AdminUserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUserData | null> {
    try {
      const supabase = createClient()
      const supabaseUser = convertToSupabase(userData)
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert(supabaseUser)
        .select()
        .single()

      if (error) {
        console.error('Error creating admin user:', error)
        return null
      }

      return convertFromSupabase(data)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return null
    }
  },

  async update(id: string, updates: Partial<AdminUserData>): Promise<AdminUserData | null> {
    try {
      const supabase = createClient()
      const updateData: AdminUserUpdate = {}
      
      if (updates.email) updateData.email = updates.email
      if (updates.name) updateData.name = updates.name
      if (updates.role) updateData.role = updates.role
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.lastLogin) updateData.last_login = updates.lastLogin.toISOString()

      const { data, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating admin user:', error)
        return null
      }

      return convertFromSupabase(data)
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting admin user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      return false
    }
  },

  async updateLastLogin(email: string): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email)

      if (error) {
        console.error('Error updating last login:', error)
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
    }
  },

  async isAuthorized(email: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email)
      return user ? user.isActive : false
    } catch (error) {
      console.error('Error checking authorization:', error)
      return false
    }
  },
}









