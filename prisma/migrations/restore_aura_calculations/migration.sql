-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE IF NOT EXISTS "aura_calculations" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "contributions_count" INTEGER NOT NULL DEFAULT 0,
  "base_aura" INTEGER NOT NULL DEFAULT 0,
  "streak_bonus" INTEGER NOT NULL DEFAULT 0,
  "consistency_bonus" INTEGER NOT NULL DEFAULT 0,
  "quality_bonus" INTEGER NOT NULL DEFAULT 0,
  "total_aura" INTEGER NOT NULL DEFAULT 0,
  "repositories_data" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE "aura_calculations" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public aura calculations access" ON "aura_calculations"
  FOR SELECT USING (true); 