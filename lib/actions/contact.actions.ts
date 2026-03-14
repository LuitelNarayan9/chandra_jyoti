"use server";

import { db } from "@/lib/db";
import { ContactFormSchema, ContactFormValues } from "@/lib/validations/contact";
import { revalidatePath } from "next/cache";

export async function submitContactForm(input: ContactFormValues) {
  try {
    const validated = ContactFormSchema.parse(input);

    const submission = await db.contactSubmission.create({
      data: {
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
        // Optional: handle attachment if needed, here we skip it
      },
    });

    // Optional: Send an email notification to admins using Resend here
    // e.g. await sendContactEmail(submission);

    // Revalidate the admin contact submissions page so new submissions show up
    revalidatePath("/admin/contact-submissions");

    return { 
      success: true, 
      data: submission, 
      message: "We've received your message and will get back to you soon!" 
    };
  } catch (error: unknown) {
    console.error("Error submitting contact form:", error);
    return {
        success: false,
        error: "Failed to submit message. Please try again later.",
    };
  }
}
