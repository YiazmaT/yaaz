-- CreateTable
CREATE TABLE "data"."client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "cnpj" TEXT,
    "cpf" TEXT,
    "is_company" BOOLEAN NOT NULL DEFAULT false,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "data"."sale" ADD COLUMN "client_id" UUID;

-- AddForeignKey
ALTER TABLE "data"."client" ADD CONSTRAINT "client_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."client" ADD CONSTRAINT "client_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."client" ADD CONSTRAINT "client_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."sale" ADD CONSTRAINT "sale_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "data"."client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
