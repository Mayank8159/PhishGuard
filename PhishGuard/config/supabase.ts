import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Replace these with your actual Supabase project details
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for Supabase tables
export interface ScanHistory {
  id: string;
  user_id: string;
  url: string;
  status: 'safe' | 'warning' | 'dangerous';
  timestamp: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  total_scans: number;
  threats_blocked: number;
  created_at: string;
}

export interface SecurityStat {
  id: string;
  user_id: string;
  threats_blocked: number;
  safe_sites: number;
  scans_today: number;
  protection_active: boolean;
  updated_at: string;
}
