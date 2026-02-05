-- AlterTable
ALTER TABLE "data"."tenant" ADD COLUMN     "currency_type" TEXT NOT NULL DEFAULT 'R$',
ADD COLUMN     "time_zone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo';
