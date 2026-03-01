import {sendPasswordSetupEmail} from "@/src/lib/email";
import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {withYaazAuth} from "@/src/lib/yaaz-route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/yaaz/tenant/resend-owner-email";
const RATE_LIMIT_MS = 2 * 60 * 1000;

export async function POST(req: NextRequest) {
  return withYaazAuth(LogModule.TENANT, ROUTE, async ({success, error}) => {
    const {tenantId} = await req.json();

    if (!tenantId) return error("api.errors.missingRequiredFields", 400);

    const tenant = await prismaUnscoped.tenant.findUnique({where: {id: tenantId}});
    if (!tenant || !tenant.owner_user_id) return error("api.errors.notFound", 404);

    const ownerUser = await prismaUnscoped.user.findUnique({
      where: {id: tenant.owner_user_id},
      select: {id: true, name: true, login: true, tenant_id: true, pending_password: true, setup_email_sent_at: true},
    });

    if (!ownerUser) return error("api.errors.notFound", 404);
    if (!ownerUser.pending_password) return error("users.errors.alreadyVerified", 400);

    if (ownerUser.setup_email_sent_at) {
      const elapsed = Date.now() - ownerUser.setup_email_sent_at.getTime();
      if (elapsed < RATE_LIMIT_MS) {
        const secondsLeft = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
        return error("users.errors.resendRateLimit", 429, {secondsLeft}, {secondsLeft});
      }
    }

    const pendingExpires = new Date();
    pendingExpires.setHours(pendingExpires.getHours() + 72);

    await prismaUnscoped.user.update({
      where: {id: ownerUser.id},
      data: {pending_password_expires: pendingExpires, setup_email_sent_at: new Date()},
    });

    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup-password?userId=${ownerUser.id}&tenantId=${ownerUser.tenant_id}`;

    try {
      await sendPasswordSetupEmail({
        to: ownerUser.login,
        userName: ownerUser.name,
        tenantName: tenant.name,
        tenantLogo: tenant.logo,
        setupUrl,
      });
    } catch (_) {}

    return success("update", {id: tenantId});
  });
}
