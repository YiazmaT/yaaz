import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {prismaUnscoped} from "./prisma";
import {logCritical, logError, LogModule, LogSource} from "./logger";

const YAAZ_JWT_SECRET = process.env.YAAZ_JWT_SECRET!;

interface YaazJwtPayload {
  id: string;
}

export async function authenticateYaazRequest(module: LogModule, route?: string) {
  const Cookies = await cookies();
  const token = Cookies.get("yaaz_token")?.value;
  const response = NextResponse.json({error: "api.errors.expiredSession"}, {status: 401});

  if (!token) {
    logError({module, source: LogSource.API, message: "No yaaz token provided", route});
    return {error: response};
  }

  try {
    const payload = jwt.verify(token, YAAZ_JWT_SECRET) as YaazJwtPayload;

    const user = await prismaUnscoped.yaazUser.findUnique({
      where: {id: payload.id},
    });

    if (!user || user.current_token !== token) {
      return {error: response, token};
    }

    return {user};
  } catch (error) {
    logCritical({module, source: LogSource.API, route, error});
    return {error: response, token};
  }
}
