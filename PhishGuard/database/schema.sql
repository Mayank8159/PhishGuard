-- Supabase SQL Schema for PhishGuard
-- Run these SQL commands in your Supabase project to set up the database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  total_scans INTEGER DEFAULT 0,
  threats_blocked INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scan_history table
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT CHECK (status IN ('safe', 'warning', 'dangerous')) NOT NULL,
  risk_score INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Create security_stats table
CREATE TABLE IF NOT EXISTS security_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  threats_blocked INTEGER DEFAULT 0,
  safe_sites INTEGER DEFAULT 0,
  scans_today INTEGER DEFAULT 0,
  protection_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own scan history" ON scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans" ON scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats" ON security_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON security_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update user stats on new scan
CREATE OR REPLACE FUNCTION update_user_stats_on_scan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE security_stats
  SET 
    threats_blocked = threats_blocked + (CASE WHEN NEW.status = 'dangerous' THEN 1 ELSE 0 END),
    safe_sites = safe_sites + (CASE WHEN NEW.status = 'safe' THEN 1 ELSE 0 END),
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for scan_history inserts
CREATE OR REPLACE TRIGGER trigger_update_stats_on_scan
AFTER INSERT ON scan_history
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_scan();
