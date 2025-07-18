-- Enable Row Level Security and required extensions
create extension if not exists "uuid-ossp";

-- Users table to store authenticated users
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
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

-- Aura calculations table to track daily aura changes
create table if not exists public.aura_calculations (
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

-- Badges table to define available badges
create table if not exists public.badges (
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

-- User badges table to track which badges users have earned
create table if not exists public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  month_year text, -- For monthly badges (format: "2024-01")
  rank integer, -- For ranking badges (1, 2, 3)
  metadata jsonb,
  unique(user_id, badge_id, month_year)
);

-- Monthly leaderboards table
create table if not exists public.monthly_leaderboards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  month_year text not null, -- Format: "2024-01"
  total_aura integer not null default 0,
  contributions_count integer not null default 0,
  rank integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month_year)
);

-- Global leaderboards table (all-time)
create table if not exists public.global_leaderboard (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  total_aura integer not null default 0,
  rank integer not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Insert default badges
insert into public.badges (name, description, icon, color, rarity, is_monthly, criteria) values
('Monthly Champion', 'Top contributor of the month', '🏆', '#FFD700', 'legendary', true, '{"rank": 1}'),
('Monthly Runner-up', 'Second highest contributor of the month', '🥈', '#C0C0C0', 'epic', true, '{"rank": 2}'),
('Monthly Bronze', 'Third highest contributor of the month', '🥉', '#CD7F32', 'rare', true, '{"rank": 3}'),
('Streak Master', '30+ day contribution streak', '🔥', '#FF4500', 'epic', false, '{"streak": 30}'),
('Century Club', '100+ contributions in a month', '💯', '#8A2BE2', 'rare', false, '{"monthly_contributions": 100}'),
('Daily Grinder', '365+ day contribution streak', '⚡', '#00FF00', 'legendary', false, '{"streak": 365}'),
('Code Warrior', '1000+ total aura points', '⚔️', '#DC143C', 'epic', false, '{"total_aura": 1000}'),
('Aura Legend', '5000+ total aura points', '👑', '#800080', 'legendary', false, '{"total_aura": 5000}');

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.aura_calculations enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.monthly_leaderboards enable row level security;
alter table public.global_leaderboard enable row level security;

-- Create policies
-- Users can read their own data and public profile data
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

-- Everyone can read public leaderboard data
create policy "Public leaderboard access" on public.users
  for select using (true);

create policy "Public aura calculations access" on public.aura_calculations
  for select using (true);

create policy "Public badges access" on public.badges
  for select using (true);

create policy "Public user badges access" on public.user_badges
  for select using (true);

create policy "Public monthly leaderboards access" on public.monthly_leaderboards
  for select using (true);

create policy "Public global leaderboard access" on public.global_leaderboard
  for select using (true);

-- Functions to update timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Function to calculate aura based on contributions
create or replace function public.calculate_daily_aura(
  contributions_count integer,
  streak_count integer,
  avg_daily_contributions numeric
) returns integer as $$
declare
  base_aura integer := 0;
  streak_bonus integer := 0;
  consistency_bonus integer := 0;
  total_aura integer := 0;
begin
  -- Base aura calculation
  case
    when contributions_count = 0 then base_aura := -10; -- Penalty for no contributions
    when contributions_count between 1 and 2 then base_aura := contributions_count * 5;
    when contributions_count between 3 and 5 then base_aura := contributions_count * 8;
    when contributions_count between 6 and 10 then base_aura := contributions_count * 12;
    when contributions_count > 10 then base_aura := contributions_count * 15;
  end case;

  -- Streak bonus
  if streak_count > 0 then
    streak_bonus := least(streak_count * 2, 100); -- Max 100 bonus points
  end if;

  -- Consistency bonus (if above average)
  if contributions_count > avg_daily_contributions then
    consistency_bonus := 10;
  end if;

  total_aura := base_aura + streak_bonus + consistency_bonus;
  
  return total_aura;
end;
$$ language plpgsql; 

-- Function to update user aura and recalculate ranks in a single transaction
CREATE OR REPLACE FUNCTION update_user_aura_and_ranks(
  p_user_id TEXT,
  p_month_year TEXT,
  p_monthly_aura FLOAT,
  p_contributions_count INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Update or insert monthly leaderboard entry
    INSERT INTO monthly_leaderboards (user_id, month_year, total_aura, contributions_count, rank)
    VALUES (p_user_id, p_month_year, p_monthly_aura, p_contributions_count, 0)
    ON CONFLICT (user_id, month_year) 
    DO UPDATE SET 
      total_aura = EXCLUDED.total_aura,
      contributions_count = EXCLUDED.contributions_count;

    -- Update global leaderboard with total aura from all months
    WITH user_totals AS (
      SELECT 
        user_id,
        SUM(total_aura) as total_aura,
        SUM(contributions_count) as total_contributions
      FROM monthly_leaderboards
      WHERE user_id = p_user_id
      GROUP BY user_id
    )
    INSERT INTO global_leaderboard (user_id, total_aura, rank)
    SELECT 
      user_id,
      total_aura,
      0
    FROM user_totals
    ON CONFLICT (user_id)
    DO UPDATE SET total_aura = EXCLUDED.total_aura;

    -- Update monthly ranks for the specific month
    WITH ranked_monthly AS (
      SELECT 
        user_id,
        RANK() OVER (ORDER BY total_aura DESC) as new_rank
      FROM monthly_leaderboards
      WHERE month_year = p_month_year
    )
    UPDATE monthly_leaderboards ml
    SET rank = rm.new_rank
    FROM ranked_monthly rm
    WHERE ml.user_id = rm.user_id
      AND ml.month_year = p_month_year;

    -- Update global ranks
    WITH ranked_global AS (
      SELECT 
        user_id,
        RANK() OVER (ORDER BY total_aura DESC) as new_rank
      FROM global_leaderboard
    )
    UPDATE global_leaderboard gl
    SET rank = rg.new_rank
    FROM ranked_global rg
    WHERE gl.user_id = rg.user_id;

  -- Commit transaction
  END;
END;
$$ LANGUAGE plpgsql; 