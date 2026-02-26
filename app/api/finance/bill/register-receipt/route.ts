import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/register-receipt";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.BILL, ROUTE, async ({auth, success, error}) => {
    const {billId, url} = await req.json();

    if (!billId || !url) {
      return error("api.errors.missingRequiredFields", 400, {billId, url});
    }

    if (!url.includes(`/${auth.tenant_id}/`)) {
      return error("api.errors.notFound", 404, {url});
    }

    const bill = await prisma.bill.findUnique({where: {id: billId, tenant_id: auth.tenant_id}});
    if (!bill) return error("api.errors.notFound", 404, {billId});

    if (bill.receipt_url) {
      const oldKey = extractR2KeyFromUrl(bill.receipt_url);
      if (oldKey) await deleteFromR2(oldKey, auth.tenant_id);
    }

    const updated = await prisma.bill.update({
      where: {id: billId, tenant_id: auth.tenant_id},
      data: {
        receipt_url: url,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", {receipt_url: updated.receipt_url}, {before: {receipt_url: bill.receipt_url}, after: {receipt_url: updated.receipt_url}});
  });
}
