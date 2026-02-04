/*
  Warnings:

  - The primary key for the `log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[login]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `ingredient_cost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `ingredient_stock_change` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `instagram-posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `package_cost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `package_stock_change` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_stock_change` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `sale_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `sale_package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "data"."ingredient" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."ingredient_cost" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."ingredient_stock_change" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."instagram-posts" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."log" DROP CONSTRAINT "log_pkey",
ADD COLUMN     "tenant_id" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "data"."package" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."package_cost" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."package_stock_change" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."product" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."product_ingredient" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."product_package" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."product_stock_change" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."sale" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."sale_item" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."sale_package" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "data"."user" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "data"."tenant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "data"."user"("login");

-- AddForeignKey
ALTER TABLE "data"."instagram-posts" ADD CONSTRAINT "instagram-posts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."log" ADD CONSTRAINT "log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient" ADD CONSTRAINT "ingredient_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient_cost" ADD CONSTRAINT "ingredient_cost_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."package" ADD CONSTRAINT "package_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."package_cost" ADD CONSTRAINT "package_cost_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product" ADD CONSTRAINT "product_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product_ingredient" ADD CONSTRAINT "product_ingredient_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product_package" ADD CONSTRAINT "product_package_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."sale" ADD CONSTRAINT "sale_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."sale_item" ADD CONSTRAINT "sale_item_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."sale_package" ADD CONSTRAINT "sale_package_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product_stock_change" ADD CONSTRAINT "product_stock_change_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient_stock_change" ADD CONSTRAINT "ingredient_stock_change_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."package_stock_change" ADD CONSTRAINT "package_stock_change_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
