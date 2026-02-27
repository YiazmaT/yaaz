import {LogModule} from "@/src/lib/logger";
import {prisma, prismaUnscoped} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import * as bcrypt from "bcrypt";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/update";

export async function PUT(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success, error}) => {
    const {id, name, login, password, admin, imageUrl} = await req.json();

    if (!id || !name || !login) return error("api.errors.missingRequiredFields", 400);

    const normalizedLogin = login.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({where: {id, tenant_id: auth.tenant_id}});
    if (!existingUser) return error("api.errors.notFound", 404);

    const loginTaken = await prismaUnscoped.user.findFirst({where: {login: normalizedLogin}});
    if (loginTaken && loginTaken.id !== id) return error("users.errors.loginAlreadyExists", 400);

    const updateData: any = {
      name,
      login: normalizedLogin,
      admin: existingUser.owner ? existingUser.admin : (admin ?? false),
      last_edit_date: new Date(),
      last_editor_id: auth.user.id,
    };

    if (imageUrl !== undefined) {
      updateData.image = imageUrl;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const before = {name: existingUser.name, login: existingUser.login, admin: existingUser.admin};

    const user = await prisma.user.update({
      where: {id, tenant_id: auth.tenant_id},
      data: updateData,
      select: {
        id: true,
        tenant_id: true,
        name: true,
        login: true,
        admin: true,
        owner: true,
        image: true,
        create_date: true,
        last_edit_date: true,
      },
    });

    return success("update", user, {before, after: {name: user.name, login: user.login, admin: user.admin}});
  });
}
