-- AlterTable
ALTER TABLE "data"."client" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "data"."client_address" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "cep" TEXT,
    "address" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "client_address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_address_client_id_key" ON "data"."client_address"("client_id");

-- AddForeignKey
ALTER TABLE "data"."client_address" ADD CONSTRAINT "client_address_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."client_address" ADD CONSTRAINT "client_address_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "data"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."client_address" ADD CONSTRAINT "client_address_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."client_address" ADD CONSTRAINT "client_address_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
