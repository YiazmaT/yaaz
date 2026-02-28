import {prismaUnscoped} from "@/src/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import * as bcrypt from "bcrypt";

// export async function POST(req: NextRequest) {
//   try {
//     const {name, login, password, admin} = await req.json();

//     if (!name || !login || !password) {
//       return NextResponse.json({error: "api.errors.missingRequiredFields"}, {status: 400});
//     }

//     const existing = await prismaUnscoped.yaazUser.findUnique({where: {login: login.trim().toLowerCase()}});
//     if (existing) {
//       return NextResponse.json({error: "api.errors.alreadyExists"}, {status: 409});
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prismaUnscoped.yaazUser.create({
//       data: {
//         name,
//         login: login.trim().toLowerCase(),
//         password: hashedPassword,
//         admin: admin ?? false,
//       },
//     });

//     return NextResponse.json({data: {id: user.id, name: user.name, login: user.login, admin: user.admin}}, {status: 201});
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({error: "api.errors.somethingWentWrong"}, {status: 500});
//   }
// }

// curl -X POST http://localhost:3000/api/yaaz/user/create \
//     -H "Content-Type: application/json" \
//     -d '{"name":"Admin","login":"admin@yaaz.com","password":"yourpassword","admin":true}'
