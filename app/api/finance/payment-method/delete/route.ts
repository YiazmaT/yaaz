import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {DeletePaymentMethodDto} from "@/src/pages-content/finance/payment-method/dto";

const ROUTE = "/api/finance/payment-method/delete";

export async function DELETE(req: NextRequest) {
  return withAuth(LogModule.PAYMENT_METHOD, ROUTE, async ({auth, success, error}) => {
    const {id}: DeletePaymentMethodDto = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const paymentMethod = await prisma.financePaymentMethod.findUnique({
      where: {id, tenant_id: auth.tenant_id},
    });
    if (!paymentMethod) return error("api.errors.notFound", 404, {id});

    await prisma.financePaymentMethod.delete({where: {id, tenant_id: auth.tenant_id}});

    return success("delete", paymentMethod);
  });
}
