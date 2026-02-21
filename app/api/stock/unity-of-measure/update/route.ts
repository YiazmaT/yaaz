import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/unity-of-measure/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.UNITY_OF_MEASURE, ROUTE, async ({auth, success, error}) => {
    const {id, unity} = await req.json();

    if (!id || !unity) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.unityOfMeasure.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.dataNotFound", 404, {id});

    const duplicate = await prisma.unityOfMeasure.findUnique({
      where: {tenant_id_unity: {tenant_id: auth.tenant_id, unity}},
    });

    if (duplicate && duplicate.id !== id) return error("unityOfMeasure.errors.alreadyExists", 400, {unity});

    const unityOfMeasure = await prisma.unityOfMeasure.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        unity,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", unityOfMeasure, {before: existing, after: unityOfMeasure});
  });
}
