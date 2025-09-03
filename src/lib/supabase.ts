import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: 'free' | 'pro' | 'premium'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          subscription_tier?: 'free' | 'pro' | 'premium'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: 'free' | 'pro' | 'premium'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          template_id: string
          design_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template_id: string
          design_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template_id?: string
          design_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          category: string
          preview_url: string
          elements: any
          is_premium: boolean
        }
        Insert: {
          id?: string
          name: string
          category: string
          preview_url: string
          elements?: any
          is_premium?: boolean
        }
        Update: {
          id?: string
          name?: string
          category?: string
          preview_url?: string
          elements?: any
          is_premium?: boolean
        }
      }
    }
  }
}