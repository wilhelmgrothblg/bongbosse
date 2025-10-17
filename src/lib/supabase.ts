// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { browser } from '$app/environment'

// Handle environment variables safely during build
const supabaseUrl = browser ? import.meta.env.PUBLIC_SUPABASE_URL : process.env.PUBLIC_SUPABASE_URL || ''
const supabaseKey = browser ? import.meta.env.PUBLIC_SUPABASE_ANON_KEY : process.env.PUBLIC_SUPABASE_ANON_KEY || ''

// Create a null client if variables are missing (build time)
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Rest of your interfaces remain the same...
export interface GeneratedSystem {
  id?: string
  created_at?: string
  updated_at?: string
  risk_profile: 'safe' | 'balanced' | 'risky'
  total_rows: number
  cost: number
  cost_per_row?: number
  description?: string
  system_data: any
  original_odds?: any
  svenska_folket_snapshot?: any
  intelligence_data?: any
  status?: 'pending' | 'completed'
  actual_correct?: number
  actual_payout?: number
  profit_loss?: number
  roi?: number
}

export interface CorrectSystem {
  id?: string
  created_at?: string
  week_date: string
  season: string
  match_results: any[]
  processed_at?: string
  source?: string
}