import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success, error}) => {
    const {name, description, email, phone, cpf, cnpj, isCompany, imageUrl, address} = await req.json();

    if (!name) return error("api.errors.missingRequiredFields", 400);

    const hasAddress = address && Object.values(address).some((v) => !!v);

    const maxCode = await prisma.client.aggregate({where: {tenant_id: auth.tenant_id}, _max: {code: true}});
    const nextCode = (maxCode._max.code || 0) + 1;

    const client = await prisma.client.create({
      data: {
        tenant_id: auth.tenant_id,
        code: nextCode,
        name,
        description: description || null,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        cnpj: cnpj || null,
        is_company: isCompany,
        image: imageUrl || null,
        creator_id: auth.user.id,
        ...(hasAddress && {
          address: {
            create: {
              tenant_id: auth.tenant_id,
              ...address,
              creator_id: auth.user.id,
            },
          },
        }),
      },
      include: {address: true},
    });

    return success("create", client);
  });
}
