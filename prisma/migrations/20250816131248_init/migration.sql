-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "github_username" TEXT,
    "github_id" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "github_data" JSONB,
    "total_aura" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_contribution_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ban_expires_at" TIMESTAMP(3),
    "ban_reason" TEXT,
    "banned_at" TIMESTAMP(3),
    "banned_by" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_calculations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "contributions_count" INTEGER NOT NULL DEFAULT 0,
    "base_aura" INTEGER NOT NULL DEFAULT 0,
    "streak_bonus" INTEGER NOT NULL DEFAULT 0,
    "consistency_bonus" INTEGER NOT NULL DEFAULT 0,
    "quality_bonus" INTEGER NOT NULL DEFAULT 0,
    "total_aura" INTEGER NOT NULL DEFAULT 0,
    "repositories_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "criteria" JSONB,
    "is_monthly" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "month_year" TEXT,
    "rank" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_leaderboards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month_year" TEXT NOT NULL,
    "total_aura" INTEGER NOT NULL DEFAULT 0,
    "contributions_count" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_winners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month_year" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "total_aura" INTEGER NOT NULL DEFAULT 0,
    "contributions_count" INTEGER NOT NULL DEFAULT 0,
    "badge_awarded" BOOLEAN NOT NULL DEFAULT false,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_aura" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "year" TEXT,
    "yearly_aura" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "global_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_github_username_key" ON "users"("github_username");

-- CreateIndex
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "aura_calculations_user_id_date_key" ON "aura_calculations"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "badge_user_id_badge_id_month_year_key" ON "badge"("user_id", "badge_id", "month_year");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_leaderboards_user_id_month_year_key" ON "monthly_leaderboards"("user_id", "month_year");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_winners_user_id_month_year_key" ON "monthly_winners"("user_id", "month_year");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_winners_month_year_rank_key" ON "monthly_winners"("month_year", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "global_leaderboard_user_id_key" ON "global_leaderboard"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "global_leaderboard_user_id_year_key" ON "global_leaderboard"("user_id", "year");

-- AddForeignKey
ALTER TABLE "aura_calculations" ADD CONSTRAINT "aura_calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_leaderboards" ADD CONSTRAINT "monthly_leaderboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_winners" ADD CONSTRAINT "monthly_winners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_leaderboard" ADD CONSTRAINT "global_leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
