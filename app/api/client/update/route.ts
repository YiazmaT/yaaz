import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {ClientAddressDto} from "@/src/pages-content/client/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const cpf = formData.get("cpf") as string | null;
    const cnpj = formData.get("cnpj") as string | null;
    const isCompany = formData.get("isCompany") === "true";
    const image = formData.get("image") as File | null;
    const addressRaw = formData.get("address") as string | null;
    const address: ClientAddressDto | null = addressRaw ? JSON.parse(addressRaw) : null;

    if (!id || !name) return error("api.errors.missingRequiredFields", 400);

    const existingClient = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}, include: {address: true}});
    if (!existingClient) return error("api.errors.notFound", 404, {id});

    let imageUrl: string | null = existingClient.image;

    if (image && image.size > 0) {
      if (existingClient.image) {
        const oldKey = extractR2KeyFromUrl(existingClient.image);
        if (oldKey) {
          const deleted = await deleteFromR2(oldKey, auth.tenant_id);
          if (!deleted) return error("api.errors.deleteFailed", 400, {fileUrl: existingClient.image});
        }
      }

      const uploadResult = await uploadToR2(image, "clients", auth.tenant_id);
      if (!uploadResult.success) {
        if (uploadResult.error === "FILE_TOO_LARGE") return error("global.errors.fileTooLarge", 400);
        return error("api.errors.uploadFailed", 400, uploadResult);
      }
      imageUrl = uploadResult.url!;
    }

    const hasAddress = address && Object.values(address).some((v) => !!v);

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
        image: imageUrl,
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

    return success("update", client, {before: existingClient, after: client});
  });
}
