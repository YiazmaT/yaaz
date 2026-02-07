import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/client/update";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.CLIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const cpf = formData.get("cpf") as string | null;
    const cnpj = formData.get("cnpj") as string | null;
    const isCompany = formData.get("isCompany") === "true";
    const image = formData.get("image") as File | null;

    if (!id || !name) {
      logError({module: LogModule.CLIENT, source: LogSource.API, message: "api.errors.missingRequiredFields", route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const existingClient = await prisma.client.findUnique({where: {id, tenant_id: auth.tenant_id}});

    if (!existingClient) {
      logError({module: LogModule.CLIENT, source: LogSource.API, message: "Client not found", content: {id}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    let imageUrl: string | null = existingClient.image;

    if (image && image.size > 0) {
      if (existingClient.image) {
        const oldKey = extractR2KeyFromUrl(existingClient.image);
        if (oldKey) {
          await deleteFromR2(oldKey, auth.tenant_id);
        }
      }

      const uploadResult = await uploadToR2(image, "clients", auth.tenant_id);

      if (!uploadResult.success) {
        logError({module: LogModule.CLIENT, source: LogSource.API, message: "Failed to upload image to R2", content: uploadResult, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
        return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 400});
      }

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
        last_editor_id: auth.user!.id,
      },
    });

    logUpdate({module: LogModule.CLIENT, source: LogSource.API, content: {before: existingClient, after: client}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, client}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.CLIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
