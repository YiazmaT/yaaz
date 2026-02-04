import {prisma} from "@/src/lib/prisma";
import {Tenant} from "../pages-content/tenants/types";

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  return prisma.tenant.findUnique({
    where: {id: tenantId},
    select: {id: true, name: true, creation_date: true, logo: true, primary_color: true, secondary_color: true},
  });
}
