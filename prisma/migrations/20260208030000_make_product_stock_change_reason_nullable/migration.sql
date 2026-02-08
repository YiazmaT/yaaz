-- AlterTable - make reason nullable first
ALTER TABLE "data"."product_stock_change" ALTER COLUMN "reason" DROP NOT NULL;

-- Clear any rows with the 'production' value before removing it from the enum
UPDATE "data"."product_stock_change" SET "reason" = NULL WHERE "reason" = 'production';

-- Remove unused enum value
ALTER TYPE "data"."ProductStockChangeReason" RENAME TO "ProductStockChangeReason_old";
CREATE TYPE "data"."ProductStockChangeReason" AS ENUM ('stolen', 'expired', 'damaged', 'found', 'inventory_correction', 'donation', 'other');
ALTER TABLE "data"."product_stock_change" ALTER COLUMN "reason" TYPE "data"."ProductStockChangeReason" USING ("reason"::text::"data"."ProductStockChangeReason");
DROP TYPE "data"."ProductStockChangeReason_old";
