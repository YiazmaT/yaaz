-- AlterTable
ALTER TABLE "data"."user"
  ADD COLUMN IF NOT EXISTS "creator_id" UUID,
  ADD COLUMN IF NOT EXISTS "last_editor_id" UUID;

-- AddForeignKey
ALTER TABLE "data"."user" ADD CONSTRAINT "user_creator_id_fkey"
  FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user" ADD CONSTRAINT "user_last_editor_id_fkey"
  FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
