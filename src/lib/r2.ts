import {S3Client, PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import {prisma} from "@/src/lib/prisma";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export async function uploadToR2(file: File, folder: string, tenantId: string): Promise<UploadResult> {
  try {
    const tenant = await prisma.tenant.findUnique({where: {id: tenantId}, select: {max_file_size_in_mbs: true}});
    const maxSizeBytes = (tenant?.max_file_size_in_mbs ?? 10) * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {success: false, error: "FILE_TOO_LARGE"};
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${tenantId}/${timestamp}-${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function extractR2KeyFromUrl(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl || !url.startsWith(publicUrl)) return null;
  return url.replace(`${publicUrl}/`, "");
}

export async function deleteFromR2(key: string, tenantId: string): Promise<boolean> {
  try {
    if (!key.includes(`/${tenantId}/`)) {
      console.error("R2 delete error: tenant_id mismatch");
      return false;
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    console.error("R2 delete error:", error);
    return false;
  }
}

export async function noTenantUploadToR2(file: File, folder: string): Promise<UploadResult> {
  //only for system stuff.
  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${timestamp}-${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
