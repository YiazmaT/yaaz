import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {createRouteLogger} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/login";

export async function POST(req: NextRequest) {
  const log = createRouteLogger(LogModule.LOGIN, ROUTE);

  try {
    const {email, password} = await req.json();
    const user = await prisma.user.findFirst({
      where: {login: email.trim().toLowerCase()},
      include: {tenant: {select: {name: true, logo: true, primary_color: true, secondary_color: true, time_zone: true, currency_type: true}}},
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      log("error", {message: "api.errors.loginOrPasswordIncorrect", content: {email}});
      return NextResponse.json({error: "api.errors.loginOrPasswordIncorrect"}, {status: 400});
    }

    const expiresIn = parseInt(process.env.TOKEN_EXPIRATION_TIME ?? "7200");
    const now = new Date();
    now.setSeconds(now.getSeconds() + expiresIn);

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.login,
        tenant_id: user.tenant_id,
        tenant: user.tenant,
      },
      process.env.JWT_SECRET!,
      {expiresIn},
    );

    await prisma.user.update({
      data: {token_expires: now, current_token: token},
      where: {id: user.id},
    });

    const response = NextResponse.json({success: true, tenant: user.tenant, user: {name: user.name}}, {status: 200});
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    log("important", {content: {token, user}, userId: user.id});

    return response;
  } catch (error) {
    await log("critical", {error});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
