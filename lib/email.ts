import { Resend } from "resend";
import { WelcomeEmail } from "./emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "MyHomeStyler <hello@myhomestyler.com>";

export async function sendWelcomeEmail(to: string, name: string) {
    await resend.emails.send({
        from: FROM,
        to,
        subject: "Welcome to MyHomeStyler ✦",
        react: WelcomeEmail({ name }),
    });
}
