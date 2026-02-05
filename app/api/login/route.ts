import {logCritical, logError, LogModule, LogSource, logImportant} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/login";

export async function POST(req: NextRequest) {
  try {
    const {email, password} = await req.json();
    const user = await prisma.user.findFirst({
      where: {login: email.trim().toLowerCase()},
      include: {tenant: {select: {id: true, name: true, logo: true, primary_color: true, secondary_color: true, time_zone: true, currency_type: true}}},
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logError({
        module: LogModule.LOGIN,
        source: LogSource.API,
        message: "api.errors.loginOrPasswordIncorrect",
        content: {email, password},
        route: ROUTE,
      });
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
      process.env.JWT_SECRET ?? "default_secret",
      {expiresIn},
    );

    await prisma.user.update({
      data: {token_expires: now, current_token: token},
      where: {id: user.id},
    });

    const response = NextResponse.json({success: true, tenant: user.tenant}, {status: 200});
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    logImportant({module: LogModule.LOGIN, source: LogSource.API, content: {token, user}, userId: user.id, route: ROUTE});

    return response;
  } catch (error) {
    await logCritical({module: LogModule.LOGIN, source: LogSource.API, error, route: ROUTE});
    return NextResponse.json({error: "Whoops something went wrong"}, {status: 500});
  }
}
