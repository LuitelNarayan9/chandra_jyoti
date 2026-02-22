import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mailClient } from "@/lib/mailer";
import { render } from "@react-email/render";
import { ContactNotificationEmail } from "@/components/emails/ContactNotificationEmail";
import { ContactConfirmationEmail } from "@/components/emails/ContactConfirmationEmail";

/* ── In-memory rate limiter (per IP, 3 requests / 15 min) ── */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now > entry.resetAt) hits.delete(ip);
  }
}, 30 * 60 * 1000).unref?.();

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

    const body = await req.json();
    const { name, email, subject, message, phone } = body;

    // Validate fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

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

    // 2. Render React Email templates to HTML
    const ownerHtml = await render(
      ContactNotificationEmail({
        name,
        email,
        subject: emailSubject,
        message,
        phone,
        submittedAt,
      })
    );

    const userHtml = await render(
      ContactConfirmationEmail({
        name,
        message,
      })
    );

    // 3. Send both emails in parallel
    await Promise.all([
      // Email 1: Notification to site owner
      mailClient.sendMail({
        from: { address: fromAddress, name: fromName },
        to: [{ email_address: { address: ownerEmail, name: "Owner" } }],
        subject: `New Contact Form Submission from ${name}`,
        htmlbody: ownerHtml,
      }),

      // Email 2: Auto-reply confirmation to user
      mailClient.sendMail({
        from: { address: fromAddress, name: fromName },
        to: [{ email_address: { address: email, name: name } }],
        subject: `Thank you for contacting us, ${name}!`,
        htmlbody: userHtml,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}