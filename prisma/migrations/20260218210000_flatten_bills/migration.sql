-- Drop bank_transaction FK to bill_installment
ALTER TABLE "data"."bank_transaction" DROP CONSTRAINT IF EXISTS "bank_transaction_bill_installment_id_fkey";
ALTER TABLE "data"."bank_transaction" DROP COLUMN IF EXISTS "bill_installment_id";
ALTER TABLE "data"."bank_transaction" ADD COLUMN "bill_id" UUID;
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_bill_id_key" UNIQUE ("bill_id");

-- Drop bill_installment table
DROP TABLE IF EXISTS "data"."bill_installment";

-- Alter bill table: drop old columns BEFORE dropping enums
ALTER TABLE "data"."bill" DROP COLUMN IF EXISTS "total_amount";
ALTER TABLE "data"."bill" DROP COLUMN IF EXISTS "recurrence_type";
ALTER TABLE "data"."bill" DROP COLUMN IF EXISTS "recurrence_interval";
ALTER TABLE "data"."bill" DROP COLUMN IF EXISTS "recurrence_count";

-- Now drop old enums
DROP TYPE IF EXISTS "data"."BillRecurrenceType";
DROP TYPE IF EXISTS "data"."BillRecurrenceInterval";

-- Alter bill table: add new columns
ALTER TABLE "data"."bill" ADD COLUMN "amount" DECIMAL NOT NULL DEFAULT 0;
ALTER TABLE "data"."bill" ADD COLUMN "due_date" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "data"."bill" ADD COLUMN "installment_number" INT NOT NULL DEFAULT 1;
ALTER TABLE "data"."bill" ADD COLUMN "installment_count" INT NOT NULL DEFAULT 1;
ALTER TABLE "data"."bill" ADD COLUMN "status" "data"."BillStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "data"."bill" ADD COLUMN "paid_date" TIMESTAMP(3);
ALTER TABLE "data"."bill" ADD COLUMN "bank_account_id" UUID;

-- Remove temp defaults
ALTER TABLE "data"."bill" ALTER COLUMN "amount" DROP DEFAULT;
ALTER TABLE "data"."bill" ALTER COLUMN "due_date" DROP DEFAULT;

-- Drop old unique constraint and add new one
ALTER TABLE "data"."bill" DROP CONSTRAINT IF EXISTS "bill_tenant_id_code_key";
ALTER TABLE "data"."bill" ADD CONSTRAINT "bill_tenant_id_code_installment_number_key" UNIQUE ("tenant_id", "code", "installment_number");

-- Add FKs
ALTER TABLE "data"."bill" ADD CONSTRAINT "bill_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "data"."bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "data"."bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
