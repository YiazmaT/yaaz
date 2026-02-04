-- CreateTable
CREATE TABLE "data"."sale_package" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sale_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "sale_package_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data"."sale_package" ADD CONSTRAINT "sale_package_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "data"."sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."sale_package" ADD CONSTRAINT "sale_package_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "data"."package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
