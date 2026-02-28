import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {createRouteLogger} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/public/password-link-info";

export async function GET(req: NextRequest) {
  const log = createRouteLogger(LogModule.USER, ROUTE);
  const {searchParams} = new URL(req.url);
  const userId = searchParams.get("userId");
  const tenantId = searchParams.get("tenantId");
  const mode = searchParams.get("mode") as "setup" | "reset" | null;

  if (!userId || !tenantId || !mode) {
    await log("error", {message: "api.errors.missingRequiredFields", content: {userId, tenantId, mode}});
    return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
  }

  const user = await prismaUnscoped.user.findFirst({
    where: {id: userId, tenant_id: tenantId},
    select: {
      id: true,
      name: true,
      pending_password: true,
      pending_password_expires: true,
      reset_password_expires: true,
      tenant: {select: {name: true, logo: true}},
    },
  });

  const invalidLinkKey = mode === "setup" ? "setupPassword.errors.invalidLink" : "resetPassword.errors.invalidLink";

  if (!user) {
    await log("error", {message: invalidLinkKey, userId, tenantId});
    return NextResponse.json({error: invalidLinkKey}, {status: 400});
  }

  const isValid =
    mode === "setup"
      ? user.pending_password && user.pending_password_expires && user.pending_password_expires > new Date()
      : user.reset_password_expires && user.reset_password_expires > new Date();

  if (!isValid) {
    await log("error", {message: invalidLinkKey, userId, tenantId});
    return NextResponse.json({error: invalidLinkKey}, {status: 400});
  }

  await log("get", {userId, tenantId, content: {mode}});

  return NextResponse.json({
    data: {
      userName: user.name,
      tenantName: user.tenant.name,
      tenantLogo: user.tenant.logo,
    },
  });
}
