-- CreateEnum
CREATE TYPE "data"."ProductStockChangeReason" AS ENUM ('stolen', 'expired', 'damaged', 'found', 'inventory_correction', 'other');

-- CreateEnum
CREATE TYPE "data"."IngredientStockChangeReason" AS ENUM ('stolen', 'expired', 'damaged', 'spillage', 'found', 'inventory_correction', 'other');

-- CreateEnum
CREATE TYPE "data"."PackageStockChangeReason" AS ENUM ('stolen', 'damaged', 'found', 'inventory_correction', 'other');

-- CreateTable
CREATE TABLE "data"."product_stock_change" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "previous_stock" INTEGER NOT NULL,
    "new_stock" INTEGER NOT NULL,
    "reason" "data"."ProductStockChangeReason" NOT NULL,
    "comment" TEXT,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_stock_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."ingredient_stock_change" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ingredient_id" UUID NOT NULL,
    "previous_stock" DECIMAL NOT NULL,
    "new_stock" DECIMAL NOT NULL,
    "reason" "data"."IngredientStockChangeReason" NOT NULL,
    "comment" TEXT,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_stock_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."package_stock_change" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "previous_stock" DECIMAL NOT NULL,
    "new_stock" DECIMAL NOT NULL,
    "reason" "data"."PackageStockChangeReason" NOT NULL,
    "comment" TEXT,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_stock_change_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data"."product_stock_change" ADD CONSTRAINT "product_stock_change_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "data"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product_stock_change" ADD CONSTRAINT "product_stock_change_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient_stock_change" ADD CONSTRAINT "ingredient_stock_change_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "data"."ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient_stock_change" ADD CONSTRAINT "ingredient_stock_change_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."package_stock_change" ADD CONSTRAINT "package_stock_change_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "data"."package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."package_stock_change" ADD CONSTRAINT "package_stock_change_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
