import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {ClientAddressDto} from "@/src/pages-content/client/dto";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async ({auth, success, error}) => {
    const formData = await req.formData();
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

    if (!name) return error("api.errors.missingRequiredFields", 400);

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const uploadResult = await uploadToR2(image, "clients", auth.tenant_id);
      if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);
      imageUrl = uploadResult.url!;
    }

    const hasAddress = address && Object.values(address).some((v) => !!v);

    const client = await prisma.client.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        description: description || null,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        cnpj: cnpj || null,
        is_company: isCompany,
        image: imageUrl,
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
