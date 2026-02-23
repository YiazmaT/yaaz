UPDATE "data"."nfe" SET "nfe_number" = '' WHERE "nfe_number" IS NULL;

ALTER TABLE "data"."nfe" ALTER COLUMN "nfe_number" SET NOT NULL;
ALTER TABLE "data"."nfe" ALTER COLUMN "nfe_number" SET DEFAULT '';
