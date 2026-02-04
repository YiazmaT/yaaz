import {authenticateRequest} from "@/src/lib/auth";
import {logCreate, logCritical, logError, LogModule, LogSource} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import * as bcrypt from "bcrypt";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/user/create";

export async function POST(req: NextRequest) {
  // const auth = await authenticateRequest(LogModule.USER, ROUTE);
  // if (auth.error) return auth.error;

  try {
    //   const {name, login, password, admin, tenant_id} = await req.json();
    //   if (!name || !login || !password || !tenant_id) {
    //     // logError({
    //     //   module: LogModule.USER,
    //     //   source: LogSource.API,
    //     //   message: "api.errors.missingRequiredFields",
    //     //   route: ROUTE,
    //     //   userId: auth.user!.id,
    //     // });
    //     return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
    //   }
    //   const normalizedLogin = login.trim().toLowerCase();
    //   const existingUser = await prisma.user.findFirst({
    //     where: {login: normalizedLogin},
    //   });
    //   if (existingUser) {
    //     // logError({
    //     //   module: LogModule.USER,
    //     //   source: LogSource.API,
    //     //   message: "api.errors.userAlreadyExists",
    //     //   content: {login: normalizedLogin},
    //     //   route: ROUTE,
    //     //   userId: auth.user!.id,
    //     // });
    //     return NextResponse.json({error: "api.errors.userAlreadyExists"}, {status: 400});
    //   }
    //   const tenant = await prisma.tenant.findUnique({
    //     where: {id: tenant_id},
    //   });
    //   if (!tenant) {
    //     // logError({
    //     //   module: LogModule.USER,
    //     //   source: LogSource.API,
    //     //   message: "api.errors.tenantNotFound",
    //     //   content: {tenant_id},
    //     //   route: ROUTE,
    //     //   userId: auth.user!.id,
    //     // });
    //     return NextResponse.json({error: "api.errors.tenantNotFound"}, {status: 400});
    //   }
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   const user = await prisma.user.create({
    //     data: {
    //       tenant_id,
    //       name,
    //       login: normalizedLogin,
    //       password: hashedPassword,
    //       admin: admin ?? false,
    //     },
    //   });
    //   const userResponse = {
    //     id: user.id,
    //     tenant_id: user.tenant_id,
    //     name: user.name,
    //     login: user.login,
    //     admin: user.admin,
    //   };
    //   // logCreate({module: LogModule.USER, source: LogSource.API, content: userResponse, route: ROUTE, userId: auth.user!.id, tenantId: auth.tenant_id});
    //   return NextResponse.json({success: true, user: userResponse}, {status: 201});
  } catch (error) {
    await logCritical({module: LogModule.USER, source: LogSource.API, error, route: ROUTE});
    return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
  }
}

/*
curl -X POST http://localhost:3000/api/user/create \
     -H "Content-Type: application/json" \
     -d '{"name":"Eymar","login":"paodemato.oficial@gmail.com","password":"","admin":true, "tenant_id":"c7b87076-18eb-4220-a40b-791c43187422"}'
     */
