import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {toZonedTime} from "date-fns-tz";

const ROUTE = "/api/dashboard/bills-alerts";

export async function GET() {
  return withAuth(LogModule.DASHBOARD, ROUTE, async ({auth, success}) => {
    const timezone = auth.tenant.time_zone;

    const zonedDate = toZonedTime(new Date(), timezone);
    const y = zonedDate.getFullYear();
    const m = zonedDate.getMonth();
    const d = zonedDate.getDate();

    const startOfToday = new Date(Date.UTC(y, m, d));
    const startOfTomorrow = new Date(Date.UTC(y, m, d + 1));

    const [overdue, dueToday] = await Promise.all([
      prisma.bill.findMany({
        where: {
          tenant_id: auth.tenant_id,
          status: "pending",
          active: true,
          due_date: {lt: startOfToday},
        },
        select: {
          id: true,
          code: true,
          description: true,
          amount: true,
          due_date: true,
          category: {select: {name: true}},
        },
        orderBy: {due_date: "asc"},
      }),
      prisma.bill.findMany({
        where: {
          tenant_id: auth.tenant_id,
          status: "pending",
          active: true,
          due_date: {gte: startOfToday, lt: startOfTomorrow},
        },
        select: {
          id: true,
          code: true,
          description: true,
          amount: true,
          due_date: true,
          category: {select: {name: true}},
        },
        orderBy: {due_date: "asc"},
      }),
    ]);

    return success("get", {overdue, dueToday});
  });
}
