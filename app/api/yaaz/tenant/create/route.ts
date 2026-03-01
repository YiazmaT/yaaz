import {sendPasswordSetupEmail} from "@/src/lib/email";
import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {noTenantUploadToR2} from "@/src/lib/r2";
import {withYaazAuth} from "@/src/lib/yaaz-route-handler";
import * as bcrypt from "bcrypt";
import {randomBytes} from "crypto";
import {NextRequest} from "next/server";

const ROUTE = "/api/yaaz/tenant/create";

export async function POST(req: NextRequest) {
  return withYaazAuth(LogModule.TENANT, ROUTE, async ({success, error}) => {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string | null;
    const secondary_color = formData.get("secondary_color") as string | null;
    const time_zone = formData.get("time_zone") as string;
    const currency_type = formData.get("currency_type") as string;
    const logo = formData.get("logo") as File | null;
    const owner_email = formData.get("owner_email") as string;
    const owner_name = formData.get("owner_name") as string;

    if (!name || !time_zone || !currency_type || !owner_email || !owner_name) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const normalizedEmail = owner_email.trim().toLowerCase();

    const existingUser = await prismaUnscoped.user.findFirst({where: {login: normalizedEmail}});
    if (existingUser) return error("users.errors.loginAlreadyExists", 400);

    let logoUrl: string | null = null;

    if (logo && logo.size > 0) {
      const uploadResult = await noTenantUploadToR2(logo, "tenants");
      if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);
      logoUrl = uploadResult.url!;
    }

    const tenant = await prismaUnscoped.tenant.create({
      data: {
        name,
        logo: logoUrl,
        primary_color: primary_color || null,
        secondary_color: secondary_color || null,
        time_zone,
        currency_type,
      },
    });

    const placeholderPassword = randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

    const pendingExpires = new Date();
    pendingExpires.setHours(pendingExpires.getHours() + 72);

    const ownerUser = await prismaUnscoped.user.create({
      data: {
        tenant_id: tenant.id,
        name: owner_name,
        login: normalizedEmail,
        password: hashedPassword,
        admin: true,
        owner: true,
        pending_password: true,
        pending_password_expires: pendingExpires,
        setup_email_sent_at: new Date(),
      },
    });

    await prismaUnscoped.tenant.update({
      where: {id: tenant.id},
      data: {owner_user_id: ownerUser.id},
    });

    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup-password?userId=${ownerUser.id}&tenantId=${tenant.id}`;

    try {
      await sendPasswordSetupEmail({
        to: normalizedEmail,
        userName: owner_name,
        tenantName: tenant.name,
        tenantLogo: tenant.logo,
        setupUrl,
      });
    } catch (_) {}

    return success("create", tenant);
  });
}
