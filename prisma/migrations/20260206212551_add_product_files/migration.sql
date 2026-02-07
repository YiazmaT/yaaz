-- AlterTable
ALTER TABLE "data"."product" ADD COLUMN     "files" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "data"."tenant" ADD COLUMN     "max_file_size_in_mbs" INTEGER NOT NULL DEFAULT 10;
