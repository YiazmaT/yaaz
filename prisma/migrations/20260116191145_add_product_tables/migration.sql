-- CreateTable
CREATE TABLE "data"."product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "image" TEXT,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data"."product_ingredient" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "product_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_ingredient_product_id_ingredient_id_key" ON "data"."product_ingredient"("product_id", "ingredient_id");

-- AddForeignKey
ALTER TABLE "data"."product_ingredient" ADD CONSTRAINT "product_ingredient_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "data"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."product_ingredient" ADD CONSTRAINT "product_ingredient_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "data"."ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
