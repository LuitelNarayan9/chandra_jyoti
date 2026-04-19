import { Resend } from "resend";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Helper to send ANY React Email template using Resend
export async function sendTemplateEmailResend({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: React.ReactElement;
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [to],
      subject: subject,
      react: template,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send template email via Resend:", error);
    return { success: false, error };
  }
}

export { resend };
