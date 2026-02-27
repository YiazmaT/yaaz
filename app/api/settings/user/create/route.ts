import {LogModule} from "@/src/lib/logger";
import {prisma, prismaUnscoped} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success, error}) => {
    const {name, login, password, admin, imageUrl} = await req.json();

    if (!name || !login || !password) return error("api.errors.missingRequiredFields", 400);

    const normalizedLogin = login.trim().toLowerCase();

    const tenant = await prisma.tenant.findUnique({where: {id: auth.tenant_id}});
    if (!tenant) return error("api.errors.notFound", 404);

    const userCount = await prisma.user.count({where: {tenant_id: auth.tenant_id, active: true}});
    if (userCount >= tenant.max_user_amount) return error("users.errors.userLimitReached", 400);

    const existingUser = await prismaUnscoped.user.findFirst({where: {login: normalizedLogin}});
    if (existingUser) return error("users.errors.loginAlreadyExists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        login: normalizedLogin,
        password: hashedPassword,
        admin: admin ?? false,
        image: imageUrl || null,
        creator_id: auth.user.id,
      },
      select: {
        id: true,
        tenant_id: true,
        name: true,
        login: true,
        admin: true,
        owner: true,
        image: true,
        create_date: true,
      },
    });

    return success("create", user);
  });
}
