import { SendMailClient } from "zeptomail";

const url = process.env.ZEPTOMAIL_API_URL!;
const token = process.env.ZEPTOMAIL_TOKEN!;

import { render } from "@react-email/components";

export const mailClient = new SendMailClient({ url, token });

// Helper to send ANY React Email template using ZeptoMail
export async function sendTemplateEmail({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: React.ReactElement;
}) {
  try {
    const htmlString = await render(template);
    
    await mailClient.sendMail({
      from: {
        address: process.env.ZEPTOMAIL_FROM_EMAIL!,
        name: process.env.ZEPTOMAIL_FROM_NAME!,
      },
      to: [
        {
          email_address: {
            address: to,
            name: to.split("@")[0] || to,
          },
        },
      ],
      subject: subject,
      htmlbody: htmlString,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to send template email via ZeptoMail:", error);
    return { success: false, error };
  }
}
