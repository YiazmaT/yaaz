-- AlterTable
ALTER TABLE "data"."sale"
  ADD COLUMN "discount_percent"  DECIMAL,
  ADD COLUMN "discount_value"    DECIMAL,
  ADD COLUMN "discount_computed" DECIMAL;
