import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {noTenantUploadToR2} from "@/src/lib/r2";
import {withYaazAuth} from "@/src/lib/yaaz-route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/tenant/create";

export async function POST(req: NextRequest) {
  return withYaazAuth(LogModule.TENANT, ROUTE, async ({success, error}) => {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string | null;
    const secondary_color = formData.get("secondary_color") as string | null;
    const time_zone = formData.get("time_zone") as string;
    const currency_type = formData.get("currency_type") as string;
    const logo = formData.get("logo") as File | null;

    if (!name || !time_zone || !currency_type) {
      return error("api.errors.missingRequiredFields", 400);
    }

    let logoUrl: string | null = null;

    if (logo && logo.size > 0) {
      const uploadResult = await noTenantUploadToR2(logo, "tenants");

      if (!uploadResult.success) {
        return error("api.errors.uploadFailed", 400, uploadResult);
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

    return success("create", tenant);
  });
}
