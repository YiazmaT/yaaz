-- CreateTable
CREATE TABLE "data"."unity_of_measure" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "unity" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),
    "last_editor_id" UUID,

    CONSTRAINT "unity_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unity_of_measure_tenant_id_unity_key" ON "data"."unity_of_measure"("tenant_id", "unity");

-- AddForeignKey
ALTER TABLE "data"."unity_of_measure" ADD CONSTRAINT "unity_of_measure_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."unity_of_measure" ADD CONSTRAINT "unity_of_measure_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."unity_of_measure" ADD CONSTRAINT "unity_of_measure_last_editor_id_fkey" FOREIGN KEY ("last_editor_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
