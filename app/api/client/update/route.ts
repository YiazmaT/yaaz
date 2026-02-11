import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/client/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, async (auth, log, error) => {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const cpf = formData.get("cpf") as string | null;
    const cnpj = formData.get("cnpj") as string | null;
    const isCompany = formData.get("isCompany") === "true";
    const image = formData.get("image") as File | null;

    if (!id || !name) return error("api.errors.missingRequiredFields", 400);

    const existingClient = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}});
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
      if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);
      imageUrl = uploadResult.url!;
    }

    const client = await prisma.client.update({
      where: {id},
      data: {
        name,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        cnpj: cnpj || null,
        is_company: isCompany,
        image: imageUrl,
        last_edit_date: new Date(),
        last_editor_id: auth.user.id,
      },
    });

    log("update", {content: {before: existingClient, after: client}});

    return NextResponse.json({success: true, client}, {status: 200});
  });
}
