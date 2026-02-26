import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {UpdatePaymentMethodDto} from "@/src/pages-content/finance/payment-method/dto";

const ROUTE = "/api/finance/payment-method/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.PAYMENT_METHOD, ROUTE, async ({auth, success, error}) => {
    const {id, name, bank_account_id}: UpdatePaymentMethodDto = await req.json();

    if (!id || !name) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.financePaymentMethod.findUnique({
      where: {id, tenant_id: auth.tenant_id},
    });
    if (!existing) return error("api.errors.notFound", 404, {id});

    const duplicate = await prisma.financePaymentMethod.findFirst({
      where: {tenant_id: auth.tenant_id, name: {equals: name, mode: "insensitive"}, id: {not: id}},
    });
    if (duplicate) return error("finance.paymentMethod.errors.nameAlreadyExists", 400);

    const paymentMethod = await prisma.financePaymentMethod.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        name,
        bank_account_id: bank_account_id ?? null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    return success("update", paymentMethod, {before: existing, after: paymentMethod});
  });
}
