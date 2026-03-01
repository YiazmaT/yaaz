import {sendPasswordSetupEmail} from "@/src/lib/email";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/resend-setup-email";
const RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes

export async function POST(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success, error}) => {
    const {id} = await req.json();

    if (!id) return error("api.errors.missingRequiredFields", 400);

    const user = await prisma.user.findFirst({
      where: {id, tenant_id: auth.tenant_id},
      select: {
        id: true,
        name: true,
        login: true,
        tenant_id: true,
        pending_password: true,
        setup_email_sent_at: true,
        tenant: {select: {name: true, logo: true}},
      },
    });

    if (!user) return error("api.errors.notFound", 404);
    if (!user.pending_password) return error("users.errors.alreadyVerified", 400);

    if (user.setup_email_sent_at) {
      const elapsed = Date.now() - user.setup_email_sent_at.getTime();
      if (elapsed < RATE_LIMIT_MS) {
        const secondsLeft = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
        return error("users.errors.resendRateLimit", 429, {secondsLeft}, {secondsLeft});
      }
    }

    const pendingExpires = new Date();
    pendingExpires.setHours(pendingExpires.getHours() + 72);

    await prisma.user.update({
      where: {id, tenant_id: auth.tenant_id},
      data: {
        pending_password_expires: pendingExpires,
        setup_email_sent_at: new Date(),
      },
    });

    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup-password?userId=${user.id}&tenantId=${user.tenant_id}`;

    try {
      await sendPasswordSetupEmail({
        to: user.login,
        userName: user.name,
        tenantName: user.tenant.name,
        tenantLogo: user.tenant.logo,
        setupUrl,
      });
    } catch (_) {}

    return success("update", {id});
  });
}
