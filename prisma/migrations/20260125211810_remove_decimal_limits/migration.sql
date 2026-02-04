-- AlterTable
ALTER TABLE "data"."ingredient" ALTER COLUMN "stock" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "data"."ingredient_cost" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "data"."product" ALTER COLUMN "price" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "data"."product_ingredient" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "data"."sale" ALTER COLUMN "total" SET DATA TYPE DECIMAL;
