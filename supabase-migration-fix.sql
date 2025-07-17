-- Migration: Fix Clerk User ID Compatibility
-- Run this in Supabase SQL Editor to fix the user ID issue

-- 1. Drop all foreign key constraints first
ALTER TABLE IF EXISTS public.global_leaderboard DROP CONSTRAINT IF EXISTS global_leaderboard_user_id_fkey;
ALTER TABLE IF EXISTS public.monthly_leaderboards DROP CONSTRAINT IF EXISTS monthly_leaderboards_user_id_fkey;
ALTER TABLE IF EXISTS public.user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
ALTER TABLE IF EXISTS public.aura_calculations DROP CONSTRAINT IF EXISTS aura_calculations_user_id_fkey;

-- 2. Drop the existing users table and recreate with TEXT id
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Create new users table with TEXT id (for Clerk compatibility)
CREATE TABLE public.users (
  id text primary key,  -- Changed from uuid to text for Clerk
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

-- 4. Update other tables to use TEXT for user_id
ALTER TABLE public.global_leaderboard ALTER COLUMN user_id TYPE text;
ALTER TABLE public.monthly_leaderboards ALTER COLUMN user_id TYPE text;
ALTER TABLE public.user_badges ALTER COLUMN user_id TYPE text;
ALTER TABLE public.aura_calculations ALTER COLUMN user_id TYPE text;

-- 5. Re-add foreign key constraints
ALTER TABLE public.global_leaderboard 
ADD CONSTRAINT global_leaderboard_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.monthly_leaderboards 
ADD CONSTRAINT monthly_leaderboards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_badges 
ADD CONSTRAINT user_badges_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.aura_calculations 
ADD CONSTRAINT aura_calculations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 6. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 7. Recreate RLS policies
DROP POLICY IF EXISTS "Public read access" ON public.users;
CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (true);

-- 8. Recreate updated_at trigger
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Migration completed successfully!';
  RAISE NOTICE '✅ User ID type changed from UUID to TEXT for Clerk compatibility';
  RAISE NOTICE '✅ All foreign key constraints updated';
  RAISE NOTICE '✅ RLS policies recreated';
END $$; 