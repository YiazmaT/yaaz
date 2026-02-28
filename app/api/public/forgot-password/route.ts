import {sendPasswordResetEmail} from "@/src/lib/email";
import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {createRouteLogger} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/public/forgot-password";
const RATE_LIMIT_MS = 2 * 60 * 1000;
const GENERIC_SUCCESS = "forgotPassword.successMessage";

export async function POST(req: NextRequest) {
  const log = createRouteLogger(LogModule.USER, ROUTE);

  try {
    const {login} = await req.json();

    if (!login) {
      await log("error", {message: "api.errors.missingRequiredFields"});
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const normalizedLogin = login.trim().toLowerCase();

    const user = await prismaUnscoped.user.findFirst({
      where: {login: normalizedLogin, active: true},
      select: {
        id: true,
        name: true,
        login: true,
        tenant_id: true,
        reset_password_sent_at: true,
        tenant: {select: {name: true, logo: true}},
      },
    });

    if (!user) {
      await log("error", {message: "forgotPassword.userNotFound", content: {login: normalizedLogin}});
      return NextResponse.json({message: GENERIC_SUCCESS});
    }

    if (user.reset_password_sent_at) {
      const elapsed = Date.now() - user.reset_password_sent_at.getTime();
      if (elapsed < RATE_LIMIT_MS) {
        const secondsLeft = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
        await log("error", {message: "forgotPassword.errors.rateLimit", userId: user.id, tenantId: user.tenant_id, content: {secondsLeft}});
        return NextResponse.json({error: "forgotPassword.errors.rateLimit", data: {secondsLeft}}, {status: 429});
      }
    }

    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 72);

    await prismaUnscoped.user.update({
      where: {id: user.id},
      data: {
        reset_password_expires: resetExpires,
        reset_password_sent_at: new Date(),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?userId=${user.id}&tenantId=${user.tenant_id}`;

    await sendPasswordResetEmail({
      to: user.login,
      userName: user.name,
      tenantName: user.tenant.name,
      tenantLogo: user.tenant.logo,
      resetUrl,
    });

    await log("update", {userId: user.id, tenantId: user.tenant_id});

    return NextResponse.json({message: GENERIC_SUCCESS});
  } catch (err) {
    await log("critical", {error: err});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
