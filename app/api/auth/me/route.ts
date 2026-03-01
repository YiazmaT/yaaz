import {LogModule} from "@/src/lib/logger";
import {withAuth} from "@/src/lib/route-handler";

const ROUTE = "/api/auth/me";

export async function GET() {
  return withAuth(LogModule.LOGIN, ROUTE, null, async ({auth, success}) => {
    const {user, permissions} = auth;
    return success("get", {
      user: {id: user.id, name: user.name, login: user.login, image: user.image, admin: user.admin, owner: user.owner},
      permissions,
    });
  });
}
