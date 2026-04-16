import { NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs/server";

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    const parts = file.name.split(".");
    const ext = parts.length > 1 ? parts.pop() : "";
    const uniqueFilename = ext
      ? `${crypto.randomUUID()}.${ext}`
      : crypto.randomUUID();
    const key = `blog-media/${uniqueFilename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToS3(buffer, key, file.type);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
