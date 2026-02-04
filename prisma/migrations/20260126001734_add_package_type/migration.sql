-- CreateEnum
CREATE TYPE "data"."PackageType" AS ENUM ('sale', 'product');

-- AlterTable
ALTER TABLE "data"."package" ADD COLUMN     "type" "data"."PackageType" NOT NULL DEFAULT 'product';
