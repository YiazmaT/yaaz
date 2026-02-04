-- CreateTable
CREATE TABLE "data"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "current_token" TEXT,
    "token_expires" TIMESTAMP(3),
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
