import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/unity-of-measure/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.UNITY_OF_MEASURE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.unityOfMeasure.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.dataNotFound", 404, {id});

    const unityOfMeasure = await prisma.unityOfMeasure.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existing.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", unityOfMeasure, {before: existing, after: unityOfMeasure});
  });
}
