import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sendTemplateEmail } from "@/lib/mailer";
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";

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
  const body = await req.text();

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

      const email = email_addresses[0]?.email_address ?? "";
      const firstName = first_name ?? "";

      // Upsert to be idempotent if Clerk retries the webhook
      try {
        await db.user.upsert({
          where: { clerkId: id },
          create: {
            clerkId: id,
            email: email,
            firstName: firstName,
            lastName: last_name ?? "",
            avatar: image_url,
            role: "MEMBER",
          },
          update: {},
        });
        console.log(`✅ User created in DB: ${id}`);
      } catch (err) {
        console.error(`Failed to create user in DB: ${id}`, err);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Trigger Welcome Email (non-blocking — failure won't affect DB)
      try {
        if (email) {
          console.log(`Sending Welcome Email to: ${email}`);
          await sendTemplateEmail({
            to: email,
            subject: "Welcome to Chandra Jyoti Sanstha! 🎉",
            template: WelcomeEmail({ firstName }),
          });
          console.log(`✅ Welcome Email sent successfully to: ${email}`);
        }
      } catch (e) {
        console.error(`Failed to send Welcome Email to ${email}`, e);
      }
      break;
    }

    case "user.updated": {
      const data = event.data as any;
      const { id, email_addresses, first_name, last_name, image_url, banned } = data;

      try {
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
      } catch (err) {
        console.error(`Failed to update user in DB: ${id}`, err);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        try {
          await db.user.update({
            where: { clerkId: id },
            data: { isActive: false },
          });
          console.log(`✅ User soft-deleted in DB: ${id}`);
        } catch (err) {
          console.error(`Failed to soft-delete user in DB: ${id}`, err);
          return NextResponse.json({ received: true }, { status: 200 });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
