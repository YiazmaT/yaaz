-- Add sale_id to bank_transaction to track which sale originated the transaction
ALTER TABLE "data"."bank_transaction" ADD COLUMN "sale_id" UUID;

ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_sale_id_key" UNIQUE ("sale_id");

ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_sale_id_fkey"
  FOREIGN KEY ("sale_id") REFERENCES "data"."sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
