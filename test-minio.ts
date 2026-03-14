import "dotenv/config";
import { uploadToS3 } from "./lib/s3";

async function main() {
  try {
    console.log("Testing MinIO upload to endpoint:", process.env.MINIO_ENDPOINT);
    const buffer = Buffer.from("Hello MinIO!");
    const url = await uploadToS3(buffer, "test-upload.txt", "text/plain");
    console.log("Upload successful! URL:", url);
  } catch (error) {
    console.error("Upload failed with error:", error);
  }
}

main();
