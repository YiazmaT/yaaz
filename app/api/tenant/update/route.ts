import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, logError, LogModule, LogSource, logUpdate} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, uploadToR2} from "@/src/lib/r2";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/tenant/update";

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(LogModule.TENANT, ROUTE);
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string | null;
    const secondary_color = formData.get("secondary_color") as string | null;
    const logo = formData.get("logo") as File | null;

    if (!id || !name) {
      logError({module: LogModule.TENANT, source: LogSource.API, message: "api.errors.missingRequiredFields", route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const existingTenant = await prisma.tenant.findUnique({where: {id}});

    if (!existingTenant) {
      logError({module: LogModule.TENANT, source: LogSource.API, message: "Tenant not found", content: {id}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
      return NextResponse.json({error: "api.errors.dataNotFound"}, {status: 404});
    }

    let logoUrl: string | null = existingTenant.logo;

    if (logo && logo.size > 0) {
      if (existingTenant.logo) {
        const oldKey = extractR2KeyFromUrl(existingTenant.logo);
        if (oldKey) {
          await deleteFromR2(oldKey, auth.tenant_id);
        }
      }

      const uploadResult = await uploadToR2(logo, "tenants", auth.tenant_id);

      if (!uploadResult.success) {
        logError({module: LogModule.TENANT, source: LogSource.API, message: "Failed to upload logo to R2", content: uploadResult, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
        return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 400});
      }

      logoUrl = uploadResult.url!;
    }

    const tenant = await prisma.tenant.update({
      where: {id},
      data: {
        name,
        logo: logoUrl,
        primary_color: primary_color || null,
        secondary_color: secondary_color || null,
      },
    });

    logUpdate({module: LogModule.TENANT, source: LogSource.API, content: {before: existingTenant, after: tenant}, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});

    return NextResponse.json({success: true, tenant}, {status: 200});
  } catch (error) {
    await logCritical({module: LogModule.TENANT, source: LogSource.API, error, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
