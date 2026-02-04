-- CreateTable
CREATE TABLE "data"."ingredient_cost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ingredient_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_cost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data"."ingredient_cost" ADD CONSTRAINT "ingredient_cost_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "data"."ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data"."ingredient_cost" ADD CONSTRAINT "ingredient_cost_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
