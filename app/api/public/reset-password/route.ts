import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {createRouteLogger} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/public/reset-password";
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

export async function POST(req: NextRequest) {
  const log = createRouteLogger(LogModule.USER, ROUTE);

  try {
    const {userId, tenantId, password, confirmPassword} = await req.json();

    if (!userId || !tenantId || !password || !confirmPassword) {
      await log("error", {message: "api.errors.missingRequiredFields", userId, tenantId});
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    if (password !== confirmPassword) {
      await log("error", {message: "setupPassword.errors.passwordMismatch", userId, tenantId});
      return NextResponse.json({error: "setupPassword.errors.passwordMismatch"}, {status: 400});
    }

    if (!PASSWORD_REGEX.test(password)) {
      await log("error", {message: "api.errors.missingRequiredFields", userId, tenantId});
      return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    }

    const user = await prismaUnscoped.user.findFirst({
      where: {id: userId, tenant_id: tenantId},
      select: {id: true, reset_password_expires: true},
    });

    if (!user || !user.reset_password_expires || user.reset_password_expires < new Date()) {
      await log("error", {message: "resetPassword.errors.invalidLink", userId, tenantId});
      return NextResponse.json({error: "resetPassword.errors.invalidLink"}, {status: 400});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prismaUnscoped.user.update({
      where: {id: userId},
      data: {
        password: hashedPassword,
        reset_password_expires: null,
      },
    });

    await log("update", {userId, tenantId});

    return NextResponse.json({success: true});
  } catch (err) {
    await log("critical", {error: err});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
