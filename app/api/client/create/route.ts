import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/client/create";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.CLIENT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const cpf = formData.get("cpf") as string | null;
    const cnpj = formData.get("cnpj") as string | null;
    const isCompany = formData.get("isCompany") === "true";
    const image = formData.get("image") as File | null;

    if (!name) {
      logError({
        module: LogModule.CLIENT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const uploadResult = await uploadToR2(image, "clients", auth.tenant_id);

      if (!uploadResult.success) {
        logError({
          module: LogModule.CLIENT,
          source: LogSource.API,
          message: "Failed to upload image to R2",
          content: uploadResult,
          route: ROUTE,
          userId: auth.user!.id,
          tenantId: auth.tenant_id,
        });
        return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 400});
      }

      imageUrl = uploadResult.url!;
    }

    const client = await prisma.client.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        email: email || null,
        phone: phone || null,
        cpf: cpf || null,
        cnpj: cnpj || null,
        is_company: isCompany,
        image: imageUrl,
        creator_id: auth.user!.id,
      },
    });

    logCreate({module: LogModule.CLIENT, source: LogSource.API, content: client, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, client}, {status: 201});
  } catch (error) {
    await logCritical({module: LogModule.CLIENT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
