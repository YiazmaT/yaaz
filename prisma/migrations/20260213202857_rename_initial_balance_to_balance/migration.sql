/*
  Warnings:

  - You are about to drop the column `initial_balance` on the `bank_account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "data"."bank_account" DROP COLUMN "initial_balance",
ADD COLUMN     "balance" DECIMAL NOT NULL DEFAULT 0;
