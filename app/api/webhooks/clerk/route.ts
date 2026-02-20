import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // 1. Get Svix headers for verification
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // 2. Verify webhook signature
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // 3. Handle events
  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      await db.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address ?? "",
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          avatar: image_url,
          role: "MEMBER",
        },
      });
      console.log(`✅ User created in DB: ${id}`);
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url, banned } =
        event.data;
      await db.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          avatar: image_url ?? undefined,
          isActive: !banned,
        },
      });
      console.log(`✅ User updated in DB: ${id}`);
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        await db.user.update({
          where: { clerkId: id },
          data: { isActive: false },
        });
        console.log(`✅ User soft-deleted in DB: ${id}`);
      }
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
