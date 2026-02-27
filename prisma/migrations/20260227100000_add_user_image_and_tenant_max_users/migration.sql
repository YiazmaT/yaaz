-- AlterTable
ALTER TABLE "data"."user" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- AlterTable
ALTER TABLE "data"."tenant" ADD COLUMN IF NOT EXISTS "max_user_amount" INTEGER NOT NULL DEFAULT 3;
