-- Add ban management fields to users table
ALTER TABLE "users"
ADD COLUMN "is_banned" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "users"
ADD COLUMN "ban_reason" TEXT;

ALTER TABLE "users"
ADD COLUMN "banned_at" TIMESTAMP(3);

ALTER TABLE "users"
ADD COLUMN "banned_by" TEXT;

ALTER TABLE "users"
ADD COLUMN "ban_expires_at" TIMESTAMP(3);