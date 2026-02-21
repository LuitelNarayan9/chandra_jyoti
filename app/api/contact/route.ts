import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mailClient } from "@/lib/mailer";
import { render } from "@react-email/render";
import { ContactNotificationEmail } from "@/components/emails/ContactNotificationEmail";
import { ContactConfirmationEmail } from "@/components/emails/ContactConfirmationEmail";

export async function POST(req: Request) {
  try {
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