import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {createRouteLogger} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/yaaz/login";

export async function POST(req: NextRequest) {
  const log = createRouteLogger(LogModule.YAAZ_LOGIN, ROUTE);

  try {
    const {email, password} = await req.json();

    const user = await prismaUnscoped.yaazUser.findFirst({
      where: {login: email.trim().toLowerCase()},
    });

    if (!user || !user.active || !(await bcrypt.compare(password, user.password))) {
      log("error", {message: "api.errors.loginOrPasswordIncorrect", content: {email}});
      return NextResponse.json({error: "api.errors.loginOrPasswordIncorrect"}, {status: 400});
    }

    const expiresIn = parseInt(process.env.TOKEN_EXPIRATION_TIME ?? "7200");
    const now = new Date();
    now.setSeconds(now.getSeconds() + expiresIn);

    const token = jwt.sign({id: user.id}, process.env.YAAZ_JWT_SECRET!, {expiresIn});

    await prismaUnscoped.yaazUser.update({
      data: {token_expires: now, current_token: token},
      where: {id: user.id},
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {id: user.id, name: user.name, login: user.login, admin: user.admin},
      },
      {status: 200},
    );

    response.cookies.set("yaaz_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    log("important", {content: {user: {id: user.id, name: user.name}}, userId: user.id});

    return response;
  } catch (error) {
    await log("critical", {error});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}
