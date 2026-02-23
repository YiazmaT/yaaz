import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {startOfDay, endOfDay} from "date-fns";
import {fromZonedTime} from "date-fns-tz";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/paginated-list";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.BILL, ROUTE, async ({auth, success}) => {
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const dueDateFrom = searchParams.get("dueDateFrom") || "";
    const dueDateTo = searchParams.get("dueDateTo") || "";
    const valueFrom = searchParams.get("valueFrom") || "";
    const valueTo = searchParams.get("valueTo") || "";
    const skip = (page - 1) * limit;

    const where: any = {tenant_id: auth.tenant_id};

    if (search) {
      const searchAsNumber = parseInt(search);
      where.OR = [{description: {contains: search, mode: "insensitive"}}, ...(!isNaN(searchAsNumber) ? [{code: searchAsNumber}] : [])];
    }

    if (status === "overdue") {
      const timezone = auth.tenant.time_zone;
      where.status = "pending";
      where.due_date = {...(where.due_date || {}), lt: fromZonedTime(startOfDay(new Date()), timezone)};
    } else if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (valueFrom || valueTo) {
      where.amount = {};
      if (valueFrom) where.amount.gte = parseFloat(valueFrom);
      if (valueTo) where.amount.lte = parseFloat(valueTo);
    }

    if (dueDateFrom || dueDateTo) {
      const timezone = auth.tenant.time_zone;
      where.due_date = {};
      if (dueDateFrom) where.due_date.gte = fromZonedTime(startOfDay(new Date(dueDateFrom)), timezone);
      if (dueDateTo) where.due_date.lte = fromZonedTime(endOfDay(new Date(dueDateTo)), timezone);
    }

    const [data, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy: {due_date: "asc"},
        include: {
          category: {select: {id: true, name: true}},
          bank_account: {select: {id: true, name: true}},
        },
      }),
      prisma.bill.count({where}),
    ]);

    return success("get", {data, total, page, limit});
  });
}
