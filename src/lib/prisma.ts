import {PrismaClient} from "@prisma/client";
import {neonConfig} from "@neondatabase/serverless";
import {PrismaNeon} from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaNeon({connectionString});

  return new PrismaClient({adapter});
};

export type PrismaClientExtended = ReturnType<typeof createPrismaClient>;

const globalForPrisma = global as unknown as {
  prisma?: PrismaClientExtended;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
