import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/delete-receipt";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const {billId} = await req.json();

    if (!billId) return error("api.errors.missingRequiredFields", 400);

    const bill = await prisma.bill.findUnique({where: {id: billId, tenant_id: auth.tenant_id}});
    if (!bill) return error("api.errors.notFound", 404);
    if (!bill.receipt_url) return error("api.errors.notFound", 404);

    const r2Key = extractR2KeyFromUrl(bill.receipt_url);
    if (r2Key) {
      const deleted = await deleteFromR2(r2Key, auth.tenant_id);
      if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: bill.receipt_url});
    }

    await prisma.bill.update({
      where: {id: billId, tenant_id: auth.tenant_id},
      data: {
        receipt_url: null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("delete", {billId});
  });
}
