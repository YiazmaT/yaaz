-- CreateTable
CREATE TABLE "data"."payment_method" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bank_account_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_tenant_id_name_key" ON "data"."payment_method"("tenant_id", "name");

-- AddForeignKey
ALTER TABLE "data"."payment_method" ADD CONSTRAINT "payment_method_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."payment_method" ADD CONSTRAINT "payment_method_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "data"."bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."payment_method" ADD CONSTRAINT "payment_method_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."payment_method" ADD CONSTRAINT "payment_method_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
