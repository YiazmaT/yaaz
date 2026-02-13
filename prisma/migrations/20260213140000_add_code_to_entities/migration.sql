-- Add code column (nullable) to all 4 tables
ALTER TABLE data.product ADD COLUMN "code" INTEGER;
ALTER TABLE data.ingredient ADD COLUMN "code" INTEGER;
ALTER TABLE data.package ADD COLUMN "code" INTEGER;
ALTER TABLE data.client ADD COLUMN "code" INTEGER;

-- Backfill existing records with tenant-scoped sequential codes
UPDATE data.product SET code = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY creation_date, id) as rn
  FROM data.product
) sub WHERE data.product.id = sub.id;

UPDATE data.ingredient SET code = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY creation_date, id) as rn
  FROM data.ingredient
) sub WHERE data.ingredient.id = sub.id;

UPDATE data.package SET code = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY creation_date, id) as rn
  FROM data.package
) sub WHERE data.package.id = sub.id;

UPDATE data.client SET code = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY creation_date, id) as rn
  FROM data.client
) sub WHERE data.client.id = sub.id;

-- Set NOT NULL
ALTER TABLE data.product ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE data.ingredient ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE data.package ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE data.client ALTER COLUMN "code" SET NOT NULL;

-- Add unique constraints
CREATE UNIQUE INDEX "product_tenant_id_code_key" ON data.product("tenant_id", "code");
CREATE UNIQUE INDEX "ingredient_tenant_id_code_key" ON data.ingredient("tenant_id", "code");
CREATE UNIQUE INDEX "package_tenant_id_code_key" ON data.package("tenant_id", "code");
CREATE UNIQUE INDEX "client_tenant_id_code_key" ON data.client("tenant_id", "code");
