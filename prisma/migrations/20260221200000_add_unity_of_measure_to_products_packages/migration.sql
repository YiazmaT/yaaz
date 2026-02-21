-- Step 1: Seed 'unidade' for ALL existing tenants (safe to re-run)
INSERT INTO data.unity_of_measure (id, tenant_id, unity, active, creation_date)
SELECT gen_random_uuid(), t.id, 'unidade', true, NOW()
FROM data.tenant t
ON CONFLICT (tenant_id, unity) DO NOTHING;

-- Step 2: Add unit_of_measure_id column to product (nullable)
ALTER TABLE data.product ADD COLUMN IF NOT EXISTS unit_of_measure_id UUID;

-- Step 3: Link all existing products to 'unidade'
UPDATE data.product p
SET unit_of_measure_id = um.id
FROM data.unity_of_measure um
WHERE um.tenant_id = p.tenant_id
  AND um.unity = 'unidade';

-- Step 4: Add FK constraint on product
ALTER TABLE data.product
  ADD CONSTRAINT product_unit_of_measure_id_fkey
  FOREIGN KEY (unit_of_measure_id) REFERENCES data.unity_of_measure(id) ON DELETE SET NULL;

-- Step 5: Add unit_of_measure_id column to package (nullable)
ALTER TABLE data.package ADD COLUMN IF NOT EXISTS unit_of_measure_id UUID;

-- Step 6: Link all existing packages to 'unidade'
UPDATE data.package pk
SET unit_of_measure_id = um.id
FROM data.unity_of_measure um
WHERE um.tenant_id = pk.tenant_id
  AND um.unity = 'unidade';

-- Step 7: Add FK constraint on package
ALTER TABLE data.package
  ADD CONSTRAINT package_unit_of_measure_id_fkey
  FOREIGN KEY (unit_of_measure_id) REFERENCES data.unity_of_measure(id) ON DELETE SET NULL;
