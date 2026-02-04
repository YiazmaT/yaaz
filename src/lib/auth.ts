import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {prisma} from "./prisma";
import {logCritical, logError, LogModule, LogSource} from "./logger";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authenticateRequest(module: LogModule, route?: string) {
  const Cookies = await cookies();
  const token = Cookies.get("token")?.value;
  const response = NextResponse.json({error: "api.errors.expiredSession"}, {status: 401});

  if (!token) {
    logError({module, source: LogSource.API, message: "No token provided", route});
    return {error: response};
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {id: string; tenant_id: string};

    const user = await prisma.user.findUnique({
      where: {id: payload.id},
    });

    if (!user || user.current_token !== token) {
      return {error: response, token};
    }

    return {user, tenant_id: user.tenant_id};
  } catch (error) {
    logCritical({module, source: LogSource.API, route, error});
    return {error: response, token};
  }
}
