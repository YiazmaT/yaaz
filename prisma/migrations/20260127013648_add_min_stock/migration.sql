-- AlterTable
ALTER TABLE "data"."ingredient" ADD COLUMN     "min_stock" DECIMAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "data"."package" ADD COLUMN     "min_stock" DECIMAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "data"."product" ADD COLUMN     "min_stock" INTEGER NOT NULL DEFAULT 0;
