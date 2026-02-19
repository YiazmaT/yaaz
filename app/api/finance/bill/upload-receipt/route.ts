import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/finance/bill/upload-receipt";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  return withAuth(LogModule.FINANCE, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const billId = formData.get("billId") as string;
    const file = formData.get("file") as File | null;

    if (!billId || !file || file.size === 0) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("finance.bills.errors.invalidFileType", 400);
    }

    const bill = await prisma.bill.findUnique({where: {id: billId, tenant_id: auth.tenant_id}});
    if (!bill) return error("api.errors.notFound", 404);

    if (bill.receipt_url) {
      const oldKey = extractR2KeyFromUrl(bill.receipt_url);
      if (oldKey) {
        const deleted = await deleteFromR2(oldKey, auth.tenant_id);
        if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: bill.receipt_url});
      }
    }

    const uploadResult = await uploadToR2(file, "bill-receipts", auth.tenant_id);
    if (!uploadResult.success) {
      if (uploadResult.error === "FILE_TOO_LARGE") return error("finance.bills.errors.fileTooLarge", 400);
      return error("api.errors.uploadFailed", 400);
    }

    const updated = await prisma.bill.update({
      where: {id: billId, tenant_id: auth.tenant_id},
      data: {
        receipt_url: uploadResult.url,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", {receipt_url: updated.receipt_url});
  });
}
