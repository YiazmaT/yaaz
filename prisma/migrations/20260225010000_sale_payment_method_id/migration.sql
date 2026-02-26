-- Step 1: Seed default payment methods for each existing tenant
INSERT INTO "data"."payment_method" ("id", "tenant_id", "name", "active", "creation_date")
SELECT
  gen_random_uuid(),
  t."id",
  pm."name",
  true,
  now()
FROM "data"."tenant" t
CROSS JOIN (
  VALUES ('Crédito'), ('Débito'), ('Pix'), ('Dinheiro'), ('iFood')
) AS pm("name")
ON CONFLICT ("tenant_id", "name") DO NOTHING;

-- Step 2: Add payment_method_id column (nullable for now)
ALTER TABLE "data"."sale" ADD COLUMN "payment_method_id" UUID;

-- Step 3: Backfill payment_method_id from old enum values
UPDATE "data"."sale" s
SET "payment_method_id" = pm."id"
FROM "data"."payment_method" pm
WHERE pm."tenant_id" = s."tenant_id"
  AND pm."name" = CASE s."payment_method"::text
    WHEN 'credit' THEN 'Crédito'
    WHEN 'debit'  THEN 'Débito'
    WHEN 'pix'    THEN 'Pix'
    WHEN 'cash'   THEN 'Dinheiro'
    WHEN 'iFood'  THEN 'iFood'
  END;

-- Step 4: Set NOT NULL
ALTER TABLE "data"."sale" ALTER COLUMN "payment_method_id" SET NOT NULL;

-- Step 5: Add FK constraint
ALTER TABLE "data"."sale" ADD CONSTRAINT "sale_payment_method_id_fkey"
  FOREIGN KEY ("payment_method_id") REFERENCES "data"."payment_method"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Drop old payment_method column
ALTER TABLE "data"."sale" DROP COLUMN "payment_method";

-- Step 7: Drop the enum type (no longer referenced)
DROP TYPE "data"."PaymentMethod";
