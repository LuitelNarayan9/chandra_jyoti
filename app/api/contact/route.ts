import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ContactNotificationEmail } from "@/components/emails/ContactNotificationEmail";
import { ContactConfirmationEmail } from "@/components/emails/ContactConfirmationEmail";
import { resend } from "@/lib/resend-mailer";
import { getPostHogClient } from "@/lib/posthog-server";
import { ContactFormSchema } from "@/lib/validations/contact";

/* ── In-memory rate limiter (per IP, 3 requests / 15 min) ── */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_BODY_SIZE_BYTES = 8 * 1024; // Contact payloads should be tiny.

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

// Cleanup stale entries every 30 minutes to prevent memory leak
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (now > entry.resetAt) hits.delete(ip);
    }
  },
  30 * 60 * 1000
).unref?.();

export async function POST(req: Request) {
  try {
    // Rate limit by client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type");
    if (!contentType?.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json." },
        { status: 415 }
      );
    }

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Contact form payload is too large." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const parsed = ContactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || "Invalid contact form data.",
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, phone } = parsed.data;
    const emailSubject = subject || "No Subject";
    const fromAddress = process.env.ZEPTOMAIL_FROM_EMAIL!;
    const fromName = process.env.ZEPTOMAIL_FROM_NAME!;
    const ownerEmail = process.env.CONTACT_OWNER_EMAIL!;

    // Indian timezone timestamp
    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    // 1. Save to database
    await db.contactSubmission.create({
      data: {
        name,
        email,
        subject: emailSubject,
        message,
      },
    });

    await Promise.all([
      // Email 1: Notification to site owner
      resend.emails.send({
        from: `${fromName} <${fromAddress}>`,
        to: [ownerEmail],
        subject: `New Contact Form Submission from ${name}`,
        react: ContactNotificationEmail({
          name,
          email,
          subject: emailSubject,
          message,
          phone,
          submittedAt,
        }),
      }),

      // Email 2: Auto-reply confirmation to user
      resend.emails.send({
        from: `${fromName} <${fromAddress}>`,
        to: [email],
        subject: `Thank you for contacting us, ${name}!`,
        react: ContactConfirmationEmail({
          name,
          message,
        }),
      }),
    ]);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: "contact_form_submitted",
      properties: {
        has_phone: !!phone,
        has_subject: !!subject,
      },
    });
    await posthog.shutdown();

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: unknown) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
