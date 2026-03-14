import { NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop();
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
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
