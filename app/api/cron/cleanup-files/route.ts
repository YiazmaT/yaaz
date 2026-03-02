import {prisma} from "@/src/lib/prisma";
import {hardDeleteFromR2Key} from "@/src/lib/r2";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({error: "Unauthorized"}, {status: 401});
  }

  const now = new Date();
  const files = await prisma.fileToDelete.findMany({where: {delete_date: {lte: now}}});

  let deleted = 0;
  let failed = 0;

  for (const file of files) {
    const ok = await hardDeleteFromR2Key(file.key);
    if (ok) {
      await prisma.fileToDelete.delete({where: {id: file.id}});
      deleted++;
    } else {
      failed++;
    }
  }

  return Response.json({deleted, failed, total: files.length});
}
