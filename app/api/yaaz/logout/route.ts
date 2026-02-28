import {LogModule} from "@/src/lib/logger";
import {prismaUnscoped} from "@/src/lib/prisma";
import {withYaazAuth} from "@/src/lib/yaaz-route-handler";

const ROUTE = "/api/yaaz/logout";

export async function POST() {
  return withYaazAuth(LogModule.YAAZ_LOGIN, ROUTE, async ({auth, success}) => {
    await prismaUnscoped.yaazUser.update({
      data: {current_token: null, token_expires: null},
      where: {id: auth.user.id},
    });

    const response = success("important", undefined, {userId: auth.user.id});

    response.cookies.set("yaaz_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("yaaz_user", "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  });
}
