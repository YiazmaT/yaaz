-- AlterTable
ALTER TABLE "data"."user"
  ADD COLUMN "pending_password" boolean NOT NULL DEFAULT true,
  ADD COLUMN "pending_password_expires" timestamptz;

-- Existing users already have passwords — mark them as not pending
UPDATE "data"."user" SET "pending_password" = false;

-- Change default to false for future rows
ALTER TABLE "data"."user" ALTER COLUMN "pending_password" SET DEFAULT false;
