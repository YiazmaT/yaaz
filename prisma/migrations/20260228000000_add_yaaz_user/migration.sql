CREATE TABLE "data"."yaaz_user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "current_token" TEXT,
    "token_expires" TIMESTAMPTZ,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_edit_date" TIMESTAMP(3),

    CONSTRAINT "yaaz_user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "yaaz_user_login_key" ON "data"."yaaz_user"("login");
