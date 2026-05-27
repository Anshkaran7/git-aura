ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "last_aura_refresh_at" TIMESTAMP(3);

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "refresh_error" TEXT;

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "refresh_attempts" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "users_last_aura_refresh_at_idx"
ON "users" ("last_aura_refresh_at");
