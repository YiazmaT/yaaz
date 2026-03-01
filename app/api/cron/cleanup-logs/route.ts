import {prisma} from "@/src/lib/prisma";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({error: "Unauthorized"}, {status: 401});
  }

  const cutoff = new Date(Date.now() - ONE_YEAR_MS);

  const {count} = await prisma.log.deleteMany({
    where: {create_date: {lt: cutoff}},
  });

  return Response.json({deleted: count, cutoff});
}
