import {LogModule, LogSource} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {createRouteLogger} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/public/setup-password";
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

export async function GET(req: NextRequest) {
  const log = createRouteLogger(LogModule.USER, ROUTE);
  const {searchParams} = new URL(req.url);
  const userId = searchParams.get("userId");
  const tenantId = searchParams.get("tenantId");

  if (!userId || !tenantId) {
    await log("error", {message: "setupPassword.errors.invalidLink", content: {userId, tenantId}});
    return NextResponse.json({error: "setupPassword.errors.invalidLink"}, {status: 400});
  }

  const user = await prismaUnscoped.user.findFirst({
    where: {id: userId, tenant_id: tenantId},
    select: {
      id: true,
      name: true,
      pending_password: true,
      pending_password_expires: true,
      tenant: {select: {name: true, logo: true}},
    },
  });

  if (!user || !user.pending_password) {
    await log("error", {message: "setupPassword.errors.invalidLink", userId, tenantId});
    return NextResponse.json({error: "setupPassword.errors.invalidLink"}, {status: 400});
  }

  if (!user.pending_password_expires || user.pending_password_expires < new Date()) {
    await log("error", {message: "setupPassword.errors.invalidLink", userId, tenantId});
    return NextResponse.json({error: "setupPassword.errors.invalidLink"}, {status: 400});
  }

  await log("get", {userId, tenantId});

  return NextResponse.json({
    data: {
      userName: user.name,
      tenantName: user.tenant.name,
      tenantLogo: user.tenant.logo,
    },
  });
}

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
      select: {id: true, pending_password: true, pending_password_expires: true},
    });

    if (!user || !user.pending_password) {
      await log("error", {message: "setupPassword.errors.invalidLink", userId, tenantId});
      return NextResponse.json({error: "setupPassword.errors.invalidLink"}, {status: 400});
    }

    if (!user.pending_password_expires || user.pending_password_expires < new Date()) {
      await log("error", {message: "setupPassword.errors.invalidLink", userId, tenantId});
      return NextResponse.json({error: "setupPassword.errors.invalidLink"}, {status: 400});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prismaUnscoped.user.update({
      where: {id: userId, tenant_id: tenantId},
      data: {
        password: hashedPassword,
        pending_password: false,
        pending_password_expires: null,
      },
    });

    await log("update", {userId, tenantId});

    return NextResponse.json({success: true});
  } catch (err) {
    await log("critical", {error: err});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
