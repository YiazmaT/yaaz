import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {deleteFromR2, extractR2KeyFromUrl, noTenantUploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/tenant/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.TENANT, ROUTE, async (auth, log, error) => {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string | null;
    const secondary_color = formData.get("secondary_color") as string | null;
    const time_zone = formData.get("time_zone") as string;
    const currency_type = formData.get("currency_type") as string;
    const logo = formData.get("logo") as File | null;

    if (!id || !name || !time_zone || !currency_type) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const existingTenant = await prisma.tenant.findUnique({where: {id}});

    if (!existingTenant) {
      return error("api.errors.notFound", 404, {id});
    }

    let logoUrl: string | null = existingTenant.logo;

    if (logo && logo.size > 0) {
      if (existingTenant.logo) {
        const oldKey = extractR2KeyFromUrl(existingTenant.logo);
        if (oldKey) {
          const deleted = await deleteFromR2(oldKey, auth.tenant_id);
          if (!deleted) {
            return error("api.errors.deleteFailed", 400);
          }
        }
      }

      const uploadResult = await noTenantUploadToR2(logo, "tenants");

      if (!uploadResult.success) {
        return error("api.errors.uploadFailed", 400, uploadResult);
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
        time_zone,
        currency_type,
      },
    });

    log("update", {content: {before: existingTenant, after: tenant}});

    return NextResponse.json({success: true, tenant}, {status: 200});
  });
}
