import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT!,
  region: "us-east-1", // MinIO ignores this but SDK requires it
  forcePathStyle: true, // Required for MinIO — uses path style instead of subdomain
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
});

/**
 * Upload a file buffer to MinIO.
 * @returns The public URL of the uploaded file.
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  // MinIO public URL format (path style)
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/${encodedKey}`;
}

/**
 * Delete a file from MinIO by its key.
 */
export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.MINIO_BUCKET_NAME!,
      Key: key,
    })
  );
}

/**
 * Generate a presigned URL for temporary read access.
 * @param key - The object key.
 * @param expiresIn - Expiry in seconds (default: 1 hour).
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}