-- AlterTable
ALTER TABLE "data"."user"
  ADD COLUMN "reset_password_expires"  timestamptz,
  ADD COLUMN "reset_password_sent_at"  timestamptz;
