import { NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs/server";

function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "image/jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return "image/png";
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  )
    return "image/gif";
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  )
    return "image/webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedType = detectMimeType(buffer);

    if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };

    const safeExt = mimeToExt[detectedType];
    const uniqueFilename = safeExt
      ? `${crypto.randomUUID()}.${safeExt}`
      : crypto.randomUUID();
    const key = `blog-media/${uniqueFilename}`;

    const publicUrl = await uploadToS3(buffer, key, detectedType);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
