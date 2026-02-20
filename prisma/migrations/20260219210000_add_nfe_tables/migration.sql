-- CreateTable
CREATE TABLE "data"."nfe" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "supplier" TEXT,
    "nfe_number" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "file_url" TEXT,
    "stock_added" BOOLEAN NOT NULL DEFAULT false,
    "bank_deducted" BOOLEAN NOT NULL DEFAULT false,
    "bank_account_id" UUID,
    "bank_transaction_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."nfe_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "nfe_id" UUID NOT NULL,
    "item_type" TEXT NOT NULL,
    "ingredient_id" UUID,
    "product_id" UUID,
    "package_id" UUID,
    "quantity" DECIMAL NOT NULL,
    "unit_price" DECIMAL NOT NULL,
    "total_price" DECIMAL NOT NULL,

    CONSTRAINT "nfe_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nfe_bank_transaction_id_key" ON "data"."nfe"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_tenant_id_code_key" ON "data"."nfe"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "data"."nfe" ADD CONSTRAINT "nfe_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe" ADD CONSTRAINT "nfe_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "data"."bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe" ADD CONSTRAINT "nfe_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "data"."bank_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe" ADD CONSTRAINT "nfe_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe" ADD CONSTRAINT "nfe_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe_item" ADD CONSTRAINT "nfe_item_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe_item" ADD CONSTRAINT "nfe_item_nfe_id_fkey" FOREIGN KEY ("nfe_id") REFERENCES "data"."nfe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe_item" ADD CONSTRAINT "nfe_item_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "data"."ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe_item" ADD CONSTRAINT "nfe_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "data"."product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."nfe_item" ADD CONSTRAINT "nfe_item_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "data"."package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
