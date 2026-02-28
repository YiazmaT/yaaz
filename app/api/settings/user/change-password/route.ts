import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {withAuth} from "@/src/lib/route-handler";
import {PASSWORD_REGEX} from "@/src/lib/password-rules";
import * as bcrypt from "bcrypt";
import {NextRequest} from "next/server";

const ROUTE = "/api/settings/user/change-password";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.USER, ROUTE, async ({auth, success, error}) => {
    const {currentPassword, newPassword, confirmPassword} = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return error("api.errors.missingRequiredFields", 400);
    }

    if (newPassword !== confirmPassword) {
      return error("setupPassword.errors.passwordMismatch", 400);
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return error("setupPassword.errors.weakPassword", 400);
    }

    const user = await prisma.user.findUnique({
      where: {id: auth.user.id, tenant_id: auth.tenant_id},
      select: {id: true, password: true},
    });

    if (!user) return error("api.errors.notFound", 404);

    const currentMatches = await bcrypt.compare(currentPassword, user.password);
    if (!currentMatches) {
      return error("profile.errors.wrongCurrentPassword", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {id: user.id, tenant_id: auth.tenant_id},
      data: {password: hashedPassword},
    });

    return success("update", null);
  });
}
