/*
  Warnings:

  - You are about to drop the column `allowed` on the `user_group_permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "data"."user_group_permission" DROP COLUMN "allowed";
