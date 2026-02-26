import {LogModule} from "@/src/lib/logger";
import {prisma} from "@/src/lib/prisma";
import {generatePresignedUploadUrl} from "@/src/lib/r2";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/upload/presign";

export async function POST(req: NextRequest) {
  return withAuth(LogModule.UPLOAD, ROUTE, async ({auth, success, error}) => {
    const {folder, fileName, fileType, fileSize} = await req.json();

    if (!folder || !fileName || !fileSize) {
      return error("api.errors.missingRequiredFields", 400, {folder, fileName, fileSize});
    }

    const tenant = await prisma.tenant.findUnique({
      where: {id: auth.tenant_id},
      select: {max_file_size_in_mbs: true},
    });

    const maxSizeBytes = (tenant?.max_file_size_in_mbs ?? 10) * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return error("products.files.fileTooLarge", 400, {fileSize, maxSizeBytes});
    }

    const timestamp = Date.now();
    const sanitizedName = (fileName as string).replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${auth.tenant_id}/${timestamp}-${sanitizedName}`;
    const resolvedFileType = fileType || "application/octet-stream";

    const presignedUrl = await generatePresignedUploadUrl(key, resolvedFileType);
    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    return success("get", {presignedUrl, key, url});
  });
}
