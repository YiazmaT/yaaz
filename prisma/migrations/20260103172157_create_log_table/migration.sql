-- CreateTable
CREATE TABLE "data"."log" (
    "id" BIGSERIAL NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "create_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,
    "user_id" UUID,
    "source" VARCHAR(100) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "route" VARCHAR(255),
    "content" JSONB,
    "error" JSONB,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_create_date_idx" ON "data"."log"("create_date" DESC);

-- CreateIndex
CREATE INDEX "log_user_id_idx" ON "data"."log"("user_id");

-- CreateIndex
CREATE INDEX "log_content_idx" ON "data"."log" USING GIN ("content");

-- AddForeignKey
ALTER TABLE "data"."log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "data"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
