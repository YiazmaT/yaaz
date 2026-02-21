import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/unity-of-measure/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.UNITY_OF_MEASURE, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.unityOfMeasure.findUnique({where: {id, tenant_id: auth.tenant_id}});
    if (!existing) return error("api.errors.dataNotFound", 404, {id});

    const unityOfMeasure = await prisma.unityOfMeasure.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", unityOfMeasure);
  });
}
