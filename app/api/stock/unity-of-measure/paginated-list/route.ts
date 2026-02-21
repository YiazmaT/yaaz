import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/stock/unity-of-measure/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.UNITY_OF_MEASURE, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const showInactives = searchParams.get("showInactives") === "true";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (!showInactives) {
      where.active = true;
    }

    if (search) {
      where.unity = {contains: search, mode: "insensitive" as const};
    }

    const [data, total] = await Promise.all([
      prisma.unityOfMeasure.findMany({
        where,
        skip,
        take: limit,
        orderBy: {unity: "asc"},
        select: {id: true, unity: true, active: true},
      }),
      prisma.unityOfMeasure.count({where}),
    ]);

    return success("get", {data, total, page, limit});
  });
}
