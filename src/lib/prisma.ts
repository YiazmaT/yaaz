import {PrismaClient} from "@prisma/client";
import {neonConfig} from "@neondatabase/serverless";
import {PrismaNeon} from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

/**
 * Operations that include a `where` clause and must have tenant_id
 * to prevent cross-tenant data leaks.
 */
const GUARDED_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

/**
 * Models that have no tenant_id column and are exempt from the guard.
 * Only the Tenant table itself qualifies.
 */
const TENANT_EXEMPT_MODELS = new Set(["Tenant"]);

function createBaseClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaNeon({connectionString});

  return new PrismaClient({adapter});
}

function withTenantGuard<T extends PrismaClient>(client: T) {
  return client.$extends({
    name: "tenant-guard",
    query: {
      $allModels: {
        $allOperations({model, operation, args, query}: any) {
          if (!TENANT_EXEMPT_MODELS.has(model) && GUARDED_OPERATIONS.has(operation)) {
            if (!args.where?.tenant_id) {
              throw new Error(`[TenantGuard] "${model}.${operation}" called without tenant_id in where clause`);
            }
          }
          return query(args);
        },
      },
    },
  });
}

export type PrismaClientUnscoped = ReturnType<typeof createBaseClient>;
export type PrismaClientExtended = ReturnType<typeof withTenantGuard<PrismaClientUnscoped>>;

const globalForPrisma = global as unknown as {
  prisma?: PrismaClientExtended;
  prismaUnscoped?: PrismaClientUnscoped;
};

/**
 * Guarded Prisma client. All queries on tenant-owned models MUST include
 * tenant_id in their where clause — throws otherwise.
 *
 * Use this everywhere except pre-auth contexts (login, token validation).
 */
export const prisma: PrismaClientExtended = globalForPrisma.prisma ?? withTenantGuard(createBaseClient());

/**
 * Unscoped Prisma client with no tenant guard.
 * Only use this in pre-auth flows (login route, token validation in auth.ts)
 * where tenant_id is not yet available.
 */
export const prismaUnscoped: PrismaClientUnscoped = globalForPrisma.prismaUnscoped ?? createBaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaUnscoped = prismaUnscoped;
}
