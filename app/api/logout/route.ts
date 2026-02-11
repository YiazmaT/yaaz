import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {NextResponse} from "next/server";

const ROUTE = "/api/logout";

export async function POST() {
  return withAuth(LogModule.LOGIN, ROUTE, async (auth, log) => {
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

    log("important", {content: {userId: auth.user.id}});

    return response;
  });
}
