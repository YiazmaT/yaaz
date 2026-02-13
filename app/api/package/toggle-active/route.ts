import Decimal from "decimal.js";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/package/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existingPackage = await prisma.package.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existingPackage) return error("api.errors.dataNotFound", 404, {id});

    if (existingPackage.active && new Decimal(existingPackage.stock).greaterThan(0)) {
      return error("packages.errors.cannotDeactivateWithStock", 400, {id, stock: existingPackage.stock});
    }

    const pkg = await prisma.package.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existingPackage.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", pkg, {before: existingPackage, after: pkg});
  });
}
