-- AlterTable
ALTER TABLE "data"."ingredient" ADD COLUMN     "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creator_id" UUID,
ADD COLUMN     "last_edit_date" TIMESTAMP(3),
ADD COLUMN     "last_editor_id" UUID;

-- AddForeignKey
ALTER TABLE "data"."ingredient" ADD CONSTRAINT "ingredient_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient" ADD CONSTRAINT "ingredient_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
