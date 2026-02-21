import { SendMailClient } from "zeptomail";

const url = process.env.ZEPTOMAIL_API_URL!;
const token = process.env.ZEPTOMAIL_TOKEN!;

export const mailClient = new SendMailClient({ url, token });
