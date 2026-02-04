-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "data";

-- CreateTable
CREATE TABLE "data"."instagram-posts" (
    "id" UUID NOT NULL,
    "index" INTEGER NOT NULL,
    "html" VARCHAR NOT NULL,

    CONSTRAINT "instagram-posts_pkey" PRIMARY KEY ("id")
);
