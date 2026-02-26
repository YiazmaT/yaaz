import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {ClientAddressDto} from "@/src/pages-content/client/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success, error}) => {
    const {id, name, description, email, phone, cpf, cnpj, isCompany, imageUrl, address} = await req.json();

    if (!id || !name) return error("api.errors.missingRequiredFields", 400);

    const existingClient = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}, include: {address: true}});
    if (!existingClient) return error("api.errors.notFound", 404, {id});

    const hasAddress = address && Object.values(address as ClientAddressDto).some((v) => !!v);

    const client = await prisma.client.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        name,
        description: description || null,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        cnpj: cnpj || null,
        is_company: isCompany,
        image: imageUrl ?? null,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
        ...(hasAddress && {
          address: {
            upsert: {
              create: {
                tenant_id: auth.tenant_id,
                ...address,
                creator_id: auth.user.id,
              },
              update: {
                ...address,
                last_edit_date: new Date(),
                last_editor_id: auth.user.id,
              },
            },
          },
        }),
      },
      include: {address: true},
    });

    if (existingClient.image && existingClient.image !== imageUrl) {
      const oldKey = extractR2KeyFromUrl(existingClient.image);
      if (oldKey) await deleteFromR2(oldKey, auth.tenant_id);
    }

    return success("update", client, {before: existingClient, after: client});
  });
}
