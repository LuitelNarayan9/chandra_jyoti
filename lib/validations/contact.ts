import { z } from "zod";

export const ContactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name must not exceed 80 characters."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254, "Email must not exceed 254 characters."),
    phone: z
      .string()
      .trim()
      .max(30, "Phone number must not exceed 30 characters.")
      .optional(),
    subject: z
      .string()
      .trim()
      .min(5, "Subject must be at least 5 characters.")
      .max(120, "Subject must not exceed 120 characters."),
    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters.")
      .max(2000, "Message must not exceed 2000 characters."),
  })
  .strict();

export type ContactFormValues = z.infer<typeof ContactFormSchema>;
