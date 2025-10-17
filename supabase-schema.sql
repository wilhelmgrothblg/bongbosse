-- BongBosse Supabase Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Table for storing generated systems
CREATE TABLE generated_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stryktipset_draw_number INTEGER NOT NULL,
  risk_profile TEXT NOT NULL CHECK (risk_profile IN ('safe', 'balanced', 'risky')),
  total_rows INTEGER NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  total_matches INTEGER NOT NULL,
  system_data JSONB NOT NULL, -- Contains the full system structure
  intelligence_data JSONB, -- Optional advanced analytics data
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  profit_loss DECIMAL(10,2), -- Calculated after results are in
  roi DECIMAL(10,4), -- Return on investment percentage
  correct_predictions INTEGER, -- Number of correct predictions
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing correct results for each Stryktipset draw
CREATE TABLE correct_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stryktipset_draw_number INTEGER NOT NULL UNIQUE,
  match_results JSONB NOT NULL, -- Contains all match results for the draw
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_generated_systems_draw ON generated_systems(stryktipset_draw_number);
CREATE INDEX idx_generated_systems_status ON generated_systems(status);
CREATE INDEX idx_generated_systems_created ON generated_systems(created_at DESC);
CREATE INDEX idx_correct_systems_draw ON correct_systems(stryktipset_draw_number);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE generated_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE correct_systems ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since we don't have user authentication)
CREATE POLICY "Public can read generated_systems" ON generated_systems FOR SELECT USING (true);
CREATE POLICY "Public can insert generated_systems" ON generated_systems FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update generated_systems" ON generated_systems FOR UPDATE USING (true);

CREATE POLICY "Public can read correct_systems" ON correct_systems FOR SELECT USING (true);
CREATE POLICY "Public can insert correct_systems" ON correct_systems FOR INSERT WITH CHECK (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_generated_systems_updated_at 
    BEFORE UPDATE ON generated_systems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();