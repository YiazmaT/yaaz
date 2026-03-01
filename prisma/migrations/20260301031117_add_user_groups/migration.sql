-- DropForeignKey
ALTER TABLE "data"."ingredient" DROP CONSTRAINT "ingredient_unit_of_measure_id_fkey";

-- DropForeignKey
ALTER TABLE "data"."package" DROP CONSTRAINT "package_unit_of_measure_id_fkey";

-- DropForeignKey
ALTER TABLE "data"."product" DROP CONSTRAINT "product_unit_of_measure_id_fkey";

-- DropIndex
DROP INDEX "data"."bill_tenant_id_code_key";

-- AlterTable
ALTER TABLE "data"."user" ADD COLUMN     "user_group_id" UUID,
ALTER COLUMN "pending_password_expires" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "setup_email_sent_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reset_password_expires" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reset_password_sent_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "data"."yaaz_user" ALTER COLUMN "token_expires" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "data"."user_group" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."user_group_permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_group_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_group_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_group_permission_tenant_id_user_group_id_module_action_key" ON "data"."user_group_permission"("tenant_id", "user_group_id", "module", "action");

-- AddForeignKey
ALTER TABLE "data"."ingredient" ADD CONSTRAINT "ingredient_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "data"."unity_of_measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."package" ADD CONSTRAINT "package_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "data"."unity_of_measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product" ADD CONSTRAINT "product_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "data"."unity_of_measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user_group" ADD CONSTRAINT "user_group_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user_group" ADD CONSTRAINT "user_group_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user_group" ADD CONSTRAINT "user_group_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user_group_permission" ADD CONSTRAINT "user_group_permission_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user_group_permission" ADD CONSTRAINT "user_group_permission_user_group_id_fkey" FOREIGN KEY ("user_group_id") REFERENCES "data"."user_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user" ADD CONSTRAINT "user_user_group_id_fkey" FOREIGN KEY ("user_group_id") REFERENCES "data"."user_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
