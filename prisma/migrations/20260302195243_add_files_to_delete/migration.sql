-- CreateTable
CREATE TABLE "data"."files_to_delete" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "user_id" UUID,
    "tenant_id" UUID NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_to_delete_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data"."files_to_delete" ADD CONSTRAINT "files_to_delete_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."files_to_delete" ADD CONSTRAINT "files_to_delete_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
