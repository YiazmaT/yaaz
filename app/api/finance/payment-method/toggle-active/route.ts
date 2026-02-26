import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {TogglePaymentMethodActiveDto} from "@/src/pages-content/finance/payment-method/dto";

const ROUTE = "/api/finance/payment-method/toggle-active";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PAYMENT_METHOD, ROUTE, async ({auth, success, error}) => {
    const {id}: TogglePaymentMethodActiveDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.financePaymentMethod.findUnique({
      where: {id, tenant_id: auth.tenant_id},
    });
    if (!existing) return error("api.errors.notFound", 404, {id});

    const paymentMethod = await prisma.financePaymentMethod.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        active: !existing.active,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", paymentMethod, {before: existing, after: paymentMethod});
  });
}
