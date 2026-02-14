-- CreateEnum
CREATE TYPE "data"."BillRecurrenceType" AS ENUM ('none', 'installment', 'recurring');

-- CreateEnum
CREATE TYPE "data"."BillRecurrenceInterval" AS ENUM ('weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual');

-- CreateEnum
CREATE TYPE "data"."BillStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "data"."BankAccountType" AS ENUM ('checking', 'savings', 'cash');

-- CreateEnum
CREATE TYPE "data"."BankTransactionType" AS ENUM ('deposit', 'withdrawal', 'bill_payment');

-- CreateTable
CREATE TABLE "data"."finance_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "finance_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."bank_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "data"."BankAccountType" NOT NULL,
    "initial_balance" DECIMAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."bank_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "type" "data"."BankTransactionType" NOT NULL,
    "amount" DECIMAL NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "category_id" UUID,
    "bill_installment_id" UUID,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."bill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "supplier" TEXT,
    "category_id" UUID,
    "total_amount" DECIMAL NOT NULL,
    "recurrence_type" "data"."BillRecurrenceType" NOT NULL,
    "recurrence_interval" "data"."BillRecurrenceInterval",
    "recurrence_count" INTEGER,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."bill_installment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "data"."BillStatus" NOT NULL DEFAULT 'pending',
    "paid_date" TIMESTAMP(3),
    "bank_account_id" UUID,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "bill_installment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_category_tenant_id_name_key" ON "data"."finance_category"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "bank_account_tenant_id_name_key" ON "data"."bank_account"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transaction_bill_installment_id_key" ON "data"."bank_transaction"("bill_installment_id");

-- CreateIndex
CREATE UNIQUE INDEX "bill_tenant_id_code_key" ON "data"."bill"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "bill_installment_bill_id_installment_number_key" ON "data"."bill_installment"("bill_id", "installment_number");

-- AddForeignKey
ALTER TABLE "data"."finance_category" ADD CONSTRAINT "finance_category_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."finance_category" ADD CONSTRAINT "finance_category_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."finance_category" ADD CONSTRAINT "finance_category_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_account" ADD CONSTRAINT "bank_account_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_account" ADD CONSTRAINT "bank_account_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_account" ADD CONSTRAINT "bank_account_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "data"."bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "data"."finance_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_bill_installment_id_fkey" FOREIGN KEY ("bill_installment_id") REFERENCES "data"."bill_installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bank_transaction" ADD CONSTRAINT "bank_transaction_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill" ADD CONSTRAINT "bill_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill" ADD CONSTRAINT "bill_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "data"."finance_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill" ADD CONSTRAINT "bill_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill" ADD CONSTRAINT "bill_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill_installment" ADD CONSTRAINT "bill_installment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill_installment" ADD CONSTRAINT "bill_installment_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "data"."bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill_installment" ADD CONSTRAINT "bill_installment_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "data"."bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill_installment" ADD CONSTRAINT "bill_installment_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."bill_installment" ADD CONSTRAINT "bill_installment_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
