-- Migrate existing overdue/cancelled to pending
UPDATE "data"."bill_installment" SET "status" = 'pending' WHERE "status" IN ('overdue', 'cancelled');

-- AlterEnum
BEGIN;
CREATE TYPE "data"."BillStatus_new" AS ENUM ('pending', 'paid');
ALTER TABLE "data"."bill_installment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "data"."bill_installment" ALTER COLUMN "status" TYPE "data"."BillStatus_new" USING ("status"::text::"data"."BillStatus_new");
ALTER TYPE "data"."BillStatus" RENAME TO "BillStatus_old";
ALTER TYPE "data"."BillStatus_new" RENAME TO "BillStatus";
DROP TYPE "data"."BillStatus_old";
ALTER TABLE "data"."bill_installment" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
