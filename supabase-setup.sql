-- GitAura Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Users table - Main user data with aura points
CREATE TABLE IF NOT EXISTS public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  github_username text unique,
  github_id text unique,
  display_name text,
  avatar_url text,
  github_data jsonb,
  total_aura integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_contribution_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Global Leaderboard table - All-time rankings
CREATE TABLE IF NOT EXISTS public.global_leaderboard (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  total_aura integer not null default 0,
  rank integer not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 3. Monthly Leaderboard table - Monthly rankings
CREATE TABLE IF NOT EXISTS public.monthly_leaderboards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  month_year text not null, -- Format: "2024-01"
  total_aura integer not null default 0,
  contributions_count integer not null default 0,
  rank integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month_year)
);

-- 4. Badges table - Available badges
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  icon text,
  color text,
  rarity text check (rarity in ('common', 'rare', 'epic', 'legendary')) default 'common',
  criteria jsonb,
  is_monthly boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. User Badges table - Track earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  month_year text, -- For monthly badges (format: "2024-01")
  rank integer, -- For ranking badges (1, 2, 3)
  metadata jsonb,
  unique(user_id, badge_id, month_year)
);

-- 6. Aura Calculations table - Daily aura tracking
CREATE TABLE IF NOT EXISTS public.aura_calculations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  contributions_count integer not null default 0,
  base_aura integer not null default 0,
  streak_bonus integer not null default 0,
  consistency_bonus integer not null default 0,
  quality_bonus integer not null default 0,
  total_aura integer not null default 0,
  repositories_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, rarity, is_monthly, criteria) VALUES
('Monthly Champion', 'Top contributor of the month', '🏆', '#FFD700', 'legendary', true, '{"rank": 1}'),
('Monthly Runner-up', 'Second highest contributor of the month', '🥈', '#C0C0C0', 'epic', true, '{"rank": 2}'),
('Monthly Bronze', 'Third highest contributor of the month', '🥉', '#CD7F32', 'rare', true, '{"rank": 3}'),
('Streak Master', '30+ day contribution streak', '🔥', '#FF4500', 'epic', false, '{"streak": 30}'),
('Century Club', '100+ contributions in a month', '💯', '#8A2BE2', 'rare', false, '{"monthly_contributions": 100}'),
('Daily Grinder', '365+ day contribution streak', '⚡', '#00FF00', 'legendary', false, '{"streak": 365}'),
('Code Warrior', '1000+ total aura points', '⚔️', '#DC143C', 'epic', false, '{"total_aura": 1000}'),
('Aura Legend', '5000+ total aura points', '👑', '#800080', 'legendary', false, '{"total_aura": 5000}')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aura_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for public read access (needed for leaderboard)
DROP POLICY IF EXISTS "Public read access" ON public.users;
CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.global_leaderboard;
CREATE POLICY "Public read access" ON public.global_leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.monthly_leaderboards;
CREATE POLICY "Public read access" ON public.monthly_leaderboards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.badges;
CREATE POLICY "Public read access" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.user_badges;
CREATE POLICY "Public read access" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.aura_calculations;
CREATE POLICY "Public read access" ON public.aura_calculations FOR SELECT USING (true);

-- Allow authenticated users to insert/update their own data
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Allow inserting into leaderboard tables (needed for aura system)
DROP POLICY IF EXISTS "Allow leaderboard updates" ON public.global_leaderboard;
CREATE POLICY "Allow leaderboard updates" ON public.global_leaderboard FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow leaderboard updates" ON public.monthly_leaderboards;
CREATE POLICY "Allow leaderboard updates" ON public.monthly_leaderboards FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow badge updates" ON public.user_badges;
CREATE POLICY "Allow badge updates" ON public.user_badges FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow aura calculations" ON public.aura_calculations;
CREATE POLICY "Allow aura calculations" ON public.aura_calculations FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'GitAura database setup completed successfully! 🎉';
  RAISE NOTICE 'Tables created: users, global_leaderboard, monthly_leaderboards, badges, user_badges, aura_calculations';
  RAISE NOTICE 'Default badges inserted and RLS policies configured.';
END $$; 