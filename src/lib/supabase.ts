import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Initialize Supabase client
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
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