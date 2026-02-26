import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";
import {CreatePaymentMethodDto} from "@/src/pages-content/finance/payment-method/dto";

const ROUTE = "/api/finance/payment-method/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PAYMENT_METHOD, ROUTE, async ({auth, success, error}) => {
    const {name, bank_account_id}: CreatePaymentMethodDto = await req.json();

    if (!name) return error("api.errors.missingRequiredFields", 400);

    const existing = await prisma.financePaymentMethod.findFirst({
      where: {tenant_id: auth.tenant_id, name: {equals: name, mode: "insensitive"}},
    });
    if (existing) return error("finance.paymentMethod.errors.nameAlreadyExists", 400, {existing});

    const paymentMethod = await prisma.financePaymentMethod.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        bank_account_id: bank_account_id ?? null,
        creator_id: auth.user.id,
      },
    });

    return success("create", paymentMethod);
  });
}
