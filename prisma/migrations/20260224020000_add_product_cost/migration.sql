CREATE TABLE "data"."product_cost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "comment" TEXT,
    "creator_id" UUID,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_cost_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "data"."product_cost" ADD CONSTRAINT "product_cost_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "data"."tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "data"."product_cost" ADD CONSTRAINT "product_cost_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "data"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "data"."product_cost" ADD CONSTRAINT "product_cost_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
