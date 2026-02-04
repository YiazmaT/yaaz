import {authenticateRequest} from "@/src/lib/auth";
import {logCritical, LogModule, LogSource, logImportant} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {NextResponse} from "next/server";

const ROUTE = "/api/logout";

export async function POST() {
  const auth = await authenticateRequest(LogModule.LOGIN, ROUTE);
  if (auth.error) return auth.error;

  try {
    if (auth.user) {
      await prisma.user.update({
        data: {current_token: null, token_expires: null},
        where: {id: auth.user.id},
      });
      const response = NextResponse.json({success: true}, {status: 200});
      response.cookies.set("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      logImportant({module: LogModule.LOGIN, source: LogSource.API, userId: auth.user.id, route: ROUTE});
      return response;
    }
  } catch (error) {
    await logCritical({module: LogModule.LOGIN, source: LogSource.API, error, route: ROUTE, tenantId: auth.tenant_id});
    return NextResponse.json({error: "Whoops something went wrong"}, {status: 500});
  }
}
