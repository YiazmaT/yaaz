import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextResponse} from "next/server";

const ROUTE = "/api/logout";

export async function POST() {
  return withAuth(LogModule.LOGIN, ROUTE, async ({auth, success}) => {
    await prisma.user.update({
      data: {current_token: null, token_expires: null},
      where: {id: auth.user.id, tenant_id: auth.tenant_id},
    });

    const response = success("important", undefined, {userId: auth.user.id});
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  });
}
