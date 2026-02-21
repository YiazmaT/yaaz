-- Step 1: Seed g, ml, unidade for ALL existing tenants (safe to re-run)
INSERT INTO data.unity_of_measure (id, tenant_id, unity, active, creation_date)
SELECT gen_random_uuid(), t.id, u.unity, true, NOW()
FROM data.tenant t
CROSS JOIN (VALUES ('g'), ('ml'), ('unidade')) AS u(unity)
ON CONFLICT (tenant_id, unity) DO NOTHING;

-- Step 2: Migrate any other distinct unit_of_measure values already in ingredient
-- (handles custom values, maps legacy 'unity' string → 'unidade')
INSERT INTO data.unity_of_measure (id, tenant_id, unity, active, creation_date)
SELECT DISTINCT gen_random_uuid(), i.tenant_id,
  CASE WHEN i.unit_of_measure = 'unity' THEN 'unidade' ELSE i.unit_of_measure END,
  true, NOW()
FROM data.ingredient i
WHERE i.unit_of_measure IS NOT NULL
  AND i.unit_of_measure NOT IN ('g', 'ml', 'unity', 'unidade')
ON CONFLICT (tenant_id, unity) DO NOTHING;

-- Step 3: Add unit_of_measure_id column (nullable)
ALTER TABLE data.ingredient ADD COLUMN IF NOT EXISTS unit_of_measure_id UUID;

-- Step 4: Link ingredients to their unity_of_measure record
-- (maps legacy 'unity' string → 'unidade' unity record)
UPDATE data.ingredient i
SET unit_of_measure_id = um.id
FROM data.unity_of_measure um
WHERE um.tenant_id = i.tenant_id
  AND um.unity = CASE WHEN i.unit_of_measure = 'unity' THEN 'unidade' ELSE i.unit_of_measure END;

-- Step 5: Add FK constraint
ALTER TABLE data.ingredient
  ADD CONSTRAINT ingredient_unit_of_measure_id_fkey
  FOREIGN KEY (unit_of_measure_id) REFERENCES data.unity_of_measure(id) ON DELETE SET NULL;

-- Step 6: Drop the old string column
ALTER TABLE data.ingredient DROP COLUMN IF EXISTS unit_of_measure;
