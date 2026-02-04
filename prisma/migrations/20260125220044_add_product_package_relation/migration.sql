-- CreateTable
CREATE TABLE "data"."product_package" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "quantity" DECIMAL NOT NULL,

    CONSTRAINT "product_package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_package_product_id_package_id_key" ON "data"."product_package"("product_id", "package_id");

-- AddForeignKey
ALTER TABLE "data"."product_package" ADD CONSTRAINT "product_package_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "data"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product_package" ADD CONSTRAINT "product_package_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "data"."package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
