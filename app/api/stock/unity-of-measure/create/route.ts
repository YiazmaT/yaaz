import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/unity-of-measure/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.UNITY_OF_MEASURE, ROUTE, async ({auth, success, error}) => {
    const {unity} = await req.json();

    if (!unity) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.unityOfMeasure.findUnique({
      where: {tenant_id_unity: {tenant_id: auth.tenant_id, unity}},
    });

    if (existing) return error("unityOfMeasure.errors.alreadyExists", 400, {unity});

    const unityOfMeasure = await prisma.unityOfMeasure.create({
      data: {
        tenant_id: auth.tenant_id,
        unity,
        creator_id: auth.user.id,
      },
    });

    return success("create", unityOfMeasure);
  });
}
