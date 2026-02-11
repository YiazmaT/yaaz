import {PackageType} from "@prisma/client";
import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {uploadToR2} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest, NextResponse} from "next/server";

const ROUTE = "/api/package/create";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.PACKAGE, ROUTE, async (auth, log, error) => {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as PackageType;
    const min_stock = formData.get("min_stock") as string | null;
    const image = formData.get("image") as File | null;

    if (!name || !type) return error("api.errors.missingRequiredFields", 400);

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const uploadResult = await uploadToR2(image, "packages", auth.tenant_id);
      if (!uploadResult.success) return error("api.errors.uploadFailed", 400, uploadResult);
      imageUrl = uploadResult.url!;
    }

    const pkg = await prisma.package.create({
      data: {
        tenant_id: auth.tenant_id,
        name,
        description: description || null,
        type,
        min_stock: min_stock || "0",
        image: imageUrl,
        creator_id: auth.user.id,
      },
    });

    log("create", {content: pkg});

    return NextResponse.json({success: true, package: pkg}, {status: 201});
  });
}
