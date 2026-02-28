import {sendPasswordSetupEmail} from "@/src/lib/email";
import {LogModule} from "@/src/lib/logger";
import {prisma, prismaUnscoped} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import {randomBytes} from "crypto";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success, error}) => {
    const {name, login, admin, imageUrl} = await req.json();

    if (!name || !login) return error("api.errors.missingRequiredFields", 400);

    const normalizedLogin = login.trim().toLowerCase();

    const tenant = await prisma.tenant.findUnique({where: {id: auth.tenant_id}});
    if (!tenant) return error("api.errors.notFound", 404);

    const userCount = await prisma.user.count({where: {tenant_id: auth.tenant_id, active: true}});
    if (userCount >= tenant.max_user_amount) return error("users.errors.userLimitReached", 400);

    const existingUser = await prismaUnscoped.user.findFirst({where: {login: normalizedLogin}});
    if (existingUser) return error("users.errors.loginAlreadyExists", 400);

    const placeholderPassword = randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

    const pendingExpires = new Date();
    pendingExpires.setHours(pendingExpires.getHours() + 72);

    const user = await prisma.user.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        login: normalizedLogin,
        password: hashedPassword,
        admin: admin ?? false,
        image: imageUrl || null,
        creator_id: auth.user.id,
        pending_password: true,
        pending_password_expires: pendingExpires,
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

    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup-password?userId=${user.id}&tenantId=${user.tenant_id}`;

    try {
      await sendPasswordSetupEmail({
        to: normalizedLogin,
        userName: name,
        tenantName: tenant.name,
        tenantLogo: tenant.logo,
        setupUrl,
      });
    } catch (_) {}

    return success("create", user);
  });
}
