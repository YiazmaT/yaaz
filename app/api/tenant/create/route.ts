import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logCreate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {noTenantUploadToR2, uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/tenant/create";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.TENANT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string | null;
    const secondary_color = formData.get("secondary_color") as string | null;
    const time_zone = formData.get("time_zone") as string;
    const currency_type = formData.get("currency_type") as string;
    const logo = formData.get("logo") as File | null;

    if (!name || !time_zone || !currency_type) {
      logError({
        module: LogModule.TENANT,
        source: LogSource.API,
        message: "api.errors.missingRequiredFields",
        route: ROUTE,
        userId: auth.user!.id,
        tenantId: auth.tenant_id,
      });
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    let logoUrl: string | null = null;

    if (logo && logo.size > 0) {
      const uploadResult = await noTenantUploadToR2(logo, "tenants");

      if (!uploadResult.success) {
        logError({
          module: LogModule.TENANT,
          source: LogSource.API,
          message: "Failed to upload logo to R2",
          content: uploadResult,
          route: ROUTE,
          userId: auth.user!.id,
          tenantId: auth.tenant_id,
        });
        return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 400});
      }

      logoUrl = uploadResult.url!;
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        logo: logoUrl,
        primary_color: primary_color || null,
        secondary_color: secondary_color || null,
        time_zone,
        currency_type,
      },
    });

    logCreate({module: LogModule.TENANT, source: LogSource.API, content: tenant, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, tenant}, {status: 201});
  } catch (error) {
    await logCritical({module: LogModule.TENANT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
